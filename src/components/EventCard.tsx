import type { WildfireEvent } from '../types';

interface EventCardProps {
  event: WildfireEvent;
  isSelected: boolean;
  onClick: () => void;
}

export default function EventCard({ event, isSelected, onClick }: EventCardProps) {
  const latestGeometry = event.geometry[event.geometry.length - 1];
  const date = latestGeometry
    ? new Date(latestGeometry.date).toLocaleDateString()
    : 'Unknown date';

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer border transition-all ${
        isSelected
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 bg-white hover:border-orange-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug">{event.title}</h3>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            event.closed ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'
          }`}
        >
          {event.closed ? 'Closed' : 'Active'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">📅 {date}</p>
      {event.sources.length > 0 && (
        <a
          href={event.sources[0].url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-orange-500 hover:underline mt-1 inline-block"
        >
          View Source ↗
        </a>
      )}
    </div>
  );
}
