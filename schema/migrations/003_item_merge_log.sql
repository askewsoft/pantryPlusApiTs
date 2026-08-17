-- Additive: audit log for ITEM consolidations (Phase 1+). Idempotent.

CREATE TABLE IF NOT EXISTS ITEM_MERGE_LOG (
    ID binary(16) default (uuid_to_bin(uuid())) not null primary key,
    LOSER_ID binary(16) NOT NULL,
    CANONICAL_ID binary(16) NOT NULL,
    REASON varchar(64) NOT NULL,
    APPLIED_AT datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_item_merge_log_canonical (CANONICAL_ID),
    INDEX idx_item_merge_log_loser (LOSER_ID)
);
