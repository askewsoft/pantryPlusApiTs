function displayItemName(name) {
  return String(name ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeItemName(name) {
  return displayItemName(name).toLowerCase();
}

function tokenSortKey(name) {
  return normalizeItemName(name)
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

function fuzzyDistance(a, b) {
  const na = normalizeItemName(a);
  const nb = normalizeItemName(b);
  if (na === nb) return 0;
  const ta = tokenSortKey(a);
  const tb = tokenSortKey(b);
  if (ta === tb) return 0;
  return Math.min(levenshtein(na, nb), levenshtein(ta, tb));
}

function areFuzzyCandidates(a, b, maxDistance) {
  const na = normalizeItemName(a);
  const nb = normalizeItemName(b);
  if (!na || !nb || na === nb) return false;
  const minLen = Math.min(na.length, nb.length);
  if (minLen < 3) return false;
  const dist = fuzzyDistance(a, b);
  if (dist === 0) return true;
  return dist <= maxDistance;
}

function compareCanonical(a, b) {
  if (b.purchaseCount !== a.purchaseCount) return b.purchaseCount - a.purchaseCount;
  const aDate = a.lastPurchase || '';
  const bDate = b.lastPurchase || '';
  if (aDate !== bDate) return aDate < bDate ? 1 : -1;
  if (b.name.length !== a.name.length) return b.name.length - a.name.length;
  if (a.name !== b.name) return a.name < b.name ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

function pickCanonical(members) {
  return [...members].sort(compareCanonical)[0];
}

function sortPlacements(placements) {
  return [...placements].sort((a, b) => {
    if (a.list !== b.list) return a.list.localeCompare(b.list);
    const ac = a.category || '';
    const bc = b.category || '';
    if (!a.category && b.category) return 1;
    if (a.category && !b.category) return -1;
    return ac.localeCompare(bc);
  });
}

function memberRecord(item) {
  return {
    id: item.id,
    name: item.name,
    purchases: item.purchaseCount,
    last_purchase: item.lastPurchase,
    upc: item.upc || null,
    placements: sortPlacements(item.placements || []),
  };
}

function groupRecord({ apply, reason, members }) {
  const keep = pickCanonical(members);
  return {
    apply,
    reason,
    keep_id: keep.id,
    keep_name: keep.name,
    members: members.map(memberRecord),
  };
}

class UnionFind {
  constructor(ids) {
    this.parent = new Map(ids.map((id) => [id, id]));
  }

  find(id) {
    let cur = id;
    while (this.parent.get(cur) !== cur) {
      this.parent.set(cur, this.parent.get(this.parent.get(cur)));
      cur = this.parent.get(cur);
    }
    return cur;
  }

  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

function clusterFuzzy(items, maxDistance) {
  if (items.length < 2) return [];
  const uf = new UnionFind(items.map((i) => i.id));
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (areFuzzyCandidates(items[i].name, items[j].name, maxDistance)) {
        uf.union(items[i].id, items[j].id);
      }
    }
  }
  const buckets = new Map();
  for (const item of items) {
    const root = uf.find(item.id);
    if (!buckets.has(root)) buckets.set(root, []);
    buckets.get(root).push(item);
  }
  return [...buckets.values()].filter((group) => group.length > 1);
}

async function loadPlacementsByItemId(conn) {
  const [rows] = await conn.query(`
    SELECT
      BIN_TO_UUID(lir.ITEM_ID) AS itemId,
      l.NAME AS listName,
      cat.NAME AS categoryName
    FROM LIST_ITEM_RELATION lir
    JOIN LIST l ON l.ID = lir.LIST_ID
    LEFT JOIN (
      SELECT icr.ITEM_ID, c.LIST_ID, c.NAME AS NAME
      FROM ITEM_CATEGORY_RELATION icr
      INNER JOIN CATEGORY c ON c.ID = icr.CATEGORY_ID
    ) cat ON cat.ITEM_ID = lir.ITEM_ID AND cat.LIST_ID = lir.LIST_ID
  `);

  const byItem = new Map();
  for (const row of rows) {
    if (!byItem.has(row.itemId)) byItem.set(row.itemId, []);
    byItem.get(row.itemId).push({
      list: row.listName,
      category: row.categoryName || null,
    });
  }
  for (const [itemId, placements] of byItem.entries()) {
    byItem.set(itemId, sortPlacements(placements));
  }
  return byItem;
}

async function loadItems(conn) {
  const [rows] = await conn.query(`
    SELECT
      BIN_TO_UUID(i.ID) AS id,
      i.NAME AS name,
      i.NAME_NORMALIZED AS nameNormalized,
      i.UPC AS upc,
      COALESCE(h.purchase_count, 0) AS purchaseCount,
      DATE_FORMAT(h.last_purchase, '%Y-%m-%d') AS lastPurchase
    FROM ITEM i
    LEFT JOIN (
      SELECT
        ihr.ITEM_ID,
        COUNT(*) AS purchase_count,
        MAX(ph.PURCHASE_DATE) AS last_purchase
      FROM ITEM_HISTORY_RELATION ihr
      INNER JOIN PURCHASE_HISTORY ph
        ON ph.ID = ihr.PURCHASE_HISTORY_ID
      GROUP BY ihr.ITEM_ID
    ) h ON h.ITEM_ID = i.ID
    ORDER BY i.NAME ASC, i.ID ASC
  `);
  const placementsByItem = await loadPlacementsByItemId(conn);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    nameNormalized: row.nameNormalized || normalizeItemName(row.name),
    upc: row.upc,
    purchaseCount: Number(row.purchaseCount) || 0,
    lastPurchase: row.lastPurchase || null,
    placements: placementsByItem.get(row.id) || [],
  }));
}

module.exports = {
  displayItemName,
  normalizeItemName,
  tokenSortKey,
  levenshtein,
  fuzzyDistance,
  areFuzzyCandidates,
  compareCanonical,
  pickCanonical,
  memberRecord,
  groupRecord,
  clusterFuzzy,
  loadItems,
  sortPlacements,
};
