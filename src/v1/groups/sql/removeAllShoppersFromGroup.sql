-- removes all shoppers from a group
SET @groupIdTxt = :groupId;

SET @groupId = (SELECT ID FROM GROUP WHERE ID_TXT = @groupIdTxt);

DELETE FROM GROUP_SHOPPER_RELATION
WHERE GROUP_ID = @groupId
;