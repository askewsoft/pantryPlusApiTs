-- updates a shopper and returns the shopper_id

SET @shopperId = :shopperId;
SET @email = :email;
SET @nickName = :nickName;

SET @origNickName = (SELECT NICKNAME FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperId);
SET @origEmail = (SELECT EMAIL FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperId);

SET @nickName = (SELECT COALESCE(@nickName, @origNickName));
SET @email = (SELECT COALESCE(@email, @origEmail));

UPDATE PANTRY_PLUS.SHOPPER
SET EMAIL = @email, NICKNAME = @nickName
WHERE ID_TXT = @shopperId
;

SELECT ID_TXT as ID
FROM PANTRY_PLUS.SHOPPER
WHERE ID_TXT = @shopperId
;
