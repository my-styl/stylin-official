export const storeBrandFields = [
  "id",
  "name",
  "handle",
  "description",
  "logo",
];

export const storeBrandQueryConfig = {
  list: {
    defaults: storeBrandFields,
    isList: true,
  },
  retrieve: {
    defaults: storeBrandFields,
    isList: false,
  },
};
