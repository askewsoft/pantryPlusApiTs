-- updates the name of a location
SET @locationId = UUID_TO_BIN(:locationId);
SET @name = :name;

UPDATE LOCATION
SET NAME = @name
WHERE ID = @locationId
;
