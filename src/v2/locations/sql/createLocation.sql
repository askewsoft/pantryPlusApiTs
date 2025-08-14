-- creates a location and returns the location_id
SET @name = :name;
SET @locationId = UUID_TO_BIN(:locationId);
SET @latitude = :latitude;
SET @longitude = :longitude;

SET @geoLocation = ST_GeomFromText(CONCAT('POINT(', @latitude, ' ', @longitude, ')'), 4326);

INSERT IGNORE INTO LOCATION (ID, NAME, GEO_LOCATION)
VALUES (@locationId, @name, @geoLocation)
;

SELECT BIN_TO_UUID(ID) as ID
FROM LOCATION
WHERE NAME = @name
  and GEO_LOCATION = @geoLocation
;