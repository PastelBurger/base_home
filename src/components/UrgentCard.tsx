interface UrgentCardProps {
  ourRef: string;
  status: string;
  deadline: string;
  dDay: number;
}

function getUrgencyStyle(dDay: number) {
  if (dDay <= 3) {
    return {
      bg: 'bg-red-50',
      border: 'border-red-400',
      badge: 'bg-red-500',
      emoji: '🔴',
    };
  } else if (dDay <= 7) {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-400',
      badge: 'bg-amber-500',
      emoji: '🟠',
    };
  } else {
    return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      badge: 'bg-yellow-500',
      emoji: '🟡',
    };
  }
}

export default function UrgentCard({ ourRef, status, deadline, dDay }: UrgentCardProps) {
  const style = getUrgencyStyle(dDay);
  const targetUrl = 'https://due-date-manage-ver2-production.up.railway.app/';

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group
        block
        p-4
        ${style.bg}
        border-2 ${style.border}
        rounded-xl
        shadow-sm
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
        duration-200
      `}
    >
      {/* Top: Urgency badge + D-DAY */}
      <div className="flex items-center justify-between mb-3">
        <span className={`${style.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}>
          {style.emoji} D-{dDay}
        </span>
      </div>

      {/* Middle: Case number */}
      <div className="text-gray-900 font-semibold text-base mb-2 truncate">
        {ourRef}
      </div>

      {/* Bottom: Status */}
      {status && (
        <div className="text-gray-600 text-sm mb-1 truncate">
          {status}
        </div>
      )}

      {/* Bottom: Deadline */}
      <div className="text-gray-500 text-sm">
        {deadline}
      </div>
    </a>
  );
}
