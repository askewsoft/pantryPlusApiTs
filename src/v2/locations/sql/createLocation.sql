-- creates a location (caller must have already ruled out a near-duplicate)
SET @name = :name;
SET @locationId = UUID_TO_BIN(:locationId);
SET @latitude = :latitude;
SET @longitude = :longitude;
SET @userEmail = :email;
SET @createdBy = (SELECT ID FROM SHOPPER WHERE EMAIL = @userEmail);

-- POINT(X longitude, Y latitude) for SRID 4326; matches ST_Longitude / ST_Latitude and nearby queries
SET @geoLocation = ST_GeomFromText(CONCAT('POINT(', @longitude, ' ', @latitude, ')'), 4326);

INSERT IGNORE INTO LOCATION (ID, NAME, GEO_LOCATION, CREATED_BY)
VALUES (@locationId, @name, @geoLocation, @createdBy)
;

SELECT
  BIN_TO_UUID(lo.ID) as id,
  lo.NAME as name,
  ST_Latitude(lo.GEO_LOCATION) as latitude,
  ST_Longitude(lo.GEO_LOCATION) as longitude
FROM LOCATION lo
WHERE lo.ID = @locationId
;
