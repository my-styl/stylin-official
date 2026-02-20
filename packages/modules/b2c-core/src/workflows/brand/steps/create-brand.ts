import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";

import { BRAND_MODULE } from "../../../modules/brand";
import BrandModuleService from "../../../modules/brand/service";
import { SELLER_MODULE } from "../../../modules/seller";

type CreateBrandInput = {
  name: string;
  handle: string;
  description?: string | null;
  logo?: string | null;
  seller_id: string;
};

export const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandInput, { container }) => {
    const brandService: BrandModuleService = container.resolve(BRAND_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    const { seller_id, ...brandData } = input;

    const brand = await brandService.createBrands(brandData);

    await link.create({
      [SELLER_MODULE]: {
        seller_id,
      },
      [BRAND_MODULE]: {
        brand_id: brand.id,
      },
    });

    return new StepResponse(brand, { brand_id: brand.id, seller_id });
  },
  async (data, { container }) => {
    if (!data) return;

    const brandService: BrandModuleService = container.resolve(BRAND_MODULE);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    await link.dismiss({
      [SELLER_MODULE]: {
        seller_id: data.seller_id,
      },
      [BRAND_MODULE]: {
        brand_id: data.brand_id,
      },
    });

    await brandService.deleteBrands(data.brand_id);
  }
);
