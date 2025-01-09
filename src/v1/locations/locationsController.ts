// LOCATIONS
import { Body, Controller, Example, Header, Path, Post, Put, Route, SuccessResponse, Tags } from "tsoa";

import { Location } from "./location";
import { LocationsService } from "./locationsService";
import { locationIdExample } from "./locationsExamples";

@Route("locations")
@Tags("Locations")
export class LocationsController extends Controller {
  /**
   * @summary Creates a new location
   * @param email the email address of the user
   * @param location the location to create
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
  public async createLocation(@Header("X-Auth-User") email: string, @Body() location: Location ): Promise<Pick<Location, "id">> {
    return await LocationsService.create(location);
  };

  /**
   * @summary Updates an existing location name
   * @param email the email address of the user
   * @param locationId the ID of the location to be updated
   * @param name the new name of the location
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example name "Stop & Shop Nashua"
   */
  @Put("{locationId}")
  @SuccessResponse(205, "Content Updated")
  public async updateLocation(@Header("X-Auth-User") email: string, @Path() locationId: string, @Body() location: Pick<Location, "name">): Promise<void> {
    return await LocationsService.update(locationId, location.name, email);
  };
};