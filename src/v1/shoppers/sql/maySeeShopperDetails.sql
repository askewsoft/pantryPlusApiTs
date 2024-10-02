-- confirm access to see shopper details
-- a user can see the details of shoppers in a group shared with the user

SET @userEmail = :email;
SET @shopperIdTxt = :id;

SELECT ID into @userId FROM SHOPPER WHERE EMAIL = @userEmail
;
SELECT ID, EMAIL INTO @shopperId, @shopperEmail FROM SHOPPER WHERE ID_TXT = @shopperIdTxt
;

IF @shopperEmail = @userEmail THEN
    SELECT 1
ELSE IF (
    SELECT TOP 1 1
    FROM GROUP_SHOPPER s
    WHERE s.SHOPPER_ID = @shopperId
      AND EXISTS (
        SELECT 1
        FROM GROUP_SHOPPER u
        WHERE u.SHOPPER_ID = @userId
            AND u.GROUP_ID = s.GROUP_ID
    )
) THEN
    SELECT 1
ELSE
    SELECT 0
END IF
;