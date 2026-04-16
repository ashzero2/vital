import { parse } from "csv-parse/sync";

export interface RawParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCSV(buffer: Buffer): RawParseResult {
  // Strip UTF-8 BOM if present
  let content = buffer.toString("utf-8");
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  // Fallback to latin1 if UTF-8 produces replacement chars
  if (content.includes("\uFFFD")) {
    content = buffer.toString("latin1");
  }

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(records[0]);
  return { headers, rows: records };
}
