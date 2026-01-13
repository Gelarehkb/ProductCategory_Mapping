import Papa from "papaparse";

interface CategoryRecord {
  [key: string]: string;
}

function fixUmlauts(s: string): string {
  try {
    // Attempt to fix double-encoded UTF-8 (latin1 -> utf8)
    const bytes = new Uint8Array([...s].map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    // Check if decoding produced valid result
    if (decoded && !decoded.includes("�")) {
      return decoded;
    }
    return s;
  } catch {
    return s;
  }
}

export function processCategories(csvContent: string, prefix: string): string {
  // Parse CSV with semicolon delimiter
  const parsed = Papa.parse<string[]>(csvContent, {
    delimiter: ";",
    skipEmptyLines: true,
  });

  if (parsed.data.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  // Get headers and clean them
  const headers = parsed.data[0].map(h => h.trim());
  const idCol = headers[0];
  const catsCol = headers[1];

  if (!idCol || !catsCol) {
    throw new Error("CSV must have at least two columns (ID and Categories)");
  }

  const records: CategoryRecord[] = [];
  let maxDepth = 0;

  // Process each row (skip header)
  for (let i = 1; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const aid = (row[0] || "").trim();
    const raw = row[1] || "";

    // Fix potential umlaut encoding issues
    const fixedRaw = fixUmlauts(raw);

    // Split by newlines and filter empty lines
    const lines = fixedRaw
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x.length > 0);

    for (const path of lines) {
      // Split by "->" and clean parts
      const parts = path.split("->").map(c => c.trim());
      maxDepth = Math.max(maxDepth, parts.length);

      const rec: CategoryRecord = { [idCol]: aid };
      parts.forEach((part, idx) => {
        rec[`cat${idx + 1}`] = part;
      });
      records.push(rec);
    }
  }

  if (records.length === 0) {
    throw new Error("No categories found in the file");
  }

  // Ensure all records have all cat columns
  for (const rec of records) {
    for (let i = 1; i <= maxDepth; i++) {
      if (!rec[`cat${i}`]) {
        rec[`cat${i}`] = "";
      }
    }
  }

  // Build output columns
  const outputCols = [idCol, ...Array.from({ length: maxDepth }, (_, i) => `cat${i + 1}`)];

  // Build output data
  const outputData = records.map(rec => outputCols.map(col => rec[col] || ""));

  // Generate CSV with semicolon delimiter
  const result = Papa.unparse({
    fields: outputCols,
    data: outputData,
  }, {
    delimiter: ";",
  });

  // Add BOM for Excel UTF-8 compatibility
  return "\ufeff" + result;
}

export function generateOutputFilename(prefix: string): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${prefix}_categories_${dd}${mm}${yyyy}.csv`;
}
