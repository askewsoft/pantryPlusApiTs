-- deletes an invite for this shopper
SET @shopperId = UUID_TO_BIN(:shopperId);
SET @inviteId = UUID_TO_BIN(:inviteId);

SELECT EMAIL INTO @shopperEmail
FROM PANTRY_PLUS.SHOPPER
WHERE ID = @shopperId
;

DELETE FROM PANTRY_PLUS.INVITEES
WHERE COHORT_ID = @inviteId
  AND EMAIL = @shopperEmail
;