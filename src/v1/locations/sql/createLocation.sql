-- creates a location and returns the location_id
SET @email = :email;
SET @name = :name;
SET @latitude = :latitude;
SET @longitude = :longitude;

SET @geoLocation = CONCAT("'POINT(",@latitude, " ", @longitude, ")'");

SET @shopperId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT INTO LOCATION (NAME, GEO_LOCATION, SHOPPER_ID)
VALUES (@name, @geoLocation, @shopperId)
;

SELECT ID_TXT as ID
FROM LOCATION
WHERE NAME = @name
  and GEO_LOCATION = @geoLocation
  and SHOPPER_ID = @shopperId
;