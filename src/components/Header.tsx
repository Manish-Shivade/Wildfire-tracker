interface HeaderProps {
  count: number;
  status: 'open' | 'closed' | 'all';
  onStatusChange: (status: 'open' | 'closed' | 'all') => void;
  search: string;
  onSearchChange: (value: string) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  lastUpdated: Date | null;
}

export default function Header({
  count,
  status,
  onStatusChange,
  search,
  onSearchChange,
  autoRefresh,
  onAutoRefreshChange,
  lastUpdated,
}: HeaderProps) {
  return (
    <header className="bg-orange-600 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <h1 className="text-xl font-bold">Wildfire Tracker</h1>
            <p className="text-orange-200 text-sm">
              {count} events — NASA EONET API
              {lastUpdated && (
                <span className="ml-2">
                  · updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events…"
          className="px-3 py-1.5 rounded text-sm text-gray-800 placeholder-gray-400 w-48 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />

        <label className="flex items-center gap-2 text-sm text-orange-100 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
            className="accent-white"
          />
          Auto-refresh (60s)
        </label>

        <div className="flex gap-2">
          {(['open', 'closed', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                status === s
                  ? 'bg-white text-orange-600'
                  : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
