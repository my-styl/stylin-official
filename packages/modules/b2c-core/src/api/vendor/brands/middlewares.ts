import {
  MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";

import { vendorBrandQueryConfig } from "./query-config";
import {
  VendorCreateBrand,
  VendorGetBrandParams,
  VendorGetBrandsParams,
  VendorUpdateBrand,
} from "./validators";

export const vendorBrandsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/vendor/brands",
    middlewares: [
      validateAndTransformQuery(
        VendorGetBrandsParams,
        vendorBrandQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/brands",
    middlewares: [
      validateAndTransformBody(VendorCreateBrand),
      validateAndTransformQuery(
        VendorGetBrandParams,
        vendorBrandQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/vendor/brands/:id",
    middlewares: [
      validateAndTransformQuery(
        VendorGetBrandParams,
        vendorBrandQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendor/brands/:id",
    middlewares: [
      validateAndTransformBody(VendorUpdateBrand),
      validateAndTransformQuery(
        VendorGetBrandParams,
        vendorBrandQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/vendor/brands/:id",
    middlewares: [],
  },
];
