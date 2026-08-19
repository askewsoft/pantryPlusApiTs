-- Additive: ITEM.NAME_NORMALIZED for case/whitespace-insensitive uniqueness.
-- Idempotent column/index adds. Unique index is skipped when duplicate keys remain
-- (run Phase 1 exact/case-only merge first, then re-run or add the unique index).
-- Migration 006 drops the unique index while /v2 is live (v2 inserts duplicate names).

USE PANTRY_PLUS;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ITEM'
    AND COLUMN_NAME = 'NAME_NORMALIZED'
);

SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE ITEM ADD COLUMN NAME_NORMALIZED varchar(100) NULL',
  'SELECT ''ITEM.NAME_NORMALIZED already present'' AS info'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill: lower(trim(name)); collapse runs of whitespace in app layer going forward
UPDATE ITEM
SET NAME_NORMALIZED = LOWER(TRIM(NAME))
WHERE NAME_NORMALIZED IS NULL
   OR NAME_NORMALIZED = ''
;

SET @null_remaining = (
  SELECT COUNT(*)
  FROM ITEM
  WHERE NAME_NORMALIZED IS NULL
);

SET @ddl_not_null = IF(
  @null_remaining = 0,
  'ALTER TABLE ITEM MODIFY COLUMN NAME_NORMALIZED varchar(100) NOT NULL',
  'SELECT ''Skipping NOT NULL: NULL NAME_NORMALIZED values remain'' AS info'
);

PREPARE stmt FROM @ddl_not_null;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ITEM'
    AND INDEX_NAME = 'uq_item_name_normalized'
);

SET @dup_count = (
  SELECT COUNT(*)
  FROM (
    SELECT NAME_NORMALIZED
    FROM ITEM
    WHERE NAME_NORMALIZED IS NOT NULL
    GROUP BY NAME_NORMALIZED
    HAVING COUNT(*) > 1
  ) d
);

SET @ddl_uq = IF(
  @idx_exists > 0,
  'SELECT ''uq_item_name_normalized already present'' AS info',
  IF(
    @dup_count = 0,
    'ALTER TABLE ITEM ADD UNIQUE KEY uq_item_name_normalized (NAME_NORMALIZED)',
    'SELECT ''Skipping unique index: duplicate NAME_NORMALIZED values remain; run Phase 1 merge first'' AS info'
  )
);

PREPARE stmt FROM @ddl_uq;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
