import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icons
const createCustomIcon = (color: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = createCustomIcon('#3b82f6'); // Blue
const hospitalIcon = createCustomIcon('#ef4444'); // Red
const pharmacyIcon = createCustomIcon('#22c55e'); // Green
const clinicIcon = createCustomIcon('#0ea5e9'); // Sky Blue
const doctorsIcon = createCustomIcon('#f59e0b'); // Amber

interface MapPoint {
  id?: number;
  lat: number;
  lng: number;
  label?: string;
  type?: 'pharmacy' | 'hospital' | 'clinic' | 'doctors' | 'user';
}

interface MapPreviewProps {
  centerLat: number;
  centerLng: number;
  userLat: number;
  userLng: number;
  precision?: number;
  points?: MapPoint[];
  selectedPointId?: number;
}

// Component to handle map centering when coordinates change
function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number, zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (zoom) {
      map.setView([lat, lng], zoom);
    } else {
      map.setView([lat, lng]);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

export const MapPreview = ({ centerLat, centerLng, userLat, userLng, precision, points, selectedPointId }: MapPreviewProps) => {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 bg-gray-50">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={selectedPointId ? 17 : 15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>Votre position</Popup>
        </Marker>
        
        {/* Additional Points */}
        {points?.map((p, idx) => {
          const isSelected = p.id === selectedPointId;
          return (
            <Marker 
              key={`${p.lat}-${p.lng}-${idx}`} 
              position={[p.lat, p.lng]}
              icon={
                p.type === 'hospital' ? hospitalIcon : 
                p.type === 'pharmacy' ? pharmacyIcon : 
                p.type === 'clinic' ? clinicIcon :
                p.type === 'doctors' ? doctorsIcon :
                undefined
              }
              eventHandlers={{
                add: (e) => {
                  if (isSelected) {
                    e.target.openPopup();
                  }
                },
              }}
            >
              {p.label && (
                <Popup autoPan={true}>
                  <div className="p-1">
                    <div className="font-black text-gray-900 mb-0.5">{p.label}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {p.type === 'hospital' ? 'Hôpital' : 
                       p.type === 'pharmacy' ? 'Pharmacie' :
                       p.type === 'clinic' ? 'Clinique' :
                       p.type === 'doctors' ? 'Médecin' : ''}
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}

        {precision && (
          <Circle 
            center={[userLat, userLng]} 
            radius={precision} 
            pathOptions={{ 
              fillColor: '#3b82f6', 
              color: '#3b82f6', 
              weight: 1, 
              fillOpacity: 0.1 
            }} 
          />
        )}
        <RecenterMap 
          lat={centerLat} 
          lng={centerLng} 
          zoom={selectedPointId ? 17 : undefined} 
        />
      </MapContainer>
    </div>
  );
};
