import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { Location, LocationCreationParams } from "./location";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Location Service')

export abstract class LocationsService {
  public static async create(location: LocationCreationParams): Promise<Pick<Location, "id">> {
    const { latitude, longitude, name } = location;
    const createTemplate = path.join(__dirname, '.sql/createLocation.sql');
    const [rows, fields] = await dbPost(createTemplate, { latitude, longitude, name });
    const results = extractDbResult(rows);
    const locationId = results[0].id;
    return { id: locationId };
  };

  public static async update(locationId: string, name: string, email: string): Promise<void> {
    const updateTemplate = path.join(__dirname, '.sql/updateLocation.sql');
    return await dbPost(updateTemplate, { locationId, name, email });
  };
};