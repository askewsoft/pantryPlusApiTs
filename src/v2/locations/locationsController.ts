// LOCATIONS
import { Body, Controller, Example, Header, Path, Post, Put, Route, Security, SuccessResponse, Tags, Response } from "tsoa";

import { Location, NearbyLocation, LocationArea } from "./location";
import { LocationsService } from "./locationsService";
import { nearbyLocationsExample } from "./locationsExamples";
import { validateUUIDParam, validateBodyUUIDs } from "../../shared/uuidValidation";
import { validateObject, commonValidations, ValidationResult } from "../../shared/inputValidation";
import { logger } from "../../shared/logger";

/**
 * Validates location input data
 */
function validateLocationInput(data: any): ValidationResult {
  const log = logger('LocationsController');
  log.debug({
    message: 'Validating location input',
    data,
    dataType: typeof data,
    latitudeType: typeof data?.latitude,
    longitudeType: typeof data?.longitude
  });

  const validation = validateObject(data, {
    id: commonValidations.uuid,
    name: { maxLength: 255 },
    latitude: { customValidator: (value) => {
      const isValid = typeof value === 'number' && value >= -90 && value <= 90;
      log.debug({
        message: 'Latitude validation',
        value,
        valueType: typeof value,
        isValid,
        range: { min: -90, max: 90 }
      });
      return isValid;
    }},
    longitude: { customValidator: (value) => {
      const isValid = typeof value === 'number' && value >= -180 && value <= 180;
      log.debug({
        message: 'Longitude validation',
        value,
        valueType: typeof value,
        isValid,
        range: { min: -180, max: 180 }
      });
      return isValid;
    }}
  });

  log.debug({
    message: 'Location validation result',
    isValid: validation.isValid,
    errors: validation.errors
  });

  return validation;
}

/**
 * Validates location area input data
 */
function validateLocationAreaInput(data: any): ValidationResult {
  const log = logger('LocationsController');
  log.debug({
    message: 'Validating location area input',
    data,
    dataType: typeof data,
    latitudeType: typeof data?.latitude,
    longitudeType: typeof data?.longitude,
    radiusType: typeof data?.radius
  });

  const validation = validateObject(data, {
    latitude: { customValidator: (value) => {
      const isValid = typeof value === 'number' && value >= -90 && value <= 90;
      log.debug({
        message: 'Latitude validation (area)',
        value,
        valueType: typeof value,
        isValid,
        range: { min: -90, max: 90 }
      });
      return isValid;
    }},
    longitude: { customValidator: (value) => {
      const isValid = typeof value === 'number' && value >= -180 && value <= 180;
      log.debug({
        message: 'Longitude validation (area)',
        value,
        valueType: typeof value,
        isValid,
        range: { min: -180, max: 180 }
      });
      return isValid;
    }},
    radius: { customValidator: (value) => {
      const isValid = typeof value === 'number' && value > 0 && value <= 1000;
      log.debug({
        message: 'Radius validation',
        value,
        valueType: typeof value,
        isValid,
        range: { min: 0, max: 1000 }
      });
      return isValid;
    }}
  });

  log.debug({
    message: 'Location area validation result',
    isValid: validation.isValid,
    errors: validation.errors
  });

  return validation;
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
    const log = logger('LocationsController');
    log.debug({
      message: 'Creating location',
      email,
      location,
      locationType: typeof location,
      locationKeys: location ? Object.keys(location) : [],
      locationRaw: JSON.stringify(location),
      latitudeRaw: location?.latitude,
      latitudeType: typeof location?.latitude,
      longitudeRaw: location?.longitude,
      longitudeType: typeof location?.longitude,
      // Additional debugging for TSOA body coercion
      latitudeIsString: typeof location?.latitude === 'string',
      longitudeIsString: typeof location?.longitude === 'string',
      latitudeStringLength: typeof location?.latitude === 'string' ? (location.latitude as string).length : 'N/A',
      longitudeStringLength: typeof location?.longitude === 'string' ? (location.longitude as string).length : 'N/A'
    });

    // Validate input data first
    try {
      const validation = validateLocationInput(location);
      if (!validation.isValid) {
        log.error({
          message: 'Location validation failed',
          errors: validation.errors,
          location,
          locationType: typeof location
        });
        this.setStatus(400);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    } catch (validationError) {
      log.error({
        message: 'Location validation error',
        error: validationError,
        location,
        locationType: typeof location
      });
      this.setStatus(400);
      throw new Error(`Validation error: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
    }

    // Validate UUID in request body
    validateBodyUUIDs(location, ['id'], 'Invalid location ID format');

    await LocationsService.create(location);
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
    const log = logger('LocationsController');
    log.debug({
      message: 'Getting nearby locations',
      email,
      locationArea,
      locationAreaType: typeof locationArea,
      locationAreaKeys: locationArea ? Object.keys(locationArea) : [],
      locationAreaRaw: JSON.stringify(locationArea),
      latitudeRaw: locationArea?.latitude,
      latitudeType: typeof locationArea?.latitude,
      longitudeRaw: locationArea?.longitude,
      longitudeType: typeof locationArea?.longitude,
      radiusRaw: locationArea?.radius,
      radiusType: typeof locationArea?.radius,
      // Additional debugging for TSOA body coercion
      latitudeIsString: typeof locationArea?.latitude === 'string',
      longitudeIsString: typeof locationArea?.longitude === 'string',
      radiusIsString: typeof locationArea?.radius === 'string',
      latitudeStringLength: typeof locationArea?.latitude === 'string' ? (locationArea.latitude as string).length : 'N/A',
      longitudeStringLength: typeof locationArea?.longitude === 'string' ? (locationArea.longitude as string).length : 'N/A',
      radiusStringLength: typeof locationArea?.radius === 'string' ? (locationArea.radius as string).length : 'N/A'
    });

    // Validate input data first
    try {
      const validation = validateLocationAreaInput(locationArea);
      if (!validation.isValid) {
        log.error({
          message: 'Location area validation failed',
          errors: validation.errors,
          locationArea,
          locationAreaType: typeof locationArea
        });
        this.setStatus(400);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    } catch (validationError) {
      log.error({
        message: 'Location area validation error',
        error: validationError,
        locationArea,
        locationAreaType: typeof locationArea
      });
      this.setStatus(400);
      throw new Error(`Validation error: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
    }

    return await LocationsService.getNearbyLocations(locationArea);
  };
};