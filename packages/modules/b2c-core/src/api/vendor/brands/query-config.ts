export const vendorBrandFields = [
  "id",
  "name",
  "handle",
  "description",
  "logo",
  "created_at",
  "updated_at",
];

export const vendorBrandQueryConfig = {
  list: {
    defaults: vendorBrandFields,
    isList: true,
  },
  retrieve: {
    defaults: vendorBrandFields,
    isList: false,
  },
};
