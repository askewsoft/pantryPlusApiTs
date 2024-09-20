# pantryPlusApiTs

## Overview
The pantryPlus server side code in Typescript _and_ the OpenAPI swagger documentation using TSOA.

This service is built on node.js/express and MySQL

# Run
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

**Folder Structure**
* All source code is in the `src` directory
* Under `src` is a directory for each supported version (e.g., `./src/v1/`)
* The version directories contain Express route handlers _and_ SQL code (e.g., `/.src/v1/sql`)

**Documentation**
* See details about the database design [here](https://github.com/askewsoft/pantryPlusApiTs/tree/main/schema)
* A swagger specification (`swagger-doc.js`) is automatically generated when you access the documentation URL (e.g., http://localhost:3000/api/v1/docs)
* A separate specification per API verison is generated from JSDoc comments in the source code

**Coding**
* For hot reload while developing use `npm run dev`
* This project utilizes [prettier](https://www.npmjs.com/package/prettier) and [eslint](https://www.npmjs.com/package/eslint) to maintain consistent formatting
* All changes by non-Admin contributors must be done through github PR
