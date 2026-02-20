import { defineLink } from "@medusajs/framework/utils";

import SellerModule from "../modules/seller";
import BrandModule from "../modules/brand";

export default defineLink(SellerModule.linkable.seller, {
  linkable: BrandModule.linkable.brand,
  isList: true,
});
