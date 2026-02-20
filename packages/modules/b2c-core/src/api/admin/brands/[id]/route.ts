import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

import { BRAND_MODULE } from "../../../../modules/brand";
import BrandModuleService from "../../../../modules/brand/service";
import {
  updateBrandWorkflow,
  deleteBrandWorkflow,
} from "../../../../workflows/brand";
import { AdminUpdateBrandType } from "../validators";

/**
 * @oas [get] /admin/brands/{id}
 * operationId: "AdminGetBrand"
 * summary: "Get a Brand"
 * description: "Retrieves a brand by its ID."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     description: The ID of the brand.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             brand:
 *               $ref: "#/components/schemas/AdminBrand"
 * tags:
 *   - Admin Brands
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE);

  const brand = await brandService.retrieveBrand(req.params.id);

  res.json({ brand });
};

/**
 * @oas [post] /admin/brands/{id}
 * operationId: "AdminUpdateBrand"
 * summary: "Update a Brand"
 * description: "Updates a brand by its ID."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     description: The ID of the brand.
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         $ref: "#/components/schemas/AdminUpdateBrand"
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             brand:
 *               $ref: "#/components/schemas/AdminBrand"
 * tags:
 *   - Admin Brands
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const POST = async (
  req: MedusaRequest<AdminUpdateBrandType>,
  res: MedusaResponse
) => {
  const { result } = await updateBrandWorkflow.run({
    container: req.scope,
    input: {
      id: req.params.id,
      ...req.validatedBody,
    },
  });

  res.json({ brand: result });
};

/**
 * @oas [delete] /admin/brands/{id}
 * operationId: "AdminDeleteBrand"
 * summary: "Delete a Brand"
 * description: "Deletes a brand by its ID."
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     description: The ID of the brand.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The ID of the deleted brand.
 *             object:
 *               type: string
 *               description: The type of the deleted object.
 *             deleted:
 *               type: boolean
 *               description: Whether the brand was deleted.
 * tags:
 *   - Admin Brands
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  await deleteBrandWorkflow.run({
    container: req.scope,
    input: { id: req.params.id },
  });

  res.json({
    id: req.params.id,
    object: "brand",
    deleted: true,
  });
};
