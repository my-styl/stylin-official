import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { fetchSellerByAuthActorId } from "../../../shared/infra/http/utils";
import sellerBrand from "../../../links/seller-brand";
import { createBrandWorkflow } from "../../../workflows/brand";
import { VendorCreateBrandType } from "./validators";

/**
 * @oas [get] /vendor/brands
 * operationId: "VendorListBrands"
 * summary: "List Brands"
 * description: "Retrieves a list of brands for the authenticated vendor."
 * x-authenticated: true
 * parameters:
 *   - name: offset
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *     description: The number of items to skip before starting to collect the result set.
 *   - name: limit
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *     description: The number of items to return.
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
 *             brands:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/VendorBrand"
 *             count:
 *               type: integer
 *               description: The total number of items available
 *             offset:
 *               type: integer
 *               description: The number of items skipped before these items
 *             limit:
 *               type: integer
 *               description: The number of items per page
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
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const seller = await fetchSellerByAuthActorId(
    req.auth_context?.actor_id,
    req.scope
  );

  const { data: sellerBrands } = await query.graph({
    entity: sellerBrand.entryPoint,
    fields: ["brand.*"],
    filters: {
      seller_id: seller.id,
    },
  });

  const brands = sellerBrands.map((link: any) => link.brand);

  res.json({
    brands,
    count: brands.length,
    offset: 0,
    limit: brands.length,
  });
};

/**
 * @oas [post] /vendor/brands
 * operationId: "VendorCreateBrand"
 * summary: "Create a Brand"
 * description: "Creates a new brand for the authenticated vendor."
 * x-authenticated: true
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         $ref: "#/components/schemas/VendorCreateBrand"
 * responses:
 *   "201":
 *     description: Created
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
  req: AuthenticatedMedusaRequest<VendorCreateBrandType>,
  res: MedusaResponse
) => {
  const seller = await fetchSellerByAuthActorId(
    req.auth_context?.actor_id,
    req.scope
  );

  const { result } = await createBrandWorkflow.run({
    container: req.scope,
    input: {
      ...req.validatedBody,
      seller_id: seller.id,
    },
  });

  res.status(201).json({ brand: result });
};
