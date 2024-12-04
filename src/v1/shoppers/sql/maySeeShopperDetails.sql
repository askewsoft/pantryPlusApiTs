-- confirm access to see shopper details
-- a user can see the details of shoppers in a group shared with the user

SET @userEmail = :email;
SET @shopperIdTxt = :id;

SELECT ID into @userId FROM PANTRY_PLUS.SHOPPER WHERE EMAIL = @userEmail
;
SELECT ID, EMAIL INTO @shopperId, @shopperEmail FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperIdTxt
;

SELECT IF (
    STRCMP(@shopperEmail, @userEmail) = 0, 1, (SELECT IF (
        EXISTS (
            SELECT s.GROUP_ID
            FROM PANTRY_PLUS.GROUP_SHOPPER_RELATION s
            WHERE s.SHOPPER_ID = @shopperId
                AND EXISTS (
                    SELECT u.GROUP_ID
                    FROM PANTRY_PLUS.GROUP_SHOPPER_RELATION u
                    WHERE u.SHOPPER_ID = @userId
                        AND u.GROUP_ID = s.GROUP_ID
                )
        ), 1, 0))
) AS ALLOWED
;