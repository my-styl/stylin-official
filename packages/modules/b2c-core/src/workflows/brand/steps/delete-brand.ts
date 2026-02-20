import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";

import { BRAND_MODULE } from "../../../modules/brand";
import { SELLER_MODULE } from "../../../modules/seller";
import BrandModuleService from "../../../modules/brand/service";
import productBrand from "../../../links/product-brand";
import sellerBrand from "../../../links/seller-brand";

export const deleteBrandStep = createStep(
  "delete-brand",
  async (input: { id: string }, { container }) => {
    const brandService: BrandModuleService = container.resolve(BRAND_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const brand = await brandService.retrieveBrand(input.id);

    // Dismiss brand-product links
    const { data: productLinks } = await query.graph({
      entity: productBrand.entryPoint,
      fields: ["product_id"],
      filters: { brand_id: input.id },
    });

    if (productLinks.length) {
      await Promise.all(
        productLinks.map((pl: any) =>
          link.dismiss({
            [BRAND_MODULE]: { brand_id: input.id },
            [Modules.PRODUCT]: { product_id: pl.product_id },
          })
        )
      );
    }

    // Dismiss seller-brand links
    const { data: sellerLinks } = await query.graph({
      entity: sellerBrand.entryPoint,
      fields: ["seller_id"],
      filters: { brand_id: input.id },
    });

    if (sellerLinks.length) {
      await Promise.all(
        sellerLinks.map((sl: any) =>
          link.dismiss({
            [SELLER_MODULE]: { seller_id: sl.seller_id },
            [BRAND_MODULE]: { brand_id: input.id },
          })
        )
      );
    }

    await brandService.deleteBrands(input.id);

    return new StepResponse(undefined, brand);
  },
  async (brand, { container }) => {
    if (!brand) return;

    const brandService: BrandModuleService = container.resolve(BRAND_MODULE);

    await brandService.createBrands({
      id: brand.id,
      name: brand.name,
      handle: brand.handle,
      description: brand.description,
      logo: brand.logo,
    });
  }
);
