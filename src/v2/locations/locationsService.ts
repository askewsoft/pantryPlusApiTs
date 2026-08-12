import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { ErrorCode } from "../../shared/errorHandler";
import { Location, NearbyLocation, LocationArea } from "./location";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Location Service');

/** Radius (meters) for treating an existing store as the same place on create. */
export const LOCATION_FIND_OR_CREATE_RADIUS_METERS = 50;

export type CreateLocationResult = {
  location: Location;
  created: boolean;
};

export abstract class LocationsService {
  public static async create(location: Location, email: string): Promise<CreateLocationResult> {
    const { latitude, longitude, name, id } = location;

    try {
      const nearby = await LocationsService.getNearbyLocations({
        latitude,
        longitude,
        radius: LOCATION_FIND_OR_CREATE_RADIUS_METERS,
      });
      if (nearby.length > 0) {
        const match = nearby[0];
        log.debug({
          message: 'Reusing existing location within find-or-create radius',
          requestedLocationId: id,
          existingLocationId: match.id,
          distance: match.distance,
        });
        return {
          created: false,
          location: {
            id: match.id,
            name: match.name,
            latitude: match.latitude,
            longitude: match.longitude,
          },
        };
      }

      const createTemplate = path.join(__dirname, './sql/createLocation.sql');
      log.debug({
        message: 'Creating location in database',
        locationId: id,
        name,
        latitude,
        longitude,
      });

      const rows = await dbPost(createTemplate, {
        latitude,
        longitude,
        name,
        locationId: id,
        email,
      });
      const createdRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      const resolved: Location = createdRow
        ? {
            id: createdRow.id,
            name: createdRow.name,
            latitude: Number(createdRow.latitude),
            longitude: Number(createdRow.longitude),
          }
        : { id, name, latitude, longitude };

      log.debug({
        message: 'Location created successfully in database',
        locationId: resolved.id,
      });

      return { created: true, location: resolved };
    } catch (error) {
      log.error({
        message: 'Failed to create location in database',
        error: error instanceof Error ? error.message : String(error),
        locationId: id,
        name,
        latitude,
        longitude,
      });
      throw error;
    }
  }

  public static async update(locationId: string, name: string, email: string): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateLocation.sql');
    return await dbPost(updateTemplate, { locationId, name, email });
  }

  public static async getNearbyLocations(locationArea: LocationArea): Promise<Array<NearbyLocation>> {
    const { longitude, latitude, radius } = locationArea;
    const getNearbyLocationsTemplate = path.join(__dirname, './sql/getNearbyLocations.sql');
    return await dbPost(getNearbyLocationsTemplate, { longitude, latitude, radius });
  }

  /** Throws NOT_FOUND if LOCATION row is missing (e.g. FK on CATEGORY_ORDER.LOCATION_ID). */
  public static async assertLocationExists(locationId: string): Promise<void> {
    const template = path.join(__dirname, './sql/locationExists.sql');
    const rows = await dbPost(template, { locationId });
    if (!rows || rows.length === 0) {
      const err = new Error('Location not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
  }
}
