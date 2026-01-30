import Papa from "papaparse";

export interface CSVRow {
  [header: string]: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
  errors: Papa.ParseError[];
}

export function parseCSV(csvText: string): ParsedCSV {
  const result = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  return {
    headers: result.meta.fields || [],
    rows: result.data,
    errors: result.errors,
  };
}

export function previewCSV(csvText: string, maxRows: number = 10): ParsedCSV {
  const lines = csvText.split("\n");
  const previewLines = lines.slice(0, maxRows + 1).join("\n");

  return parseCSV(previewLines);
}

