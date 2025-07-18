# pantryPlusApiTs

## Overview
The pantryPlus server side code in Typescript _and_ the OpenAPI swagger documentation using TSOA.

This service is built on node.js/express and MySQL

## Run
Ensure you have the correct version of [node.js](https://nodejs.org/) installed.
We also recommend that you use [nvm](https://nvm.sh) to manage different versions.

1. `nvm use` - Switch to the correct node.js version
1. `npm install` to get all dependencies
1. Create a file in the root named `.env` with the following configuration customized to your setup. See [dotenv](https://www.npmjs.com/package/dotenv) for more details
    ```sh
      PORT=       # mysql instance port
      HOST=       # MySQL connection host
      USER=       # username for connecting to MySQL instance
      PASSWORD=   # password for the above username
      DATABASE=   # the name of the default database to which to connect
    ```
1. `npm start`

## Develop

### Folder Structure
* All source code is in the `src` directory
* Under `src` is a directory for each supported version (e.g., `./src/v1/`)
* The version directories contain Express route handlers (i.e., controllers) _and_ SQL code. For example:
  * `./src/v1/**/*Controllers.ts`
  * `./src/v1/**/sql/`

#### Adding New Versions
* Make a new version directory for source code: `cp ./src/v1 ./src/v2`
* Copy then modify the tsoa config: `cp ./tsoa.v1.json ./tsoa.v2.json`
* Edit the server file `./src/server.ts` to create a new set of routes
  * e.g., `import { RegisterRoutes as RegisterV2Routes } from "./routes.v2";`
* Edit `package.json` scripts:
  ```json
    "buildv1": "tsoa spec-and-routes && tsc",
    "buildv2": "tsoa spec-and-routes -c tsoa.v2.json && tsc",
    "build": "npm run buildv1 && npm run buildv2",
    "codegenv1": "openapi-generator generate -g typescript-axios -i build/swagger.json -o ../pantryPlusApiClient",
    "codegenv2": "openapi-generator generate -g typescript-axios -i build/swagger.v2.json -o ../pantryPlusApiClientV2",
    "codegen": "npm run codegenv1 && npm run codegenv2",
  ```

### Documentation
* See details about the database design [here](https://github.com/askewsoft/pantryPlusApiTs/tree/main/schema)
* A swagger specification (`swagger-doc.js`) is automatically generated when you access the documentation URL (e.g., http://localhost:3000/v1/docs)
* A separate specification per API verison is generated from JSDoc comments in the source code

### Coding
* For hot reload while developing use `npm run dev`
* This project utilizes [prettier](https://www.npmjs.com/package/prettier) and [eslint](https://www.npmjs.com/package/eslint) to maintain consistent formatting
* All changes by non-Admin contributors must be done through github PR

### Validation
* To ensure that the generated OpenAPI v3 `swagger.json`
* `curl -X POST -d @build/swagger.json -H 'Content-Type:application/json' https://validator.swagger.io/validator/debug`

## Code Generation
An API client can be generated from the OpenAPI specification using the `openapi-generator` tool.
1. install the openapi-generator cli
  - e.g., `brew install openapi-generator`
1. `npm run codegen`
  - This will generate a new client into a `../pantryPlusApiClient` peer directory

## Deploy
The API is currently deployed to AWS using Elastic Beanstalk. To deploy updates, run the following:

1. `npm run build` — generates tsoa spec
1. `npm run codegen` — only necessary if API signatures change
1. `npm run ebzip` — compresses just the files needed to be deployed to AWS
1. manually upload & deploy the archive to AWS
