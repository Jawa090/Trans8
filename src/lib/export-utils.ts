/* CSV & PDF export helpers */

/**
 * Convert an array of objects to a CSV string.
 */
export function toCsv(rows: Record<string, string | number>[], columns: string[]): string {
  const header = columns.map((c) => `"${c}"`).join(",");
  const body = rows
    .map((row) => columns.map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mime = "text/csv") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Build a CSV filename with a date stamp.
 */
export function csvFilename(prefix: string, ext = "csv") {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}_${stamp}.${ext}`;
}

/**
 * Open a print-friendly receipt window for saving as PDF.
 * Returns the newly opened window so the caller can close it later if needed.
 */
export function printReceipt(title: string, sections: { label: string; value: string }[]): Window | null {
  const w = window.open("", "_blank");
  if (!w) return null;

  const rows = sections
    .map((s) => `<tr><td style="padding:6px 12px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #eee;white-space:nowrap">${s.label}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;border-bottom:1px solid #eee">${s.value}</td></tr>`)
    .join("");

  w.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #fff; color: #111; }
    .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; }
    .header .sub { font-size: 11px; color: #666; font-family: monospace; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; text-align: center; font-family: monospace; }
    .btn { display: inline-block; margin-top: 16px; padding: 8px 20px; background: #000; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; }
    .btn:hover { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="sub">Issued ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
  </div>
  <table>${rows}</table>
  <div class="footer">TRANS8 Logistics OS — Official Receipt</div>
  <div class="no-print" style="text-align:center">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>
`);
  w.document.close();
  return w;
}
