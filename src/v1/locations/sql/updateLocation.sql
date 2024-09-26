-- updates the name of a location
SET @email = :email;
SET @locationIdTxt = :locationId;
SET @name = :name;

SET @shopperId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

UPDATE LOCATION
SET NAME = @name
WHERE ID_TXT = @locationIdTxt
    AND CREATED_BY = @shopperId
;