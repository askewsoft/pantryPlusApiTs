-- v2 clients insert a new ITEM row per add, including duplicate display names.
-- Uniqueness is enforced in v3 application code (find-or-create), not the schema,
-- while /v2 remains mounted. Idempotent.

USE PANTRY_PLUS;

SET @idx_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ITEM'
    AND INDEX_NAME = 'uq_item_name_normalized'
);

SET @ddl_drop = IF(
  @idx_exists > 0,
  'ALTER TABLE ITEM DROP INDEX uq_item_name_normalized',
  'SELECT ''uq_item_name_normalized already absent'' AS info'
);

PREPARE stmt FROM @ddl_drop;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @lookup_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ITEM'
    AND INDEX_NAME = 'idx_item_name_normalized'
);

SET @ddl_idx = IF(
  @lookup_exists > 0,
  'SELECT ''idx_item_name_normalized already present'' AS info',
  'ALTER TABLE ITEM ADD INDEX idx_item_name_normalized (NAME_NORMALIZED)'
);

PREPARE stmt FROM @ddl_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
