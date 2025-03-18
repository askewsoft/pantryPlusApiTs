const loggableHeaders = [
  "forwarded",
  "host",
  "referer",
  "via",
  "x-auth-user",
  "x-auth-location"
];

const debugOnlyPaths = [
  "/v1/docs",
  "/v1/swagger.json",
  "/healthcheck"
];

const apiPaths = [
  "/v1/categories",
  "/v1/groups",
  "/v1/items",
  "/v1/lists",
  "/v1/locations",
  "/v1/shoppers"
  
];

export { loggableHeaders, debugOnlyPaths, apiPaths };