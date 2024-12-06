-- creates a shopper and returns the shopper_id

SET @email = :email;
SET @nickName = :nickName;
SET @idTxt = :id;

INSERT IGNORE INTO PANTRY_PLUS.SHOPPER (ID, EMAIL, NICKNAME)
VALUES (uuid_to_bin(@idTxt), @email, @nickName)
;

SELECT bin_to_uuid(ID) as ID
FROM PANTRY_PLUS.SHOPPER
WHERE EMAIL = @email
;
