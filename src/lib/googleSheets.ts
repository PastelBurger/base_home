import { google } from 'googleapis';

export interface CaseData {
  ourRef: string;
  applicant: string;
  status: string;
  deadline: string;
  dDay: number;
}

export async function getUrgentDeadlines(): Promise<CaseData[]> {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountKey || !sheetId) {
      console.error('Missing Google Sheets credentials');
      return [];
    }

    const credentials = JSON.parse(serviceAccountKey);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: '진행중!A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Assume first row is header
    const headers = rows[0];
    const ourRefIndex = headers.findIndex((h: string) =>
      h.toUpperCase().includes('OURREF') || h.includes('사건번호') || h.includes('OUR REF')
    );
    const statusIndex = headers.findIndex((h: string) =>
      h.includes('현재상태') || h.includes('상태') || h.toUpperCase().includes('STATUS')
    );
    const deadlineIndex = headers.findIndex((h: string) =>
      h.includes('사건마감일') || h.includes('마감일')
    );
    const applicantIndex = headers.findIndex((h: string) =>
      h.includes('출원인') || h.includes('고객') || h.toUpperCase().includes('APPLICANT')
    );

    if (ourRefIndex === -1 || deadlineIndex === -1) {
      console.error('Required columns not found');
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cases: CaseData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const ourRef = row[ourRefIndex] || '';
      const applicant = applicantIndex !== -1 ? (row[applicantIndex] || '') : '';
      const status = statusIndex !== -1 ? (row[statusIndex] || '') : '';
      const deadlineStr = row[deadlineIndex] || '';

      if (!ourRef || !deadlineStr) continue;

      // Parse deadline date (supports various formats)
      const deadline = parseDate(deadlineStr);
      if (!deadline) continue;

      const diffTime = deadline.getTime() - today.getTime();
      const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Filter: only include cases within 14 days
      if (dDay >= 0 && dDay <= 14) {
        cases.push({
          ourRef,
          applicant,
          status,
          deadline: formatDeadline(deadline),
          dDay,
        });
      }
    }

    // Sort by D-DAY ascending (most urgent first)
    cases.sort((a, b) => a.dDay - b.dDay);

    return cases;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return [];
  }
}

function parseDate(dateStr: string): Date | null {
  // Try various date formats
  const formats = [
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // YYYY/MM/DD
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
    // MM-DD-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year, month, day;
      if (match[1].length === 4) {
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        month = parseInt(match[1]) - 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]);
      }
      return new Date(year, month, day);
    }
  }

  // Try native Date parsing as fallback
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

function formatDeadline(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  return `${month}-${day} (${dayName})`;
}
