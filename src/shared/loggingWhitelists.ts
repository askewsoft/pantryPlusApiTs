const loggableHeaders = [
  "forwarded",
  "host",
  "referer",
  "via",
  "x-auth-user",
  "x-auth-location"
];

const debugOnlyPaths = [
  "/v2/docs",
  "/v2/swagger.json",
  "/healthcheck"
];

const apiPaths = [
  "/v2/categories",
  "/v2/groups",
  "/v2/items",
  "/v2/lists",
  "/v2/locations",
  "/v2/shoppers"
  
];

export { loggableHeaders, debugOnlyPaths, apiPaths };