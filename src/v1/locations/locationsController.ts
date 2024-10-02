// LOCATIONS
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";

import { Location, LocationCreationParams } from "./location";
import { LocationsService } from "./locationsService";

@Route("locations")
@Tags("Locations")
export class LocationsController extends Controller {
  /**
   * @summary Creates a new location
   * @param email the email address of the user
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() location: LocationCreationParams ): Promise<Pick<Location, "id">> {
    return await LocationsService.create(location);
  };

  /**
   * @summary Updates an existing location name
   * @param email the email address of the user
   * @param locationId the ID of the location to be updated
   */
  @Put("{locationId}")
  @SuccessResponse(205, "Content Updated")
  public async update(@Header("X-Auth-User") email: string, @Path() locationId: string, @Body() name: string): Promise<void> {
    return await LocationsService.update(locationId, name, email);
  };
};