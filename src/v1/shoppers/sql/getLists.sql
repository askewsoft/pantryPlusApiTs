-- gets all the lists for the shopper ID
-- associated with the user

SET @shopperId = UUID_TO_BIN(:shopperId);

WITH shopperCohorts as (
  SELECT c.ID as COHORT_ID
  FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
  JOIN PANTRY_PLUS.SHOPPER sh
    ON sh.ID = csr.SHOPPER_ID
    AND sh.ID = @shopperId
  JOIN PANTRY_PLUS.COHORT c
    ON c.ID = csr.COHORT_ID
    AND c.OWNER_ID <> @shopperId
)

SELECT
  bin_to_uuid(ls.ID) as ID,
  ls.NAME,
  bin_to_uuid(ls.OWNER_ID) as OWNER_ID
FROM shopperCohorts sc
JOIN PANTRY_PLUS.LIST ls ON ls.COHORT_ID = sc.COHORT_ID
UNION
SELECT
  bin_to_uuid(ID) as ID,
  NAME,
  bin_to_uuid(OWNER_ID) as OWNER_ID
FROM PANTRY_PLUS.LIST
WHERE OWNER_ID = @shopperId
;
