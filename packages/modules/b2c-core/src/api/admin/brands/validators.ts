import { z } from "zod";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export type AdminGetBrandsParamsType = z.infer<typeof AdminGetBrandsParams>;
export const AdminGetBrandsParams = createFindParams({
  offset: 0,
  limit: 50,
});

/**
 * @schema AdminUpdateBrand
 * type: object
 * properties:
 *   name:
 *     type: string
 *     description: The name of the brand.
 *     minLength: 1
 *   handle:
 *     type: string
 *     description: A unique handle/slug for the brand.
 *     minLength: 1
 *   description:
 *     type: string
 *     nullable: true
 *     description: A description of the brand.
 *   logo:
 *     type: string
 *     nullable: true
 *     description: URL to the brand's logo.
 */
export type AdminUpdateBrandType = z.infer<typeof AdminUpdateBrand>;
export const AdminUpdateBrand = z.object({
  name: z.preprocess((val: string) => val?.trim(), z.string().min(1)).optional(),
  handle: z
    .preprocess((val: string) => val?.trim(), z.string().min(1))
    .optional(),
  description: z.string().nullish(),
  logo: z.string().nullish(),
});
