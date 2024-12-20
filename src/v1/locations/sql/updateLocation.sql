-- updates the name of a location
SET @locationIdTxt = :locationId;
SET @name = :name;

UPDATE LOCATION
SET NAME = @name
WHERE ID = UUID_TO_BIN(@locationIdTxt)
;