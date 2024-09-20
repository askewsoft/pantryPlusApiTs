SET @name = :name;
SET @groupIdTxt = :groupId;

SET @groupId = (SELECT ID FROM GROUP WHERE ID_TXT = @groupIdTxt);

UPDATE GROUP
SET NAME = @name
WHERE GROUP_ID = @groupId
;