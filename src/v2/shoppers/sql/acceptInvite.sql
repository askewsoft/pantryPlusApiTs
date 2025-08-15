-- adds a shopper to a cohort, and deletes the invite
SET @shopperId = UUID_TO_BIN(:shopperId);
SET @inviteId = UUID_TO_BIN(:inviteId);

SELECT EMAIL INTO @shopperEmail
FROM PANTRY_PLUS.SHOPPER
WHERE ID = @shopperId
;

START TRANSACTION;
  -- both must succeed or both must fail
  DELETE FROM PANTRY_PLUS.INVITEES
  WHERE COHORT_ID = @inviteId
    AND EMAIL = @shopperEmail;

  INSERT INTO PANTRY_PLUS.COHORT_SHOPPER_RELATION (COHORT_ID, SHOPPER_ID)
  VALUES (@inviteId, @shopperId);

COMMIT;