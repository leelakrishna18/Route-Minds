import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  markerTitle?: string;
  zoom?: number;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  accuracy,
  markerTitle = "Current Location",
  zoom = 15
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom pulse icon for location
      const pinIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: #D32F2F; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(211,47,47,0.8);"></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([latitude, longitude], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${markerTitle}</b><br>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`)
        .openPopup();

      let circle: L.Circle | null = null;
      if (accuracy) {
        circle = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#D32F2F',
          fillColor: '#FFCDD2',
          fillOpacity: 0.25,
          weight: 1
        }).addTo(map);
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      mapInstanceRef.current.setView([latitude, longitude], zoom);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.getPopup()?.setContent(`<b>${markerTitle}</b><br>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
      if (circleRef.current && accuracy) {
        circleRef.current.setLatLng([latitude, longitude]);
        circleRef.current.setRadius(accuracy);
      }
    }

    return () => {
      // Keep map reference or cleanup on unmount
    };
  }, [latitude, longitude, accuracy, markerTitle, zoom]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
