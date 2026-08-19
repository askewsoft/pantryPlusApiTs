-- gets all locations within a radius of the current location

SET @radius = :radius; -- meters
SET @longitude = :longitude; -- X
SET @latitude = :latitude; -- Y
SET @CURR_LOCATION = ST_SRID(POINT(@longitude, @latitude), 4326);

SELECT DISTINCT
    BIN_TO_UUID(lo.ID) as id,
    lo.NAME as name,
    ST_Latitude(lo.GEO_LOCATION) as latitude,
    ST_Longitude(lo.GEO_LOCATION) as longitude,
    ST_Distance_Sphere(@CURR_LOCATION, lo.GEO_LOCATION) as distance
FROM PANTRY_PLUS.LOCATION lo
WHERE ST_Distance_Sphere(@CURR_LOCATION, lo.GEO_LOCATION) <= @radius
ORDER BY distance asc
;