interface LinkCardProps {
  name: string;
  url: string;
  color: string;
}

export default function LinkCard({ name, url, color }: LinkCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        block
        p-5
        bg-white
        border border-gray-200
        rounded-xl
        shadow-sm
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
        duration-200
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-gray-700 group-hover:text-gray-900 font-medium flex-1 min-w-0 truncate">
          {name}
        </span>
        <svg
          className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-teal-600 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </a>
  );
}
