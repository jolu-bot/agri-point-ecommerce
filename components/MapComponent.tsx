'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: 'farm' | 'market' | 'distribution' | 'event' | 'other';
  icon?: string;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

export default function MapComponent({
  center = [46.603354, 1.888334], // Centre de la France
  zoom = 6,
  markers = [],
  height = '500px',
  onMarkerClick,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialiser la carte
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Nettoyer les markers existants
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

    // Ajouter les nouveaux markers
    markers.forEach((marker) => {
      if (!mapRef.current) return;

      // Icône personnalisée selon le type
      let markerIcon;
      const iconColors: Record<'farm' | 'market' | 'distribution' | 'event' | 'other', string> = {
        farm: '#10b981', // vert
        market: '#f59e0b', // orange
        distribution: '#3b82f6', // bleu
        event: '#8b5cf6', // violet
        other: '#6b7280', // gris
      };

      const color = iconColors[marker.type || 'other'];
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            <div style="
              transform: rotate(45deg);
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              font-weight: bold;
            ">📍</div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: customIcon,
      }).addTo(mapRef.current);

      // Popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${marker.title}</h3>
          ${marker.description ? `<p style="margin-bottom: 8px; color: #666;">${marker.description}</p>` : ''}
          <p style="color: #999; font-size: 12px;">
            ${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}
          </p>
        </div>
      `;

      leafletMarker.bindPopup(popupContent);

      // Event click
      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker);
        });
      }
    });

    // Ajuster la vue si markers
    if (markers.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, markers, onMarkerClick]);

  return (
    <div
      ref={mapContainerRef}
      {...{ style: { height, width: '100%' } }}
      className="rounded-lg overflow-hidden shadow-lg z-0"
    />
  );
}
