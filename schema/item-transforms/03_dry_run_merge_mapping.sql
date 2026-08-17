-- Optional inventory: exact/case-only loser → canonical ranking (same pick order as generate).
-- Does not modify data. The apply path is npm run item-dedupe:apply with a reviewed mapping file.

WITH purchase_stats AS (
  SELECT
    ihr.ITEM_ID,
    COUNT(*) AS purchase_count,
    MAX(ph.PURCHASE_DATE) AS last_purchase
  FROM ITEM_HISTORY_RELATION ihr
  INNER JOIN PURCHASE_HISTORY ph
    ON ph.ID = ihr.PURCHASE_HISTORY_ID
  GROUP BY ihr.ITEM_ID
),
ranked AS (
  SELECT
    i.ID,
    i.NAME,
    i.NAME_NORMALIZED,
    i.UPC,
    COALESCE(ps.purchase_count, 0) AS purchase_count,
    ps.last_purchase,
    ROW_NUMBER() OVER (
      PARTITION BY i.NAME_NORMALIZED
      ORDER BY
        COALESCE(ps.purchase_count, 0) DESC,
        ps.last_purchase DESC,
        CHAR_LENGTH(i.NAME) DESC,
        i.NAME ASC,
        i.ID ASC
    ) AS rn
  FROM ITEM i
  INNER JOIN (
    SELECT NAME_NORMALIZED
    FROM ITEM
    WHERE NAME_NORMALIZED IS NOT NULL
      AND NAME_NORMALIZED <> ''
    GROUP BY NAME_NORMALIZED
    HAVING COUNT(*) > 1
  ) d
    ON d.NAME_NORMALIZED = i.NAME_NORMALIZED
  LEFT JOIN purchase_stats ps
    ON ps.ITEM_ID = i.ID
)
SELECT
  loser.NAME_NORMALIZED AS name_normalized,
  BIN_TO_UUID(loser.ID) AS loser_id,
  loser.NAME AS loser_name,
  loser.purchase_count AS loser_purchase_count,
  BIN_TO_UUID(winner.ID) AS canonical_id,
  winner.NAME AS canonical_name,
  winner.purchase_count AS canonical_purchase_count,
  'exact_normalized_name' AS reason
FROM ranked loser
INNER JOIN ranked winner
  ON winner.NAME_NORMALIZED = loser.NAME_NORMALIZED
 AND winner.rn = 1
WHERE loser.rn > 1
ORDER BY loser.NAME_NORMALIZED ASC, loser.rn ASC
;
