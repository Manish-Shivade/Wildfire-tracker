import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import EventCard from './components/EventCard';
import { fetchWildfires } from './utils/api';
import type { WildfireEvent } from './types';

export default function App() {
  const [events, setEvents] = useState<WildfireEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'open' | 'closed' | 'all'>('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWildfires(status);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wildfire data');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header count={events.length} status={status} onStatusChange={setStatus} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Events ({events.length})
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
                  onClick={loadEvents}
                  className="mt-2 text-xs text-orange-500 underline"
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm">No wildfire events found</p>
              </div>
            )}
            {!loading &&
              events.map((event) => (
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
            <Map events={events} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </main>
      </div>
    </div>
  );
}
