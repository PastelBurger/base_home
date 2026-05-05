'use client';

import { useCallback, useEffect, useState } from 'react';

const SHEETS = ['특허출원문의', '신규홈피상담요청', '개선의견', '기술진단결과'] as const;
type Sheet = (typeof SHEETS)[number];

interface Summary {
  sheet: Sheet;
  totalCount: number;
  newCount: number;
  highWaterMark: number;
  hasTimestamp: boolean;
}

interface Detail {
  sheet: Sheet;
  headers: string[];
  rows: string[][];
}

const ACCENTS: Record<Sheet, { bar: string; badge: string; icon: string }> = {
  특허출원문의: { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', icon: '📋' },
  신규홈피상담요청: { bar: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700', icon: '💬' },
  개선의견: { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', icon: '💡' },
  기술진단결과: { bar: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', icon: '🔬' },
};

export default function InquiryNotifications() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeSheet, setActiveSheet] = useState<Sheet | null>(null);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);

  const fetchSummaries = useCallback(async () => {
    try {
      const res = await fetch('/api/inquiries/summary', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setSummaries(data.summaries || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  function openSheet(sheet: Sheet) {
    setActiveSheet(sheet);
    setPassword('');
    setPwError('');
    setDetail(null);
  }

  function closeModal() {
    const wasViewing = !!detail;
    setActiveSheet(null);
    setDetail(null);
    setPassword('');
    setPwError('');
    if (wasViewing) fetchSummaries();
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSheet || submitting) return;
    setSubmitting(true);
    setPwError('');
    try {
      const res = await fetch('/api/inquiries/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: activeSheet, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || '확인에 실패했습니다.');
        return;
      }
      setDetail(data.detail);
    } catch {
      setPwError('요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1.5 h-7 rounded-full bg-indigo-500" />
        <h2 className="text-xl font-semibold text-gray-900">📨 신규 문의/의견</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHEETS.map((sheet) => {
            const summary = summaries.find((s) => s.sheet === sheet);
            const total = summary?.totalCount ?? 0;
            const newCount = summary?.newCount ?? 0;
            const accent = ACCENTS[sheet];
            return (
              <button
                key={sheet}
                onClick={() => openSheet(sheet)}
                className="relative text-left bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-5 rounded-full ${accent.bar}`} />
                    <span className="text-base">{accent.icon}</span>
                    <span className="font-medium text-gray-900 text-sm">{sheet}</span>
                  </div>
                  {newCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-bold rounded-full bg-red-500 text-white">
                      {newCount}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900">{total}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
                    {newCount > 0 ? `신규 ${newCount}건` : '확인 완료'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeSheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {ACCENTS[activeSheet].icon} {activeSheet}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {!detail ? (
              <form onSubmit={submitPassword} className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  상세 내역을 보려면 비밀번호를 입력하세요.
                </p>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {pwError && (
                  <p className="text-sm text-red-600">{pwError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !password}
                    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? '확인 중...' : '확인'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="overflow-auto p-4">
                {detail.rows.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">데이터가 없습니다.</p>
                ) : (
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        {detail.headers.map((h, i) => (
                          <th
                            key={i}
                            className="text-left font-medium text-gray-700 px-3 py-2 border-b border-gray-200 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-gray-50">
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className="px-3 py-2 border-b border-gray-100 align-top text-gray-800"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
