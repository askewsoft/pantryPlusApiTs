-- updates a shopping list and returns the list_id

SET @listId = :listId;
SET @groupId = :groupId;
SET @ownerId = :ownerId;
SET @name = :name;

SET @origName = (SELECT NAME FROM LIST WHERE ID_TXT = @listId);
SET @name = (SELECT COALESCE(@name, @origName));

SET @origGroupId = (SELECT GROUP_ID FROM LIST WHERE ID_TXT = @listId);
SET @groupId = (SELECT COALESCE(@groupId, @origGroupId));

SET @origOwnerId = (SELECT OWNER_ID FROM LIST WHERE ID_TXT = @listId);
SET @ownerId = (SELECT COALESCE(@ownerId, @origOwnerId));

UPDATE LIST
SET NAME = @name, OWNER_ID = @ownerId, GROUP_ID = @groupId
WHERE ID_TXT = @listId
;

SELECT ID_TXT as ID
FROM LIST
WHERE ID_TXT = @listId
;
