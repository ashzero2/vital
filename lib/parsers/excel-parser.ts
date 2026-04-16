import * as XLSX from "xlsx";
import type { RawParseResult } from "./csv-parser";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function parseExcel(buffer: Buffer): RawParseResult {
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("File exceeds the 5 MB size limit.");
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Excel file contains no sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false, // keep values as strings for uniform handling
  });

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(rows[0]);
  return { headers, rows };
}
