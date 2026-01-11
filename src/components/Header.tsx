export default function Header() {
  return (
    <header
      className="py-16 px-4 text-center rounded-b-3xl mb-8"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 50%, #fef3c7 100%)'
      }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg mb-6">
        <svg
          className="w-8 h-8 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        IPLP 내부 포털
      </h1>
      <p className="text-gray-600 text-lg">
        자주 사용하는 사이트 모음
      </p>
    </header>
  );
}
