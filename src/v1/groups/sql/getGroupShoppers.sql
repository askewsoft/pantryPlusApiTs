-- gets shoppers in a group
SET @groupIdTxt = :groupId;
SET @groupId = (SELECT ID FROM GROUP WHERE ID_TXT = @groupIdTxt);

SELECT s.ID_TXT AS ID, s.NICKNAME, s.EMAIL
FROM GROUP_SHOPPER_RELATION gsr
JOIN SHOPPER s ON gsr.SHOPPER_ID = s.ID
WHERE gsr.GROUP_ID = @groupId
;