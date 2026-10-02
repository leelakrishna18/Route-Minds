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
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: zoom,
        zoomControl: true,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom pulse icon for location
      const pinIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: #D32F2F; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(211,47,47,0.8); cursor: pointer;"></div>
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

      // Invalidate size once DOM stabilizes
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      mapInstanceRef.current.panTo([latitude, longitude]);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.getPopup()?.setContent(`<b>${markerTitle}</b><br>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
      if (circleRef.current && accuracy) {
        circleRef.current.setLatLng([latitude, longitude]);
        circleRef.current.setRadius(accuracy);
      }
    }
  }, [latitude, longitude, accuracy, markerTitle, zoom]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], zoom, { duration: 1.2 });
      markerRef.current?.openPopup();
    }
  };

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        style={{ touchAction: 'none' }}
      />
      <button
        type="button"
        onClick={handleRecenter}
        title="Recenter on My Location"
        className="absolute top-3 right-3 z-[1000] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
      >
        <span>🎯 Recenter</span>
      </button>
    </div>
  );
};
