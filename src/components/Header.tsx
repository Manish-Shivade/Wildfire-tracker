interface HeaderProps {
  count: number;
  status: 'open' | 'closed' | 'all';
  onStatusChange: (status: 'open' | 'closed' | 'all') => void;
}

export default function Header({ count, status, onStatusChange }: HeaderProps) {
  return (
    <header className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <h1 className="text-xl font-bold">Wildfire Tracker</h1>
          <p className="text-orange-200 text-sm">{count} events — NASA EONET API</p>
        </div>
      </div>
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
    </header>
  );
}
