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
  bin_to_uuid(ls.OWNER_ID) as OWNER_ID,
  lo.ORDINAL
FROM shopperCohorts sc
JOIN PANTRY_PLUS.LIST ls ON ls.COHORT_ID = sc.COHORT_ID
LEFT JOIN PANTRY_PLUS.LIST_ORDER lo ON lo.LIST_ID = ls.ID
UNION
SELECT
  bin_to_uuid(ls.ID) as ID,
  ls.NAME,
  bin_to_uuid(ls.OWNER_ID) as OWNER_ID,
  lo.ORDINAL
FROM PANTRY_PLUS.LIST ls
LEFT JOIN PANTRY_PLUS.LIST_ORDER lo ON lo.LIST_ID = ls.ID
WHERE ls.OWNER_ID = @shopperId
;