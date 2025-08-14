import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Location, NearbyLocation, LocationArea } from "./location";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Location Service')

export abstract class LocationsService {
  public static async create(location: Location): Promise<void> {
    const { latitude, longitude, name, id } = location;
    const createTemplate = path.join(__dirname, './sql/createLocation.sql');
    await dbPost(createTemplate, { latitude, longitude, name, locationId: id });
    return;
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