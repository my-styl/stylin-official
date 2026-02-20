import { z } from "zod";

import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export type StoreGetBrandsParamsType = z.infer<typeof StoreGetBrandsParams>;
export const StoreGetBrandsParams = createFindParams({
  offset: 0,
  limit: 50,
});
