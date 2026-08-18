-- Alternate search names for ITEM rows (reviewed batch apply; not runtime fuzzy merge).
-- Idempotent.

SET @tbl_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ITEM_ALIAS'
);

SET @ddl = IF(
  @tbl_exists = 0,
  'CREATE TABLE ITEM_ALIAS (
    ALIAS_NORMALIZED varchar(100) NOT NULL,
    ITEM_ID binary(16) NOT NULL,
    ALIAS_NAME varchar(100) NOT NULL,
    PRIMARY KEY (ALIAS_NORMALIZED),
    INDEX idx_item_alias_item (ITEM_ID),
    FOREIGN KEY (ITEM_ID)
      REFERENCES ITEM(ID)
      ON DELETE CASCADE
  )',
  'SELECT ''ITEM_ALIAS already present'' AS info'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
