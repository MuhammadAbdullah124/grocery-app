export interface ScannedProductFields {
  barcode?: string;
  name?: string;
  brand?: string;
  description?: string;
  /** Raw category name as found in the scan — categories are user-managed, matched by name in the UI. */
  categoryName?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  /** Raw unit name as found in the scan — units are user-managed (e.g. "250ml"), matched by name in the UI. */
  unitName?: string;
  image?: string;
}

export interface ParsedScanResult {
  /** Always populated — the cleanest value we could find to use as the barcode/SKU lookup key. */
  barcode: string;
  /** Every field we managed to recognize, including barcode. */
  fields: ScannedProductFields;
  format: 'json' | 'gs1-digital-link' | 'url-query' | 'key-value' | 'raw';
}

const FIELD_ALIASES: Record<keyof ScannedProductFields, string[]> = {
  barcode: ['barcode', 'code', 'sku', 'gtin', 'ean', 'upc', '01'],
  name: ['name', 'title', 'productname', 'product_name', 'itemname'],
  brand: ['brand', 'manufacturer', 'maker'],
  description: ['description', 'desc', 'details'],
  categoryName: ['category', 'cat', 'type'],
  price: ['price', 'mrp', 'amount', 'rate'],
  discountPrice: ['discountprice', 'discount_price', 'saleprice', 'sale_price', 'offerprice'],
  stock: ['stock', 'qty', 'quantity', 'stockqty', 'stock_qty'],
  unitName: ['unit', 'uom'],
  image: ['image', 'img', 'imageurl', 'image_url', 'photo'],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/_/g, '');
}

function toNumber(value: unknown): number | undefined {
  const n = typeof value === 'string' ? Number(value.trim()) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? n : undefined;
}

/** Maps a bag of loosely-keyed values (from JSON/query-string/key-value pairs) onto known product fields. */
function mapToFields(raw: Record<string, unknown>): ScannedProductFields {
  const fields: ScannedProductFields = {};
  const normalizedEntries = Object.entries(raw).map(([k, v]) => [normalizeKey(k), v] as const);

  for (const [fieldName, aliases] of Object.entries(FIELD_ALIASES) as [keyof ScannedProductFields, string[]][]) {
    const normalizedAliases = aliases.map(normalizeKey);
    const match = normalizedEntries.find(([k]) => normalizedAliases.includes(k));
    if (!match || match[1] == null || match[1] === '') continue;
    const value = String(match[1]);

    switch (fieldName) {
      case 'price':
      case 'discountPrice':
      case 'stock': {
        const num = toNumber(value);
        if (num !== undefined) (fields[fieldName] as number) = num;
        break;
      }
      default:
        (fields[fieldName] as string) = value.trim();
    }
  }

  return fields;
}

/** GS1 Digital Link / GS1 element-string style payloads, e.g. https://id.gs1.org/01/06190000000017/10/LOT4521/17/260930 */
function parseGs1(data: string): ScannedProductFields | null {
  const aiMatches = [...data.matchAll(/\((\d{2,4})\)([^(]+)/g)];
  const segments = aiMatches.length
    ? aiMatches.map(([, ai, val]) => [ai, val] as const)
    : (() => {
        const parts = data.split('/').filter(Boolean);
        const pairs: [string, string][] = [];
        for (let i = 0; i < parts.length - 1; i += 2) {
          if (/^\d{2,4}$/.test(parts[i])) pairs.push([parts[i], parts[i + 1]]);
        }
        return pairs;
      })();

  if (segments.length === 0) return null;

  const fields: ScannedProductFields = {};
  for (const [ai, value] of segments) {
    if (ai === '01') fields.barcode = value.trim();
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

function looksLikeGs1(data: string): boolean {
  return /^https?:\/\/[^/]+\/01\/\d+/i.test(data) || /\(01\)\d+/.test(data);
}

/** `key=value` pairs joined by `;`, `|`, `&`, or newlines — a common flat format for printed product labels. */
function parseKeyValue(data: string): ScannedProductFields | null {
  const pairs = data.split(/[;|&\n]+/).map((p) => p.trim()).filter(Boolean);
  if (pairs.length < 2) return null;

  const raw: Record<string, string> = {};
  for (const pair of pairs) {
    const [key, ...rest] = pair.split(/[:=]/);
    if (!key || rest.length === 0) return null;
    raw[key] = rest.join('=');
  }

  const fields = mapToFields(raw);
  return Object.keys(fields).length > 0 ? fields : null;
}

function parseUrlQuery(data: string): ScannedProductFields | null {
  try {
    const url = new URL(data);
    if (![...url.searchParams.keys()].length) return null;
    const raw: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      raw[key] = value;
    });
    const fields = mapToFields(raw);
    return Object.keys(fields).length > 0 ? fields : null;
  } catch {
    return null;
  }
}

function parseJson(data: string): ScannedProductFields | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const fields = mapToFields(parsed as Record<string, unknown>);
      return Object.keys(fields).length > 0 ? fields : null;
    }
  } catch {
    // not JSON
  }
  return null;
}

/**
 * Extracts as much product data as possible out of a scanned code. Since real-world QR
 * content varies wildly (plain SKU, GS1 Digital Link, a custom JSON/URL/key-value payload
 * from a supplier, or just another barcode symbology), every format below is attempted in
 * turn. Whatever isn't recognized still falls back to today's behavior: the raw string used
 * as the barcode.
 */
export function parseScannedCode(data: string, type: string): ParsedScanResult {
  const trimmed = data.trim();

  if (type === 'qr') {
    const json = parseJson(trimmed);
    if (json) return finish(trimmed, json, 'json');

    if (looksLikeGs1(trimmed)) {
      const gs1 = parseGs1(trimmed);
      if (gs1) return finish(trimmed, gs1, 'gs1-digital-link');
    }

    const query = parseUrlQuery(trimmed);
    if (query) return finish(trimmed, query, 'url-query');

    const kv = parseKeyValue(trimmed);
    if (kv) return finish(trimmed, kv, 'key-value');
  }

  return finish(trimmed, {}, 'raw');
}

function finish(raw: string, fields: ScannedProductFields, format: ParsedScanResult['format']): ParsedScanResult {
  const barcode = fields.barcode ?? raw;
  return { barcode, fields: { ...fields, barcode }, format };
}
