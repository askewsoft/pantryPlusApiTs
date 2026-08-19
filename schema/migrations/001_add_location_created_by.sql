-- Additive: LOCATION.CREATED_BY so known locations can include creator + cohort mates.
-- Idempotent: no-op when the column already exists (e.g. fresh setup.sql).

USE PANTRY_PLUS;

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'LOCATION'
    AND COLUMN_NAME = 'CREATED_BY'
);

SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE LOCATION ADD COLUMN CREATED_BY binary(16) NULL, ADD CONSTRAINT fk_location_created_by FOREIGN KEY (CREATED_BY) REFERENCES SHOPPER(ID) ON DELETE SET NULL',
  'SELECT ''LOCATION.CREATED_BY already present'' AS info'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
