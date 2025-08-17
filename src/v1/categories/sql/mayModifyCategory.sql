-- confirm access to modify category
-- categories may be modified by any shopper with access to the list to which the category belongs

SET @userEmail = :email;
SET @categoryId = UUID_TO_BIN(:id);

SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM CATEGORY c
JOIN LIST l
    ON l.ID = c.LIST_ID
    AND l.OWNER_ID = @shopperId
WHERE c.ID = @categoryId
UNION
SELECT 1 AS ALLOWED
FROM CATEGORY c
JOIN LIST l ON l.ID = c.LIST_ID
JOIN COHORT_SHOPPER_RELATION csr
    ON csr.SHOPPER_ID = @shopperId
    AND csr.COHORT_ID = l.COHORT_ID
WHERE c.ID = @categoryId
UNION
SELECT 1 AS ALLOWED
FROM CATEGORY c
JOIN LIST l ON l.ID = c.LIST_ID
JOIN COHORT g
    ON g.ID = l.COHORT_ID
    AND g.OWNER_ID = @shopperId
WHERE c.ID = @categoryId
;