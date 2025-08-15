// LOCATIONS
import { Body, Controller, Example, Header, Path, Post, Put, Route, Security, SuccessResponse, Tags } from "tsoa";

import { Location, NearbyLocation, LocationArea } from "./location";
import { LocationsService } from "./locationsService";
import { locationIdExample, nearbyLocationsExample } from "./locationsExamples";
import { validateUUIDParam, validateBodyUUIDs } from "../../shared/uuidValidation";

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
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Example<Pick<Location, "id">>(locationIdExample)
  @Security("bearerAuth")
  public async createLocation(@Header("X-Auth-User") email: string, @Body() location: Location ): Promise<Pick<Location, "id">> {
    // Validate UUID in request body
    validateBodyUUIDs(location, ['id'], 'Invalid location ID format');

    return await LocationsService.create(location);
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
  @Security("bearerAuth")
  public async updateLocation(@Header("X-Auth-User") email: string, @Path() locationId: string, @Body() location: Pick<Location, "name">): Promise<void> {
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
  @Example<Array<NearbyLocation>>(nearbyLocationsExample)
  @Security("bearerAuth")
  public async getNearbyLocations(@Header("X-Auth-User") email: string, @Body() locationArea: LocationArea): Promise<Array<NearbyLocation>> {
    return await LocationsService.getNearbyLocations(locationArea);
  };
};