import { model } from "@medusajs/framework/utils";

export const Brand = model.define("brand", {
  id: model.id({ prefix: "brand" }).primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  description: model.text().nullable(),
  logo: model.text().nullable(),
});
