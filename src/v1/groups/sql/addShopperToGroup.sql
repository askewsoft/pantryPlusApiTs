-- adds a shopper to a group of shoppers and return its shopper_id

SET @shopperIdTxt = :shopperId;
SET @groupIdTxt = :groupId;

SET @groupId = (SELECT ID FROM GROUP WHERE ID_TXT = @groupIdTxt);
SET @shopperId = (SELECT ID FROM SHOPPER WHERE ID_TXT = @shopperIdTxt);

INSERT INTO GROUP_SHOPPER_RELATION (GROUP_ID, SHOPPER_ID)
VALUES (@groupId, @shopperId)
;

SELECT gsr.ID_TXT as ID
FROM GROUP_SHOPPER_RELATION gsr
JOIN SHOPPER sh on sh.SHOPPER_ID = gsr.SHOPPER_ID
WHERE GROUP_ID = @groupId
  and sh.EMAIL = @shopperEmail
;
