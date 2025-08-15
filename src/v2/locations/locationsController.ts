// LOCATIONS
import { Body, Controller, Example, Header, Path, Post, Put, Route, Security, SuccessResponse, Tags, Response } from "tsoa";

import { Location, NearbyLocation, LocationArea } from "./location";
import { LocationsService } from "./locationsService";
import { nearbyLocationsExample } from "./locationsExamples";
import { validateUUIDParam, validateBodyUUIDs } from "../../shared/uuidValidation";
import { validateObject, commonValidations, ValidationResult } from "../../shared/inputValidation";

/**
 * Validates location input data
 */
function validateLocationInput(data: any): ValidationResult {
  return validateObject(data, {
    id: commonValidations.uuid,
    name: { maxLength: 255 },
    latitude: { customValidator: (value) => typeof value === 'number' && value >= -90 && value <= 90 },
    longitude: { customValidator: (value) => typeof value === 'number' && value >= -180 && value <= 180 }
  });
}

/**
 * Validates location area input data
 */
function validateLocationAreaInput(data: any): ValidationResult {
  return validateObject(data, {
    latitude: { customValidator: (value) => typeof value === 'number' && value >= -90 && value <= 90 },
    longitude: { customValidator: (value) => typeof value === 'number' && value >= -180 && value <= 180 },
    radius: { customValidator: (value) => typeof value === 'number' && value > 0 && value <= 1000 }
  });
}

@Route("locations")
@Tags("Locations")
export class LocationsController extends Controller {
  /**
   * @summary Creates a new location
   * @param email the email address of the user
   * @param location the location to create
   * @example email "test@test.com"
   * @example location {
   *  "id": "123E4567-E89B-12D3-A456-426614174000",
   *  "name": "Stop & Shop Nashua",
   *  "latitude": 42.7456,
   *  "longitude": -71.4910
   * }
   * @returns void - confirms successful creation
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async createLocation(@Header("X-Auth-User") email: string, @Body() location: Location ): Promise<void> {
    // Validate input data first
    const validation = validateLocationInput(location);
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate UUID in request body
    validateBodyUUIDs(location, ['id'], 'Invalid location ID format');

    await LocationsService.create(location);
    return;
  };

  /**
   * @summary Updates an existing location name
   * @param email the email address of the user
   * @param locationId the ID of the location to be updated
   * @param name the new name of the location
   * @example email "test@test.com"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example name "Stop & Shop Nashua"
   */
  @Put("{locationId}")
  @SuccessResponse(205, "Content Updated")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async updateLocation(@Header("X-Auth-User") email: string, @Path() locationId: string, @Body() location: Pick<Location, "name">): Promise<void> {
    // Validate input data first
    const validation = validateObject(location, {
      name: { maxLength: 255 }
    });
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate UUID path parameter
    validateUUIDParam('locationId', locationId);

    return await LocationsService.update(locationId, location.name, email);
  };

  /**
   * @summary Retrieves all locations within a radius of the current location
   * @param email the email address of the user
   * @param longitude the longitude of the current location
   * @param latitude the latitude of the current location
   * @param radius the radius of the search
   * @example email "test@test.com"
   * @example locationArea {
   *  "longitude": -71.4910,
   *  "latitude": 42.7456,
   *  "radius": 100
   * }
   */
  @Post("nearby")
  @SuccessResponse(200, "OK")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Example<Array<NearbyLocation>>(nearbyLocationsExample)
  @Security("bearerAuth")
  public async getNearbyLocations(@Header("X-Auth-User") email: string, @Body() locationArea: LocationArea): Promise<Array<NearbyLocation>> {
    // Validate input data first
    const validation = validateLocationAreaInput(locationArea);
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await LocationsService.getNearbyLocations(locationArea);
  };
};