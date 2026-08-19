-- Re-point this list's membership and this list's category links from one ITEM to another.
-- Leaves the source ITEM intact for other lists and purchase history.
SET @listId = UUID_TO_BIN(:listId);
SET @fromItemId = UUID_TO_BIN(:fromItemId);
SET @toItemId = UUID_TO_BIN(:toItemId);

INSERT IGNORE INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
VALUES (@listId, @toItemId)
;

INSERT IGNORE INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
SELECT @toItemId, icr.CATEGORY_ID
FROM ITEM_CATEGORY_RELATION icr
JOIN CATEGORY c ON c.ID = icr.CATEGORY_ID
WHERE icr.ITEM_ID = @fromItemId
  AND c.LIST_ID = @listId
;

DELETE icr
FROM ITEM_CATEGORY_RELATION icr
JOIN CATEGORY c ON c.ID = icr.CATEGORY_ID
WHERE icr.ITEM_ID = @fromItemId
  AND c.LIST_ID = @listId
;

DELETE FROM LIST_ITEM_RELATION
WHERE LIST_ID = @listId
  AND ITEM_ID = @fromItemId
;
