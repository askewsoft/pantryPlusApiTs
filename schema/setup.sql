/*
CREATE DATABASE IF NOT EXISTS PANTRY_PLUS;
*/

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.SHOPPER
(
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    ID_TXT varchar(36) generated always as
        (insert(
            insert(
                insert(
                    insert(hex(ID),9,0,'-'),
                    14,0,'-'),
                19,0,'-'),
            24,0,'-')
        ) virtual,
    EMAIL varchar(256) UNIQUE,
    NICKNAME varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.LOCATION (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    ID_TXT varchar(36) generated always as
        (insert(
            insert(
                insert(
                    insert(hex(ID),9,0,'-'),
                    14,0,'-'),
                19,0,'-'),
            24,0,'-')
    ) virtual,
    NAME varchar(100) NOT NULL,
    GEO_LOCATION POINT NOT NULL SRID 4326
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.CATEGORY (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    ID_TXT varchar(36) generated always as
        (insert(
            insert(
                insert(
                    insert(hex(ID),9,0,'-'),
                    14,0,'-'),
                19,0,'-'),
            24,0,'-')
    ) virtual,
    NAME varchar(100) NOT NULL,
    LIST_ID binary(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.GROUP (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    ID_TXT varchar(36) generated always as
        (insert(
            insert(
                insert(
                    insert(hex(ID),9,0,'-'),
                    14,0,'-'),
                19,0,'-'),
            24,0,'-')
    ) virtual,
    NAME varchar(100) NOT NULL,
    OWNER_ID binary(16) NOT NULL,
    FOREIGN KEY (OWNER_ID)
        REFERENCES PANTRY_PLUS.SHOPPER(ID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.ITEM (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    ID_TXT varchar(36) generated always as
        (insert(
            insert(
                insert(
                    insert(hex(ID),9,0,'-'),
                    14,0,'-'),
                19,0,'-'),
            24,0,'-')
    ) virtual,
    NAME varchar(100) NOT NULL,
    UPC char(15),
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.ITEM_CATEGORY_RELATION (
    ITEM_ID binary(16) NOT NULL,
    CATEGORY_ID binary(16) NOT NULL,
    INDEX (ITEM_ID, CATEGORY_ID),
    FOREIGN KEY (ITEM_ID)
        REFERENCES PANTRY_PLUS.ITEM(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (CATEGORY_ID)
        REFERENCES PANTRY_PLUS.CATEGORY(ID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.GROUP_SHOPPER_RELATION (
    GROUP_ID binary(16) NOT NULL,
    SHOPPER_ID binary(16) NOT NULL,
    INDEX (GROUP_ID, SHOPPER_ID),
    FOREIGN KEY (GROUP_ID)
        REFERENCES PANTRY_PLUS.GROUP(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (SHOPPER_ID)
        REFERENCES PANTRY_PLUS.SHOPPER(ID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.LIST (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    ID_TXT varchar(36) generated always as
        (insert(
            insert(
                insert(
                    insert(hex(ID),9,0,'-'),
                    14,0,'-'),
                19,0,'-'),
            24,0,'-')
        ) virtual,
    NAME varchar(100) NOT NULL,
    OWNER_ID binary(16) NOT NULL,
    GROUP_ID binary(16),
    INDEX (ID, OWNER_ID),
    INDEX (NAME, OWNER_ID),
    INDEX (ID, GROUP_ID),
    FOREIGN KEY (GROUP_ID)
        REFERENCES PANTRY_PLUS.GROUP(ID)
        ON DELETE NO ACTION,
    FOREIGN KEY (OWNER_ID)
        REFERENCES PANTRY_PLUS.SHOPPER(ID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.LIST_ITEM_RELATION (
    LIST_ID binary(16) NOT NULL,
    ITEM_ID binary(16) NOT NULL,
    INDEX (LIST_ID, ITEM_ID),
    FOREIGN KEY (LIST_ID)
        REFERENCES PANTRY_PLUS.LIST(ID)
        ON DELETE NO ACTION,
    FOREIGN KEY (ITEM_ID)
        REFERENCES PANTRY_PLUS.ITEM(ID)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.PURCHASE_HISTORY (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    PURCHASE_DATE date NOT NULL,
    LOCATION_ID binary(16) NOT NULL,
    LIST_ID binary(16) NOT NULL,
    LOCATION_NAME varchar(100) NOT NULL,
    CATEGORY_NAME varchar(100),
    CATEGORY_ID binary(16),
    INDEX (ID, LIST_ID, LOCATION_ID),
    INDEX (PURCHASE_DATE, LIST_ID, LOCATION_ID),
    FOREIGN KEY (LIST_ID)
        REFERENCES PANTRY_PLUS.LIST(ID)
        ON DELETE NO ACTION,
    FOREIGN KEY (LOCATION_ID)
        REFERENCES PANTRY_PLUS.LOCATION(ID)
        ON DELETE NO ACTION,
    FOREIGN KEY (CATEGORY_ID)
        REFERENCES PANTRY_PLUS.CATEGORY(ID)
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.ITEM_HISTORY_RELATION (
    ITEM_ID binary(16) NOT NULL,
    PURCHASE_HISTORY_ID binary(16) NOT NULL,
    PURCHASED_BY binary(16) NOT NULL,
    INDEX (ITEM_ID, PURCHASE_HISTORY_ID),
    FOREIGN KEY (ITEM_ID)
        REFERENCES PANTRY_PLUS.ITEM(ID)
        ON DELETE NO ACTION,
    FOREIGN KEY (PURCHASE_HISTORY_ID)
        REFERENCES PANTRY_PLUS.PURCHASE_HISTORY(ID)
        ON DELETE NO ACTION,
    FOREIGN KEY (PURCHASED_BY)
        REFERENCES PANTRY_PLUS.SHOPPER(ID)
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS PANTRY_PLUS.CATEGORY_ORDER (
    CATEGORY_ID binary(16) NOT NULL,
    LOCATION_ID binary(16) NOT NULL,
    ORDINAL int NOT NULL DEFAULT 0,
    INDEX (CATEGORY_ID, LOCATION_ID),
    FOREIGN KEY (CATEGORY_ID)
        REFERENCES PANTRY_PLUS.CATEGORY(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (LOCATION_ID)
        REFERENCES PANTRY_PLUS.LOCATION(ID)
        ON DELETE CASCADE
);
