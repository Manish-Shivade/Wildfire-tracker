import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { WildfireEvent } from '../types';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

// Fix default marker icons for Vite/webpack builds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const fireIcon = L.divIcon({
  html: '🔥',
  className: 'fire-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface FlyToProps {
  events: WildfireEvent[];
  selectedId: string | null;
}

function FlyTo({ events, selectedId }: FlyToProps) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const event = events.find((e) => e.id === selectedId);
    if (!event?.geometry?.length) return;
    const g = event.geometry[event.geometry.length - 1];
    if (g.type === 'Point') {
      const [lng, lat] = g.coordinates as number[];
      map.flyTo([lat, lng], 6, { duration: 1 });
    }
  }, [selectedId, events, map]);

  return null;
}

interface MapProps {
  events: WildfireEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Map({ events, selectedId, onSelect }: MapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo events={events} selectedId={selectedId} />
      <MarkerClusterGroup chunkedLoading maxClusterRadius={50} spiderfyOnMaxZoom>
        {events.map((event) => {
          const g = event.geometry[event.geometry.length - 1];
          if (!g || g.type !== 'Point') return null;
          const [lng, lat] = g.coordinates as number[];
          return (
            <Marker
              key={event.id}
              position={[lat, lng]}
              icon={fireIcon}
              eventHandlers={{ click: () => onSelect(event.id) }}
            >
              <Popup>
                <strong>{event.title}</strong>
                <br />
                <span className="text-xs">{new Date(g.date).toLocaleDateString()}</span>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
