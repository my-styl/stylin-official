import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const timeFromStr = req.query.time_from as string
    const timeToStr = req.query.time_to as string

    if (!timeFromStr || !timeToStr) {
      return res
        .status(400)
        .json({ message: "time_from and time_to are required" })
    }

    const timeFrom = new Date(timeFromStr)
    const timeTo = new Date(timeToStr)

    if (isNaN(timeFrom.getTime()) || isNaN(timeTo.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format for time_from or time_to" })
    }

    if (timeFrom > timeTo) {
      return res
        .status(400)
        .json({ message: "time_from must be before time_to" })
    }

    const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    const orders = await knex("order")
      .select(knex.raw(`DATE_TRUNC('DAY', "created_at") AS date`))
      .count("*")
      .whereBetween("created_at", [
        timeFrom.toISOString(),
        timeTo.toISOString(),
      ])
      .groupByRaw("date")
      .orderByRaw("date asc")

    const customers = await knex
      .with("customer_first_orders", (qb: any) => {
        qb.select("customer_id")
          .select(knex.raw("MIN(created_at) as first_order_date"))
          .from("order")
          .groupBy("customer_id")
      })
      .select(knex.raw(`DATE_TRUNC('DAY', "first_order_date") AS date`))
      .count("*")
      .from("customer_first_orders")
      .whereBetween("first_order_date", [
        timeFrom.toISOString(),
        timeTo.toISOString(),
      ])
      .groupByRaw("date")
      .orderByRaw("date asc")

    const sellers = await knex("seller")
      .select(knex.raw(`DATE_TRUNC('DAY', "created_at") AS date`))
      .count("*")
      .whereBetween("created_at", [
        timeFrom.toISOString(),
        timeTo.toISOString(),
      ])
      .groupByRaw("date")
      .orderByRaw("date asc")

    return res.json({ orders, customers, sellers })
  } catch (error) {
    console.error("Error fetching admin statistics:", error)
    return res
      .status(500)
      .json({ message: "Failed to fetch statistics" })
  }
}
