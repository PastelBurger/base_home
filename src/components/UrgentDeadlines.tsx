'use client';

import { useEffect, useState } from 'react';
import UrgentCard from './UrgentCard';

interface CaseData {
  ourRef: string;
  applicant: string;
  status: string;
  deadline: string;
  dDay: number;
}

export default function UrgentDeadlines() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/urgent-deadlines');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setCases(data.cases || []);
      } catch (err) {
        console.error('Error fetching urgent deadlines:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Hide section on error
  if (error) return null;

  // Loading state
  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-7 rounded-full bg-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            🚨 긴급 마감 (14일 이내)
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1.5 h-7 rounded-full bg-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          🚨 긴급 마감 (14일 이내)
        </h2>
        <span className="text-sm text-gray-400">
          {cases.length}건
        </span>
      </div>

      {cases.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <span className="text-green-600 font-medium">
            ✅ 시급한 마감 건이 없습니다
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cases.map((caseData, index) => (
            <UrgentCard
              key={`${caseData.ourRef}-${index}`}
              ourRef={caseData.ourRef}
              applicant={caseData.applicant}
              status={caseData.status}
              deadline={caseData.deadline}
              dDay={caseData.dDay}
            />
          ))}
        </div>
      )}
    </section>
  );
}
