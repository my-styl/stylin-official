import { MiddlewareRoute, authenticate } from "@medusajs/framework";

import { storeBrandsMiddlewares } from "./brands/middlewares";
import { storeCartsMiddlewares } from "./carts/middlewares";
import { storeOrderSetMiddlewares } from "./order-set/middlewares";
import { storeProductsMiddlewares } from "./products/middlewares";
import { storeReturnsMiddlewares } from "./returns/middlewares";
import { storeSellerMiddlewares } from "./seller/middlewares";
import { storeShippingOptionRoutesMiddlewares } from "./shipping-options/middlewares";
import { storeWishlistMiddlewares } from "./wishlist/middlewares";

export const storeMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/reviews/*",
    middlewares: [authenticate("customer", ["bearer", "session"])],
  },
  {
    matcher: "/store/return-request/*",
    middlewares: [authenticate("customer", ["bearer", "session"])],
  },
  ...storeBrandsMiddlewares,
  ...storeCartsMiddlewares,
  ...storeOrderSetMiddlewares,
  ...storeProductsMiddlewares,
  ...storeSellerMiddlewares,
  ...storeShippingOptionRoutesMiddlewares,
  ...storeReturnsMiddlewares,
  ...storeWishlistMiddlewares,
];
