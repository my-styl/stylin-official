import { MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework";

import { storeBrandQueryConfig } from "./query-config";
import { StoreGetBrandsParams } from "./validators";

export const storeBrandsMiddlewares: MiddlewareRoute[] = [
  {
    methods: ["GET"],
    matcher: "/store/brands",
    middlewares: [
      validateAndTransformQuery(
        StoreGetBrandsParams,
        storeBrandQueryConfig.list
      ),
    ],
  },
  {
    methods: ["GET"],
    matcher: "/store/brands/:handle",
    middlewares: [
      validateAndTransformQuery(
        StoreGetBrandsParams,
        storeBrandQueryConfig.retrieve
      ),
    ],
  },
];
