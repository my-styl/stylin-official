import { z } from "zod";

import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators";

export type VendorGetBrandParamsType = z.infer<typeof VendorGetBrandParams>;
export const VendorGetBrandParams = createSelectParams();

export type VendorGetBrandsParamsType = z.infer<typeof VendorGetBrandsParams>;
export const VendorGetBrandsParams = createFindParams({
  offset: 0,
  limit: 50,
});

/**
 * @schema VendorCreateBrand
 * type: object
 * required:
 *   - name
 *   - handle
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
export type VendorCreateBrandType = z.infer<typeof VendorCreateBrand>;
export const VendorCreateBrand = z.object({
  name: z.preprocess((val: string) => val?.trim(), z.string().min(1)),
  handle: z.preprocess((val: string) => val?.trim(), z.string().min(1)),
  description: z.string().nullish(),
  logo: z.string().nullish(),
});

/**
 * @schema VendorUpdateBrand
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
export type VendorUpdateBrandType = z.infer<typeof VendorUpdateBrand>;
export const VendorUpdateBrand = z.object({
  name: z.preprocess((val: string) => val?.trim(), z.string().min(1)).optional(),
  handle: z
    .preprocess((val: string) => val?.trim(), z.string().min(1))
    .optional(),
  description: z.string().nullish(),
  logo: z.string().nullish(),
});
