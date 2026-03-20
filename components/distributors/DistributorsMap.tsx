'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type L from 'leaflet';

// Fix default icon URLs for Leaflet in Next.js (webpack asset hashing issue)
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L = require('leaflet') as typeof import('leaflet');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface Distributor {
  _id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  coordinates: { lat: number; lng: number };
}

interface Props {
  distributors: Distributor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function DistributorsMap({ distributors, selectedId, onSelect }: Props) {
  useEffect(() => {
    fixLeafletIcons();
    // Import Leaflet CSS dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const hasMarkers = distributors.length > 0;
  const center: [number, number] = hasMarkers
    ? [distributors[0].coordinates.lat, distributors[0].coordinates.lng]
    : [5.5, 12.5]; // Cameroun default center

  return (
    <MapContainer
      center={center}
      zoom={hasMarkers ? 8 : 6}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      {distributors.map(d => (
        <Marker
          key={d._id}
          position={[d.coordinates.lat, d.coordinates.lng]}
          eventHandlers={{ click: () => onSelect(d._id) }}
        >
          <Popup>
            <strong className="block mb-0.5">{d.name}</strong>
            <span className="block text-xs text-gray-500">{d.address}, {d.city}</span>
            <a href={`tel:${d.phone}`} className="block text-xs text-emerald-700 mt-1">{d.phone}</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
