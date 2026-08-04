import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import EventCard from './components/EventCard';
import ErrorBoundary from './components/ErrorBoundary';
import { fetchWildfires } from './utils/api';
import type { WildfireEvent } from './types';

const AUTO_REFRESH_INTERVAL_MS = 60_000;

export default function App() {
  const [events, setEvents] = useState<WildfireEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'open' | 'closed' | 'all'>('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadEvents = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!isBackgroundRefresh) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await fetchWildfires(status);
        setEvents(data.events);
        setLastUpdated(new Date());
        if (isBackgroundRefresh) setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wildfire data');
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => loadEvents(true), AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, loadEvents]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((event) => event.title.toLowerCase().includes(q));
  }, [events, search]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header
        count={filteredEvents.length}
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        lastUpdated={lastUpdated}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Events ({filteredEvents.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-sm">Loading events...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-sm text-red-500">{error}</p>
                <button
                  onClick={() => loadEvents()}
                  className="mt-2 text-xs text-orange-500 underline"
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm">
                  {search ? 'No events match your search' : 'No wildfire events found'}
                </p>
              </div>
            )}
            {!loading &&
              filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSelected={selectedId === event.id}
                  onClick={() => setSelectedId(event.id)}
                />
              ))}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          {!loading && (
            <ErrorBoundary>
              <Map events={filteredEvents} selectedId={selectedId} onSelect={setSelectedId} />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}
