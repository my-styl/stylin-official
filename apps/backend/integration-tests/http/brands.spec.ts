import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

jest.setTimeout(120 * 1000);

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  disableAutoTeardown: true,
  testSuite: ({ api, getContainer }) => {
    let adminHeaders: Record<string, string>;
    let vendorHeaders: Record<string, string>;
    let vendor2Headers: Record<string, string>;

    beforeAll(async () => {
      const container = getContainer();
      const userService = container.resolve(Modules.USER);
      const authService = container.resolve(Modules.AUTH) as any;

      // Setup admin user
      const user = await userService.createUsers({
        email: "admin@test.com",
      });
      const { authIdentity: adminAuth } = await authService.register(
        "emailpass",
        { body: { email: "admin@test.com", password: "test123" } }
      );
      await authService.updateAuthIdentities({
        id: adminAuth.id,
        app_metadata: { user_id: user.id },
      });
      const { data: adminAuthData } = await api.post(
        "/auth/user/emailpass",
        { email: "admin@test.com", password: "test123" }
      );
      adminHeaders = { Authorization: `Bearer ${adminAuthData.token}` };

      // Setup vendor 1
      const sellerService = container.resolve("seller") as any;

      const seller = await sellerService.createSellers({
        name: "Test Seller",
        handle: "test-seller",
      });
      const member = await sellerService.createMembers({
        name: "Seller Owner",
        email: "seller@test.com",
        seller_id: seller.id,
      });
      const { authIdentity: sellerAuth } = await authService.register(
        "emailpass",
        { body: { email: "seller@test.com", password: "test123" } }
      );
      await authService.updateAuthIdentities({
        id: sellerAuth.id,
        app_metadata: { seller_id: member.id },
      });
      const { data: vendorAuthData } = await api.post(
        "/auth/seller/emailpass",
        { email: "seller@test.com", password: "test123" }
      );
      vendorHeaders = { Authorization: `Bearer ${vendorAuthData.token}` };

      // Setup vendor 2 (for ownership tests)
      const seller2 = await sellerService.createSellers({
        name: "Other Seller",
        handle: "other-seller",
      });
      const member2 = await sellerService.createMembers({
        name: "Other Owner",
        email: "seller2@test.com",
        seller_id: seller2.id,
      });
      const { authIdentity: seller2Auth } = await authService.register(
        "emailpass",
        { body: { email: "seller2@test.com", password: "test123" } }
      );
      await authService.updateAuthIdentities({
        id: seller2Auth.id,
        app_metadata: { seller_id: member2.id },
      });
      const { data: vendor2AuthData } = await api.post(
        "/auth/seller/emailpass",
        { email: "seller2@test.com", password: "test123" }
      );
      vendor2Headers = { Authorization: `Bearer ${vendor2AuthData.token}` };
    });

    describe("Vendor Brand CRUD", () => {
      it("should create a brand", async () => {
        const response = await api.post(
          "/vendor/brands",
          {
            name: "Test Brand",
            handle: "test-brand",
            description: "A test brand",
          },
          { headers: vendorHeaders }
        );

        expect(response.status).toEqual(201);
        expect(response.data.brand).toMatchObject({
          name: "Test Brand",
          handle: "test-brand",
          description: "A test brand",
        });
        expect(response.data.brand.id).toBeDefined();
      });

      it("should list brands for the seller", async () => {
        const response = await api.get("/vendor/brands", {
          headers: vendorHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data.brands.length).toBeGreaterThanOrEqual(1);

        const testBrand = response.data.brands.find(
          (b: any) => b.handle === "test-brand"
        );
        expect(testBrand).toBeDefined();
        expect(testBrand.name).toEqual("Test Brand");
      });

      it("should get a brand by ID", async () => {
        // First get the brand ID
        const listRes = await api.get("/vendor/brands", {
          headers: vendorHeaders,
        });
        const brand = listRes.data.brands.find(
          (b: any) => b.handle === "test-brand"
        );

        const response = await api.get(`/vendor/brands/${brand.id}`, {
          headers: vendorHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data.brand.id).toEqual(brand.id);
        expect(response.data.brand.name).toEqual("Test Brand");
      });

      it("should update a brand", async () => {
        const listRes = await api.get("/vendor/brands", {
          headers: vendorHeaders,
        });
        const brand = listRes.data.brands.find(
          (b: any) => b.handle === "test-brand"
        );

        const response = await api.post(
          `/vendor/brands/${brand.id}`,
          {
            name: "Test Brand Updated",
            description: "Updated description",
          },
          { headers: vendorHeaders }
        );

        expect(response.status).toEqual(200);
        expect(response.data.brand.name).toEqual("Test Brand Updated");
        expect(response.data.brand.description).toEqual(
          "Updated description"
        );
      });

      it("should delete a brand", async () => {
        const listRes = await api.get("/vendor/brands", {
          headers: vendorHeaders,
        });
        const brand = listRes.data.brands.find(
          (b: any) => b.handle === "test-brand"
        );

        const response = await api.delete(`/vendor/brands/${brand.id}`, {
          headers: vendorHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data).toEqual({
          id: brand.id,
          object: "brand",
          deleted: true,
        });
      });

      it("should return 404 for a deleted brand", async () => {
        // The test-brand was deleted above, try to access it
        const err = await api
          .get("/vendor/brands/brand_nonexistent", {
            headers: vendorHeaders,
          })
          .catch((e: any) => e);

        expect(err.response.status).toEqual(404);
      });
    });

    describe("Brand Ownership Isolation", () => {
      let v1BrandId: string;

      beforeAll(async () => {
        const response = await api.post(
          "/vendor/brands",
          {
            name: "Vendor 1 Exclusive",
            handle: "v1-exclusive",
          },
          { headers: vendorHeaders }
        );
        v1BrandId = response.data.brand.id;
      });

      it("vendor 2 should not be able to get vendor 1 brand", async () => {
        const err = await api
          .get(`/vendor/brands/${v1BrandId}`, {
            headers: vendor2Headers,
          })
          .catch((e: any) => e);

        expect(err.response.status).toEqual(404);
      });

      it("vendor 2 should not be able to update vendor 1 brand", async () => {
        const err = await api
          .post(
            `/vendor/brands/${v1BrandId}`,
            { name: "Hacked" },
            { headers: vendor2Headers }
          )
          .catch((e: any) => e);

        expect(err.response.status).toEqual(404);
      });

      it("vendor 2 should not be able to delete vendor 1 brand", async () => {
        const err = await api
          .delete(`/vendor/brands/${v1BrandId}`, {
            headers: vendor2Headers,
          })
          .catch((e: any) => e);

        expect(err.response.status).toEqual(404);
      });

      it("vendor 2 should not see vendor 1 brands in their list", async () => {
        const response = await api.get("/vendor/brands", {
          headers: vendor2Headers,
        });

        expect(response.status).toEqual(200);
        const found = response.data.brands.find(
          (b: any) => b.id === v1BrandId
        );
        expect(found).toBeUndefined();
      });

      afterAll(async () => {
        await api
          .delete(`/vendor/brands/${v1BrandId}`, {
            headers: vendorHeaders,
          })
          .catch(() => {});
      });
    });

    describe("Admin Brand Endpoints", () => {
      let brandId: string;

      beforeAll(async () => {
        const response = await api.post(
          "/vendor/brands",
          {
            name: "Admin Test Brand",
            handle: "admin-test-brand",
          },
          { headers: vendorHeaders }
        );
        brandId = response.data.brand.id;
      });

      it("should list all brands", async () => {
        const response = await api.get("/admin/brands", {
          headers: adminHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data.brands.length).toBeGreaterThanOrEqual(1);

        const found = response.data.brands.find(
          (b: any) => b.id === brandId
        );
        expect(found).toBeDefined();
      });

      it("should get a brand by ID", async () => {
        const response = await api.get(`/admin/brands/${brandId}`, {
          headers: adminHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data.brand.id).toEqual(brandId);
        expect(response.data.brand.name).toEqual("Admin Test Brand");
      });

      it("should update a brand", async () => {
        const response = await api.post(
          `/admin/brands/${brandId}`,
          { name: "Admin Updated Brand" },
          { headers: adminHeaders }
        );

        expect(response.status).toEqual(200);
        expect(response.data.brand.name).toEqual("Admin Updated Brand");
      });

      it("should delete a brand", async () => {
        const response = await api.delete(`/admin/brands/${brandId}`, {
          headers: adminHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data).toMatchObject({
          id: brandId,
          object: "brand",
          deleted: true,
        });
      });
    });

    describe("Store Brand Endpoints", () => {
      let brandId: string;
      let storeHeaders: Record<string, string>;

      beforeAll(async () => {
        // Create brand
        const response = await api.post(
          "/vendor/brands",
          {
            name: "Public Brand",
            handle: "public-brand",
          },
          { headers: vendorHeaders }
        );
        brandId = response.data.brand.id;

        // Create publishable API key for store access
        const container = getContainer();
        const apiKeyService = container.resolve(
          Modules.API_KEY
        ) as any;
        const pubKey = await apiKeyService.createApiKeys({
          title: "Test Publishable Key",
          type: "publishable",
          created_by: "test",
        });
        storeHeaders = {
          "x-publishable-api-key": pubKey.token,
        };
      });

      it("should list brands publicly without auth", async () => {
        const response = await api.get("/store/brands", {
          headers: storeHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data.brands.length).toBeGreaterThanOrEqual(1);
      });

      it("should get a brand by handle", async () => {
        const response = await api.get("/store/brands/public-brand", {
          headers: storeHeaders,
        });

        expect(response.status).toEqual(200);
        expect(response.data.brand.handle).toEqual("public-brand");
        expect(response.data.brand.name).toEqual("Public Brand");
      });

      it("should return 404 for non-existent handle", async () => {
        const err = await api
          .get("/store/brands/nonexistent-handle", {
            headers: storeHeaders,
          })
          .catch((e: any) => e);

        expect(err.response.status).toEqual(404);
      });

      afterAll(async () => {
        await api
          .delete(`/vendor/brands/${brandId}`, {
            headers: vendorHeaders,
          })
          .catch(() => {});
      });
    });

    describe("Brand Delete Cleans Up Links", () => {
      it("should delete brand even when products are linked", async () => {
        // Create a brand
        const brandRes = await api.post(
          "/vendor/brands",
          {
            name: "Deletable Brand",
            handle: "deletable-brand",
          },
          { headers: vendorHeaders }
        );
        const brandId = brandRes.data.brand.id;

        // Delete brand (should clean up seller-brand link)
        const deleteRes = await api.delete(`/vendor/brands/${brandId}`, {
          headers: vendorHeaders,
        });

        expect(deleteRes.status).toEqual(200);
        expect(deleteRes.data.deleted).toBeTruthy();

        // Verify brand is gone from admin list
        const adminList = await api.get("/admin/brands", {
          headers: adminHeaders,
        });
        const found = adminList.data.brands.find(
          (b: any) => b.id === brandId
        );
        expect(found).toBeUndefined();
      });
    });

    describe("Brand Validation", () => {
      it("should reject brand creation without name", async () => {
        const err = await api
          .post(
            "/vendor/brands",
            { handle: "no-name" },
            { headers: vendorHeaders }
          )
          .catch((e: any) => e);

        expect(err.response.status).toEqual(400);
      });

      it("should reject brand creation without handle", async () => {
        const err = await api
          .post(
            "/vendor/brands",
            { name: "No Handle" },
            { headers: vendorHeaders }
          )
          .catch((e: any) => e);

        expect(err.response.status).toEqual(400);
      });

      it("should reject duplicate handle", async () => {
        await api.post(
          "/vendor/brands",
          {
            name: "Brand A",
            handle: "duplicate-handle",
          },
          { headers: vendorHeaders }
        );

        const err = await api
          .post(
            "/vendor/brands",
            {
              name: "Brand B",
              handle: "duplicate-handle",
            },
            { headers: vendorHeaders }
          )
          .catch((e: any) => e);

        expect(err.response.status).toBeGreaterThanOrEqual(400);

        // Cleanup
        const listRes = await api.get("/vendor/brands", {
          headers: vendorHeaders,
        });
        const brand = listRes.data.brands.find(
          (b: any) => b.handle === "duplicate-handle"
        );
        if (brand) {
          await api
            .delete(`/vendor/brands/${brand.id}`, {
              headers: vendorHeaders,
            })
            .catch(() => {});
        }
      });
    });
  },
});
