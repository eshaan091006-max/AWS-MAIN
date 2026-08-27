import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("writes a header row from the column list", () => {
    expect(toCsv([], ["name", "email"])).toBe("name,email");
  });

  it("quotes values containing a comma", () => {
    expect(toCsv([{ name: "Sinha, Eshaan" }], ["name"]).split("\r\n")[1]).toBe('"Sinha, Eshaan"');
  });

  it("doubles embedded quotes", () => {
    expect(toCsv([{ name: 'He said "hi"' }], ["name"]).split("\r\n")[1]).toBe('"He said ""hi"""');
  });

  it("quotes values containing newlines rather than breaking the row", () => {
    const row = toCsv([{ note: "line1\nline2" }], ["note"]);
    expect(row.startsWith("note\r\n")).toBe(true);
    expect(row).toContain('"line1\nline2"');
  });

  it("renders null and undefined as empty", () => {
    expect(toCsv([{ a: null, b: undefined }], ["a", "b"]).split("\r\n")[1]).toBe(",");
  });

  it("neutralises values a spreadsheet would execute as a formula", () => {
    // Excel and Sheets run a cell beginning with = + - @. A registrant could
    // put one in their name, and the export is opened by a club officer.
    for (const dangerous of ["=cmd()", "+1+1", "-1+1", "@SUM(A1)"]) {
      const cell = toCsv([{ a: dangerous }], ["a"]).split("\r\n")[1];
      expect(cell.startsWith("'")).toBe(true);
    }
  });

  it("keeps ordinary values unquoted", () => {
    expect(toCsv([{ a: "plain" }], ["a"]).split("\r\n")[1]).toBe("plain");
  });

  it("only emits the requested columns, in order", () => {
    const csv = toCsv([{ b: 2, a: 1, c: 3 }], ["a", "b"]);
    expect(csv).toBe("a,b\r\n1,2");
  });
});
