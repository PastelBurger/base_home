import { google, sheets_v4 } from 'googleapis';

export const INQUIRY_SHEETS = [
  '특허출원문의',
  '신규홈피상담요청',
  '개선의견',
  '기술진단결과',
] as const;

export type InquirySheet = (typeof INQUIRY_SHEETS)[number];

export interface SheetSummary {
  sheet: InquirySheet;
  rowCount: number;
}

export interface SheetDetail {
  sheet: InquirySheet;
  headers: string[];
  rows: string[][];
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

export async function getInquirySummaries(): Promise<SheetSummary[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  if (!sheets || !spreadsheetId) return [];

  const ranges = INQUIRY_SHEETS.map((s) => `${s}!A:A`);
  try {
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });
    const valueRanges = response.data.valueRanges || [];
    return INQUIRY_SHEETS.map((sheet, idx) => {
      const values = valueRanges[idx]?.values || [];
      // Subtract 1 for header row; clamp at 0
      const rowCount = Math.max(0, values.length - 1);
      return { sheet, rowCount };
    });
  } catch (error) {
    console.error('Error fetching inquiry summaries:', error);
    return INQUIRY_SHEETS.map((sheet) => ({ sheet, rowCount: 0 }));
  }
}

export async function getInquiryDetail(sheet: InquirySheet): Promise<SheetDetail | null> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();
  if (!sheets || !spreadsheetId) return null;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!A:Z`,
    });
    const values = response.data.values || [];
    if (values.length === 0) {
      return { sheet, headers: [], rows: [] };
    }
    const headers = values[0].map((h) => String(h ?? ''));
    const rows = values.slice(1).map((row) =>
      headers.map((_, i) => String(row[i] ?? ''))
    );
    return { sheet, headers, rows };
  } catch (error) {
    console.error(`Error fetching detail for ${sheet}:`, error);
    return null;
  }
}

export function isValidInquirySheet(value: string): value is InquirySheet {
  return (INQUIRY_SHEETS as readonly string[]).includes(value);
}
