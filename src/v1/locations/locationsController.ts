// LOCATIONS
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";

import { Location, LocationCreationParams } from "./location";
import { LocationsService } from "./locationsService";
import { ErrorCode } from "../../shared/errorHandler";

@Route("locations")
@Tags("Locations")
export class LocationsController extends Controller {
  /**
   * @summary Creates a new location
   * @param email the email address of the user
   * @returns The ID of the created location
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() location: LocationCreationParams ): Promise<Pick<Location, "id">> {
    try {
      return await LocationsService.create(location);
    } catch (err: any) {
      err.code = ErrorCode.DATABASE_ERR
      throw err;
    }
  };
};