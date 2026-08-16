/**
 * Display form: NFKC, trim, collapse internal whitespace. Preserves casing.
 */
export function displayItemName(name: string): string {
  return name
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Uniqueness / match key: display form lowercased.
 */
export function normalizeItemName(name: string): string {
  return displayItemName(name).toLowerCase();
}
