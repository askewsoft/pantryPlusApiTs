import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Location, NearbyLocation, LocationArea } from "./location";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Location Service')

export abstract class LocationsService {
  public static async create(location: Location): Promise<void> {
    const { latitude, longitude, name, id } = location;
    const createTemplate = path.join(__dirname, './sql/createLocation.sql');

    try {
      log.debug({
        message: 'Creating location in database',
        locationId: id,
        name,
        latitude,
        longitude
      });

      const result = await dbPost(createTemplate, { latitude, longitude, name, locationId: id });

      log.debug({
        message: 'Location created successfully in database',
        locationId: id,
        dbResult: result
      });

      return; // Return void as expected by the mobile app
    } catch (error) {
      log.error({
        message: 'Failed to create location in database',
        error: error instanceof Error ? error.message : String(error),
        locationId: id,
        name,
        latitude,
        longitude
      });
      throw error;
    }
  };

  public static async update(locationId: string, name: string, email: string): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateLocation.sql');
    return await dbPost(updateTemplate, { locationId, name, email });
  };

  public static async getNearbyLocations(locationArea: LocationArea): Promise<Array<NearbyLocation>> {
    const { longitude, latitude, radius } = locationArea;
    const getNearbyLocationsTemplate = path.join(__dirname, './sql/getNearbyLocations.sql');
    return await dbPost(getNearbyLocationsTemplate, { longitude, latitude, radius });
  };
};