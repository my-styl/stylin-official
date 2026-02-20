export const adminBrandFields = [
  "id",
  "name",
  "handle",
  "description",
  "logo",
  "created_at",
  "updated_at",
];

export const adminBrandQueryConfig = {
  list: {
    defaults: adminBrandFields,
    isList: true,
  },
  retrieve: {
    defaults: adminBrandFields,
    isList: false,
  },
};
