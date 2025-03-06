/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TsoaRoute, fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ShoppersController } from './v1/shoppers/shoppersController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LocationsController } from './v1/locations/locationsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ListsController } from './v1/lists/listsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ItemsController } from './v1/items/itemsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GroupsController } from './v1/groups/groupsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CategoriesController } from './v1/categories/categoriesController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Shopper": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "nickname": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true,"validators":{"pattern":{"errorMsg":"Invalid email address","value":"^(([^<>()[\\]\\.,;:\\s@\\\"]+(\\.[^<>()[\\]\\.,;:\\s@\\\"]+)*)|(\\\".+\\\"))@(([^<>()[\\]\\.,;:\\s@\\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\\"]{2,})$"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Shopper.id_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Group.id-or-name-or-owner_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"owner":{"ref":"Shopper","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Group": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"owner":{"ref":"Shopper","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Item": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "upc": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "List": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "ownerId": {"dataType":"string","required":true},
            "groupId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"undefined"}]},
            "ordinal": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecentLocation": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "latitude": {"dataType":"double","required":true},
            "longitude": {"dataType":"double","required":true},
            "lastPurchaseDate": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Location.id_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Location": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "latitude": {"dataType":"double","required":true},
            "longitude": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Location.name_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NearbyLocation": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "latitude": {"dataType":"double","required":true},
            "longitude": {"dataType":"double","required":true},
            "distance": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LocationArea": {
        "dataType": "refObject",
        "properties": {
            "latitude": {"dataType":"double","required":true},
            "longitude": {"dataType":"double","required":true},
            "radius": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Category": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "listId": {"dataType":"string","required":true},
            "ordinal": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_List.name-or-groupId-or-ordinal_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"groupId":{"dataType":"string"},"ordinal":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Item.name-or-upc_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"upc":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Group.name-or-id_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string","required":true},"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Group.name_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Shopper.email_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true,"validators":{"pattern":{"errorMsg":"Invalid email address","value":"^(([^<>()[\\]\\.,;:\\s@\\\"]+(\\.[^<>()[\\]\\.,;:\\s@\\\"]+)*)|(\\\".+\\\"))@(([^<>()[\\]\\.,;:\\s@\\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\\"]{2,})$"}}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_Category.name-or-ordinal_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"ordinal":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        app.post('/v1/shoppers',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.createShopper)),

            async function ShoppersController_createShopper(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    person: {"in":"body","name":"person","required":true,"ref":"Shopper"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'createShopper',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/shoppers/:shopperId',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.updateShopper)),

            async function ShoppersController_updateShopper(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
                    shopper: {"in":"body","name":"shopper","required":true,"ref":"Shopper"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'updateShopper',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 205,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/shoppers/:shopperId',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.retrieveShopper)),

            async function ShoppersController_retrieveShopper(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'retrieveShopper',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/shoppers/:shopperId/groups',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.getGroups)),

            async function ShoppersController_getGroups(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'getGroups',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/shoppers/:shopperId/invites',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.getInvites)),

            async function ShoppersController_getInvites(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'getInvites',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/shoppers/:shopperId/invites/:inviteId',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.declineInvite)),

            async function ShoppersController_declineInvite(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
                    inviteId: {"in":"path","name":"inviteId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'declineInvite',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/shoppers/:shopperId/invites/:inviteId',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.acceptInvite)),

            async function ShoppersController_acceptInvite(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
                    inviteId: {"in":"path","name":"inviteId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'acceptInvite',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 205,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/shoppers/:shopperId/items',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.getPurchasedItems)),

            async function ShoppersController_getPurchasedItems(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'getPurchasedItems',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/shoppers/:shopperId/lists',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.getLists)),

            async function ShoppersController_getLists(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'getLists',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/shoppers/:shopperId/locations',
            ...(fetchMiddlewares<RequestHandler>(ShoppersController)),
            ...(fetchMiddlewares<RequestHandler>(ShoppersController.prototype.getLocations)),

            async function ShoppersController_getLocations(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
                    lookBackDays: {"in":"query","name":"lookBackDays","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ShoppersController();

              await templateService.apiHandler({
                methodName: 'getLocations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/locations',
            ...(fetchMiddlewares<RequestHandler>(LocationsController)),
            ...(fetchMiddlewares<RequestHandler>(LocationsController.prototype.createLocation)),

            async function LocationsController_createLocation(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    location: {"in":"body","name":"location","required":true,"ref":"Location"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new LocationsController();

              await templateService.apiHandler({
                methodName: 'createLocation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/locations/:locationId',
            ...(fetchMiddlewares<RequestHandler>(LocationsController)),
            ...(fetchMiddlewares<RequestHandler>(LocationsController.prototype.updateLocation)),

            async function LocationsController_updateLocation(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationId: {"in":"path","name":"locationId","required":true,"dataType":"string"},
                    location: {"in":"body","name":"location","required":true,"ref":"Pick_Location.name_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new LocationsController();

              await templateService.apiHandler({
                methodName: 'updateLocation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 205,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/locations/nearby',
            ...(fetchMiddlewares<RequestHandler>(LocationsController)),
            ...(fetchMiddlewares<RequestHandler>(LocationsController.prototype.getNearbyLocations)),

            async function LocationsController_getNearbyLocations(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationArea: {"in":"body","name":"locationArea","required":true,"ref":"LocationArea"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new LocationsController();

              await templateService.apiHandler({
                methodName: 'getNearbyLocations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/lists',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.createList)),

            async function ListsController_createList(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    newList: {"in":"body","name":"newList","required":true,"ref":"List"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'createList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/lists/:listId/categories',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.createCategory)),

            async function ListsController_createCategory(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationId: {"in":"header","name":"X-Auth-Location","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    category: {"in":"body","name":"category","required":true,"ref":"Category"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'createCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/lists/:listId/items/:itemId',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.addItem)),

            async function ListsController_addItem(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'addItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/lists/:listId/items/:itemId/purchase',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.purchaseItem)),

            async function ListsController_purchaseItem(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationId: {"in":"header","name":"X-Auth-Location","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'purchaseItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/lists/:listId/items/:itemId/purchase',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.unpurchaseItem)),

            async function ListsController_unpurchaseItem(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationId: {"in":"header","name":"X-Auth-Location","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                    purchase: {"in":"body","name":"purchase","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"purchaseDate":{"dataType":"string","required":true}}},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'unpurchaseItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/lists/:listId',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.updateList)),

            async function ListsController_updateList(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    list: {"in":"body","name":"list","required":true,"ref":"Pick_List.name-or-groupId-or-ordinal_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'updateList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 205,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/lists/:listId',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.deleteList)),

            async function ListsController_deleteList(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'deleteList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/lists/:listId/categories/:categoryId',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.removeCategory)),

            async function ListsController_removeCategory(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'removeCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/lists/:listId/items/:itemId',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.removeItem)),

            async function ListsController_removeItem(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'removeItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/lists/:listId/categories',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.getCategories)),

            async function ListsController_getCategories(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationId: {"in":"header","name":"X-Auth-Location","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'getCategories',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/lists/:listId/items',
            ...(fetchMiddlewares<RequestHandler>(ListsController)),
            ...(fetchMiddlewares<RequestHandler>(ListsController.prototype.getListItems)),

            async function ListsController_getListItems(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    listId: {"in":"path","name":"listId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ListsController();

              await templateService.apiHandler({
                methodName: 'getListItems',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/items/:itemId',
            ...(fetchMiddlewares<RequestHandler>(ItemsController)),
            ...(fetchMiddlewares<RequestHandler>(ItemsController.prototype.updateItem)),

            async function ItemsController_updateItem(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
                    item: {"in":"body","name":"item","required":true,"ref":"Pick_Item.name-or-upc_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ItemsController();

              await templateService.apiHandler({
                methodName: 'updateItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/items',
            ...(fetchMiddlewares<RequestHandler>(ItemsController)),
            ...(fetchMiddlewares<RequestHandler>(ItemsController.prototype.createItem)),

            async function ItemsController_createItem(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    item: {"in":"body","name":"item","required":true,"ref":"Item"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new ItemsController();

              await templateService.apiHandler({
                methodName: 'createItem',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/groups',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.createGroup)),

            async function GroupsController_createGroup(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    group: {"in":"body","name":"group","required":true,"ref":"Pick_Group.name-or-id_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'createGroup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/groups/:groupId',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.updateGroupName)),

            async function GroupsController_updateGroupName(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
                    group: {"in":"body","name":"group","required":true,"ref":"Pick_Group.name_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'updateGroupName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 205,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/groups/:groupId/invitees',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.inviteShopper)),

            async function GroupsController_inviteShopper(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
                    shopper: {"in":"body","name":"shopper","required":true,"ref":"Pick_Shopper.email_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'inviteShopper',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/groups/:groupId/invitees',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.getInvitees)),

            async function GroupsController_getInvitees(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'getInvitees',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/groups/:groupId/invitees',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.uninviteShopper)),

            async function GroupsController_uninviteShopper(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
                    shopper: {"in":"body","name":"shopper","required":true,"ref":"Pick_Shopper.email_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'uninviteShopper',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/groups/:groupId/shoppers',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.addShopperToGroup)),

            async function GroupsController_addShopperToGroup(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
                    shopper: {"in":"body","name":"shopper","required":true,"ref":"Pick_Shopper.id_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'addShopperToGroup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/groups/:groupId/shoppers/:shopperId',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.removeShopperFromGroup)),

            async function GroupsController_removeShopperFromGroup(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
                    shopperId: {"in":"path","name":"shopperId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'removeShopperFromGroup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/groups/:groupId',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.deleteGroup)),

            async function GroupsController_deleteGroup(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'deleteGroup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/groups/:groupId',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.getGroup)),

            async function GroupsController_getGroup(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'getGroup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/groups/:groupId/shoppers',
            ...(fetchMiddlewares<RequestHandler>(GroupsController)),
            ...(fetchMiddlewares<RequestHandler>(GroupsController.prototype.getGroupShoppers)),

            async function GroupsController_getGroupShoppers(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    groupId: {"in":"path","name":"groupId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new GroupsController();

              await templateService.apiHandler({
                methodName: 'getGroupShoppers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/v1/categories/:categoryId/items/:itemId',
            ...(fetchMiddlewares<RequestHandler>(CategoriesController)),
            ...(fetchMiddlewares<RequestHandler>(CategoriesController.prototype.addItemToCategory)),

            async function CategoriesController_addItemToCategory(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new CategoriesController();

              await templateService.apiHandler({
                methodName: 'addItemToCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/v1/categories/:categoryId/items/:itemId',
            ...(fetchMiddlewares<RequestHandler>(CategoriesController)),
            ...(fetchMiddlewares<RequestHandler>(CategoriesController.prototype.removeItemFromCategory)),

            async function CategoriesController_removeItemFromCategory(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"string"},
                    itemId: {"in":"path","name":"itemId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new CategoriesController();

              await templateService.apiHandler({
                methodName: 'removeItemFromCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/v1/categories/:categoryId',
            ...(fetchMiddlewares<RequestHandler>(CategoriesController)),
            ...(fetchMiddlewares<RequestHandler>(CategoriesController.prototype.updateCategory)),

            async function CategoriesController_updateCategory(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    locationId: {"in":"header","name":"X-Auth-Location","required":true,"dataType":"string"},
                    categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"string"},
                    category: {"in":"body","name":"category","required":true,"ref":"Pick_Category.name-or-ordinal_"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new CategoriesController();

              await templateService.apiHandler({
                methodName: 'updateCategory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 205,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/v1/categories/:categoryId/items',
            ...(fetchMiddlewares<RequestHandler>(CategoriesController)),
            ...(fetchMiddlewares<RequestHandler>(CategoriesController.prototype.getCategoryItems)),

            async function CategoriesController_getCategoryItems(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    email: {"in":"header","name":"X-Auth-User","required":true,"dataType":"string"},
                    categoryId: {"in":"path","name":"categoryId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new CategoriesController();

              await templateService.apiHandler({
                methodName: 'getCategoryItems',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
