-- confirm access to see shopper details
-- a user can see the details of shoppers in a cohort shared with the user

SET @userEmail = :email;
SET @shopperId = UUID_TO_BIN(:id);

SELECT ID into @userId FROM PANTRY_PLUS.SHOPPER WHERE EMAIL = @userEmail
;
SELECT EMAIL INTO @shopperEmail FROM PANTRY_PLUS.SHOPPER WHERE ID = @shopperId
;

SELECT IF (
    STRCMP(@shopperEmail, @userEmail) = 0, 1, (SELECT IF (
        EXISTS (
            SELECT csr.COHORT_ID
            FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
            WHERE csr.SHOPPER_ID = @shopperId
                AND EXISTS (
                    SELECT u.COHORT_ID
                    FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION u
                    WHERE u.SHOPPER_ID = @userId
                        AND u.COHORT_ID = csr.COHORT_ID
                )
        ), 1, 0))
) AS ALLOWED
;