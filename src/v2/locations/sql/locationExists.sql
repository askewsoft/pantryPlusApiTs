SET @locationId = UUID_TO_BIN(:locationId);

SELECT BIN_TO_UUID(ID) AS id
FROM LOCATION
WHERE ID = @locationId
LIMIT 1
;
