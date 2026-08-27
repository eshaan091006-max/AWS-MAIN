const NEEDS_QUOTING = /[",\r\n]/;

// Excel and Google Sheets execute a cell that begins with any of these. A
// registrant controls their own name and email, and the export is opened by a
// club officer — so the untrusted value gets a leading apostrophe, which
// spreadsheets treat as "this is text".
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = String(value);
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;
  if (NEEDS_QUOTING.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

/**
 * Renders rows as CSV.
 *
 * Columns are explicit rather than derived from the first row's keys: an
 * export should not silently gain a column because one record happened to
 * carry an extra field, and column order in a register matters.
 *
 * Rows are joined with CRLF, which is what RFC 4180 specifies and what Excel
 * expects — LF alone puts everything on one line in some versions.
 */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const lines = [columns.map(cell).join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => cell(row[column])).join(","));
  }
  return lines.join("\r\n");
}
