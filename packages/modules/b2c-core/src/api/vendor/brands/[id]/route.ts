import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

import { fetchSellerByAuthActorId } from "../../../../shared/infra/http/utils";
import sellerBrand from "../../../../links/seller-brand";
import {
  updateBrandWorkflow,
  deleteBrandWorkflow,
} from "../../../../workflows/brand";
import { VendorUpdateBrandType } from "../validators";
import { BRAND_MODULE } from "../../../../modules/brand";
import BrandModuleService from "../../../../modules/brand/service";

const ensureBrandOwnership = async (
  brandId: string,
  sellerId: string,
  scope: any
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: links } = await query.graph({
    entity: sellerBrand.entryPoint,
    fields: ["brand_id"],
    filters: {
      seller_id: sellerId,
      brand_id: brandId,
    },
  });

  if (!links.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Brand with id ${brandId} not found for this seller.`
    );
  }
};

/**
 * @oas [get] /vendor/brands/{id}
 * operationId: "VendorGetBrand"
 * summary: "Get a Brand"
 * description: "Retrieves a brand by its ID for the authenticated vendor."
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
 *               $ref: "#/components/schemas/VendorBrand"
 * tags:
 *   - Vendor Brands
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const seller = await fetchSellerByAuthActorId(
    req.auth_context?.actor_id,
    req.scope
  );

  await ensureBrandOwnership(req.params.id, seller.id, req.scope);

  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE);
  const brand = await brandService.retrieveBrand(req.params.id);

  res.json({ brand });
};

/**
 * @oas [post] /vendor/brands/{id}
 * operationId: "VendorUpdateBrand"
 * summary: "Update a Brand"
 * description: "Updates a brand by its ID for the authenticated vendor."
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
 *         $ref: "#/components/schemas/VendorUpdateBrand"
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             brand:
 *               $ref: "#/components/schemas/VendorBrand"
 * tags:
 *   - Vendor Brands
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<VendorUpdateBrandType>,
  res: MedusaResponse
) => {
  const seller = await fetchSellerByAuthActorId(
    req.auth_context?.actor_id,
    req.scope
  );

  await ensureBrandOwnership(req.params.id, seller.id, req.scope);

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
 * @oas [delete] /vendor/brands/{id}
 * operationId: "VendorDeleteBrand"
 * summary: "Delete a Brand"
 * description: "Deletes a brand by its ID for the authenticated vendor."
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
 *   - Vendor Brands
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const seller = await fetchSellerByAuthActorId(
    req.auth_context?.actor_id,
    req.scope
  );

  await ensureBrandOwnership(req.params.id, seller.id, req.scope);

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
