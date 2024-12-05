-- gets all categories for a shopping list

SET @listIdTxt = :listId;

SELECT bin_to_uuid(ID) as ID, NAME
FROM CATEGORY
WHERE LIST_ID = uuid_to_bin(@listIdTxt)
;
