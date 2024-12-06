-- confirm access to contribute to list
-- list owner and cohort members can contribute

SET @userEmail = :email;
SET @listIdTxt = :id;

SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM LIST
WHERE OWNER_ID = @shopperId
  and ID = uuid_to_bin(@listIdTxt)
UNION
SELECT 1 AS ALLOWED
FROM LIST l
JOIN COHORT_SHOPPER_RELATION csr
    ON csr.SHOPPER_ID = @shopperId
    AND csr.COHORT_ID = l.COHORT_ID
WHERE l.ID = uuid_to_bin(@listIdTxt)
;