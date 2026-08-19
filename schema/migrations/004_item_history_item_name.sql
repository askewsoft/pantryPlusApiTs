-- Additive: snapshot ITEM.NAME onto purchase history so later renames/forks
-- do not rewrite historical display. Idempotent.

USE PANTRY_PLUS;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ITEM_HISTORY_RELATION'
    AND COLUMN_NAME = 'ITEM_NAME'
);

SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE ITEM_HISTORY_RELATION ADD COLUMN ITEM_NAME varchar(100) NULL',
  'SELECT ''ITEM_HISTORY_RELATION.ITEM_NAME already present'' AS info'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE ITEM_HISTORY_RELATION ihr
INNER JOIN ITEM i ON i.ID = ihr.ITEM_ID
SET ihr.ITEM_NAME = i.NAME
WHERE ihr.ITEM_NAME IS NULL
;
