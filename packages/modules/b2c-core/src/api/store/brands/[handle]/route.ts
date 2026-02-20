import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

/**
 * @oas [get] /store/brands/{handle}
 * operationId: "StoreGetBrandByHandle"
 * summary: "Get Brand by Handle"
 * description: "Retrieves a brand by its handle."
 * parameters:
 *   - in: path
 *     name: handle
 *     required: true
 *     description: The handle of the brand
 *     schema:
 *       type: string
 *   - name: fields
 *     in: query
 *     schema:
 *       type: string
 *     required: false
 *     description: Comma-separated fields to include in the response.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             brand:
 *               $ref: "#/components/schemas/StoreBrand"
 * tags:
 *   - Store Brands
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [brand],
  } = await query.graph({
    entity: "brand",
    fields: req.queryConfig.fields,
    filters: {
      handle: req.params.handle,
    },
  });

  if (!brand) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Brand with handle "${req.params.handle}" not found.`
    );
  }

  res.json({
    brand,
  });
};
