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

### Adding New Versions
1. Make a new version directory for source code: `cp ./src/v1 ./src/v2`
1. Copy then modify the tsoa config: `cp ./tsoa.v1.json ./tsoa.v2.json`
1. Edit the server file `./src/server.ts` to create a new set of routes
    * e.g., `import { RegisterRoutes as RegisterV2Routes } from "./routes.v2";`
1. Edit `package.json` scripts:
  ```json
    "buildv1": "tsoa spec-and-routes && tsc",
    "buildv2": "tsoa spec-and-routes -c tsoa.v2.json && tsc",
    "copysqlv1": "node scripts/copy-sql.js v1",
    "copysqlv2": "node scripts/copy-sql.js v2",
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
1. `brew install openapi-generator`
    - this will install the openapi-generator cli
1. `npm run codegen`
    - this will generate a new client into a `../pantryPlusApiClient` peer directory

## Testing
### Schemathesis

1. `npm run log`
    - start the API server in one terminal window / shell and log to a file `./api.log`
1. `export AUTH_TOKEN=<your.jwt.token.here>`
    - in another terminal window / shell export a valid recent bearer token
1. `npm run schemathesis v2`
    - in the 2nd terminal window / shell, run the tests


### Docker
* `docker compose up --build`
    - builds and runs the application with the same environment as App Runner
    - test the containerized application locally


## Deploy
The API is being deployed to AWS App Runner for better scalability and managed operations.

#### Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed locally
- Database configuration stored in AWS Systems Manager Parameter Store

#### Deployment Process
1. `npm run build`
    — generates tsoa spec
1. `./scripts/build-push-to-ecr.sh`
    - builds and pushes the current docker image to AWS ECR
1. ECR updates should trigger an automatic deployment via App Runner
1. monitor CloudWatch App Runner service events log to confirm success
1. verify deployment using
    - `aws apprunner describe-service --service-name pantryplus-api-service --region us-east-1`
    - `curl https://wmqbp3nqgp.us-east-1.awsapprunner.com/healthcheck`

#### Code Generation (When API changes)
If you modify API endpoints or schemas:

1. `npm run codegen`
    - generates updated client code
1. `cd ../pantryPlusApiClient`
    - switch to the client library repo
1. `git commit -am "<some update message>"`
    - commit and push the generated client code
1. [README](https://github.com/askewsoft/pantryPlusApiClient/blob/main/README.md)
    - Follow the Client repo's instructions to update the mobile app to the latest version
