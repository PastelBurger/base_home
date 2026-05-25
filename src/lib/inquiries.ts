import { google, sheets_v4 } from 'googleapis';

export const INQUIRY_SHEETS = [
  '특허출원문의',
  '신규홈피상담요청',
  '개선의견',
  '기술진단결과',
] as const;

export type InquirySheet = (typeof INQUIRY_SHEETS)[number];

const TIMESTAMP_KEYWORDS = ['타임스탬프', 'timestamp', '진단일시', '일시', '날짜', '시간'] as const;

export interface SheetSummary {
  sheet: InquirySheet;
  totalCount: number;
  newCount: number;
  highWaterMark: number;
  hasTimestamp: boolean;
  debug?: SheetDebug;
}

export interface SheetDebug {
  headers: string[];
  tsColIdx: number;
  tsHeader: string | null;
  lastSeen: number;
  lastSeenFormatted: string | null;
  highWaterMarkFormatted: string | null;
  sampleTimestamps: { row: number; raw: unknown; formatted: string | null; isNew: boolean }[];
  rowCount: number;
}

export interface SheetDetail {
  sheet: InquirySheet;
  headers: string[];
  rows: string[][];
  highWaterMark: number;
}

function getSheetsClient(): sheets_v4.Sheets | null {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY');
    return null;
  }
  const credentials = JSON.parse(serviceAccountKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

function getSheetId(): string | null {
  const id = process.env.GOOGLE_INQUIRY_SHEET_ID;
  if (!id) {
    console.error('Missing GOOGLE_INQUIRY_SHEET_ID');
    return null;
  }
  return id;
}

function findTimestampColumn(headers: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  // Pass 1: exact match (case-insensitive)
  for (const kw of TIMESTAMP_KEYWORDS) {
    const idx = normalized.indexOf(kw.toLowerCase());
    if (idx !== -1) return idx;
  }
  // Pass 2: contains
  for (const kw of TIMESTAMP_KEYWORDS) {
    const idx = normalized.findIndex((h) => h.includes(kw.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

function emptySummary(sheet: InquirySheet): SheetSummary {
  return { sheet, totalCount: 0, newCount: 0, highWaterMark: 0, hasTimestamp: false };
}

function safeFormatSerial(n: number): string | null {
  if (!looksLikeDateSerial(n)) return null;
  return formatSerialDate(n);
}

function toSerial(cell: unknown): number {
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return 0;
  const s = cell.trim();
  if (!s) return 0;
  const m = s.match(
    /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (m) {
    const y = +m[1];
    const mo = +m[2] - 1;
    const d = +m[3];
    const hh = +(m[4] || 0);
    const mi = +(m[5] || 0);
    const se = +(m[6] || 0);
    const ms = Date.UTC(y, mo, d, hh, mi, se);
    return ms / 86400000 + 25569;
  }
  const native = Date.parse(s);
  if (!Number.isNaN(native)) return native / 86400000 + 25569;
  return 0;
}

export let lastSummariesError: string | null = null;
export let lastSummariesEarlyExit: string | null = null;

export async function getInquirySummaries(
  lastSeenMap: Record<string, number>,
  options: { debug?: boolean } = {}
): Promise<SheetSummary[]> {
  lastSummariesError = null;
  lastSummariesEarlyExit = null;
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  if (!sheets || !spreadsheetId) {
    lastSummariesEarlyExit = !sheets
      ? 'getSheetsClient() returned null (missing/invalid GOOGLE_SERVICE_ACCOUNT_KEY)'
      : 'getSheetId() returned null (missing GOOGLE_INQUIRY_SHEET_ID)';
    return INQUIRY_SHEETS.map(emptySummary);
  }

  const ranges = INQUIRY_SHEETS.map((s) => `${s}!A:Z`);
  try {
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'SERIAL_NUMBER',
    });
    const valueRanges = response.data.valueRanges || [];

    return INQUIRY_SHEETS.map((sheet, idx) => {
      const values = (valueRanges[idx]?.values || []) as unknown[][];
      if (values.length === 0) {
        const empty = emptySummary(sheet);
        if (options.debug) {
          empty.debug = {
            headers: [],
            tsColIdx: -1,
            tsHeader: null,
            lastSeen: lastSeenMap[sheet] ?? 0,
            lastSeenFormatted: safeFormatSerial(lastSeenMap[sheet] ?? 0),
            highWaterMarkFormatted: null,
            sampleTimestamps: [],
            rowCount: 0,
          };
        }
        return empty;
      }

      const headers = values[0].map((h) => String(h ?? ''));
      const dataRows = values.slice(1);
      const tsCol = findTimestampColumn(headers);
      const lastSeen = lastSeenMap[sheet] ?? 0;

      if (tsCol === -1) {
        const total = dataRows.length;
        const summary: SheetSummary = {
          sheet,
          totalCount: total,
          newCount: Math.max(0, total - lastSeen),
          highWaterMark: total,
          hasTimestamp: false,
        };
        if (options.debug) {
          summary.debug = {
            headers,
            tsColIdx: -1,
            tsHeader: null,
            lastSeen,
            lastSeenFormatted: null,
            highWaterMarkFormatted: null,
            sampleTimestamps: [],
            rowCount: total,
          };
          console.log(`[inquiries] ${sheet} fallback rowCount mode`, summary.debug);
        }
        return summary;
      }

      let highWaterMark = 0;
      let newCount = 0;
      const samples: SheetDebug['sampleTimestamps'] = [];
      dataRows.forEach((row, ri) => {
        const cell = row[tsCol];
        const ts = toSerial(cell);
        if (ts > highWaterMark) highWaterMark = ts;
        const isNew = ts > lastSeen;
        if (isNew) newCount++;
        if (options.debug && (ri < 3 || ri >= dataRows.length - 3 || isNew)) {
          samples.push({
            row: ri + 2,
            raw: cell,
            formatted: ts > 0 ? safeFormatSerial(ts) : null,
            isNew,
          });
        }
      });

      const summary: SheetSummary = {
        sheet,
        totalCount: dataRows.length,
        newCount,
        highWaterMark,
        hasTimestamp: true,
      };
      if (options.debug) {
        summary.debug = {
          headers,
          tsColIdx: tsCol,
          tsHeader: headers[tsCol],
          lastSeen,
          lastSeenFormatted: safeFormatSerial(lastSeen),
          highWaterMarkFormatted: safeFormatSerial(highWaterMark),
          sampleTimestamps: samples.slice(0, 20),
          rowCount: dataRows.length,
        };
        console.log(`[inquiries] ${sheet}`, {
          tsHeader: summary.debug.tsHeader,
          tsColIdx: summary.debug.tsColIdx,
          lastSeen,
          lastSeenFormatted: summary.debug.lastSeenFormatted,
          highWaterMarkFormatted: summary.debug.highWaterMarkFormatted,
          totalCount: summary.totalCount,
          newCount,
        });
      }
      return summary;
    });
  } catch (error) {
    console.error('Error fetching inquiry summaries:', error);
    lastSummariesError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return INQUIRY_SHEETS.map(emptySummary);
  }
}

function formatSerialDate(serial: number): string {
  // Google Sheets serial date: days since 1899-12-30
  const ms = (serial - 25569) * 86400 * 1000;
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function looksLikeDateSerial(n: number): boolean {
  // Reasonable range: 1990-01-01 (32874) to 2100-12-31 (73415)
  return n > 30000 && n < 80000;
}

export async function getInquiryDetail(sheet: InquirySheet): Promise<SheetDetail | null> {
  const sheetsApi = getSheetsClient();
  const spreadsheetId = getSheetId();
  if (!sheetsApi || !spreadsheetId) return null;

  try {
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!A:Z`,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'SERIAL_NUMBER',
    });
    const values = (response.data.values || []) as unknown[][];
    if (values.length === 0) {
      return { sheet, headers: [], rows: [], highWaterMark: 0 };
    }

    const headers = values[0].map((h) => String(h ?? ''));
    const dataRows = values.slice(1);
    const tsCol = findTimestampColumn(headers);

    let highWaterMark = tsCol === -1 ? dataRows.length : 0;

    const rows = dataRows.map((row) =>
      headers.map((_, i) => {
        const cell = row[i];
        if (cell == null) return '';
        if (i === tsCol) {
          const ts = toSerial(cell);
          if (ts > highWaterMark) highWaterMark = ts;
          if (typeof cell === 'number') return formatSerialDate(cell);
          return String(cell);
        }
        if (typeof cell === 'number') {
          if (looksLikeDateSerial(cell)) return formatSerialDate(cell);
          return String(cell);
        }
        if (typeof cell === 'boolean') return cell ? 'TRUE' : 'FALSE';
        return String(cell);
      })
    );

    return { sheet, headers, rows, highWaterMark };
  } catch (error) {
    console.error(`Error fetching detail for ${sheet}:`, error);
    return null;
  }
}

export function isValidInquirySheet(value: string): value is InquirySheet {
  return (INQUIRY_SHEETS as readonly string[]).includes(value);
}
