import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getSeverityColor = (severity) => {
  if (severity >= 5) return '#FF4D4D';
  if (severity >= 4) return '#F4A261';
  if (severity >= 3) return '#58A6FF';
  return '#3FB950';
};

const getSeverityLabel = (severity) => {
  if (severity >= 5) return 'CRITICAL';
  if (severity >= 4) return 'HIGH RISK';
  if (severity >= 3) return 'MONITORING';
  return 'LOW';
};

// Custom pulsing markers component
const PulsingMarkers = ({ events, onEventClick }) => {
  const map = useMap();

  useEffect(() => {
    const markers = [];

    events.forEach((event) => {
      const color = getSeverityColor(event.severity);
      const size = event.severity >= 5 ? 10 : event.severity >= 4 ? 8 : 6;

      // Create pulsing marker using divIcon
      const pulseHtml = `
        <div style="position:relative;width:${size * 2}px;height:${size * 2}px;display:flex;align-items:center;justify-content:center;">
          <div style="
            position:absolute;
            width:${size * 2}px;
            height:${size * 2}px;
            border-radius:50%;
            background:${color};
            opacity:0.3;
            animation: radar-pulse 2s ease-out infinite;
          "></div>
          <div style="
            position:absolute;
            width:${size * 3}px;
            height:${size * 3}px;
            border-radius:50%;
            border:1px solid ${color};
            opacity:0.15;
            animation: radar-ping 3s ease-out infinite 0.5s;
          "></div>
          <div style="
            position:relative;
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            box-shadow: 0 0 ${size}px ${color}80, 0 0 ${size * 2}px ${color}40;
            z-index:2;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: pulseHtml,
        className: '',
        iconSize: [size * 3, size * 3],
        iconAnchor: [size * 1.5, size * 1.5],
      });

      const marker = L.marker([event.lat, event.lon], { icon })
        .addTo(map)
        .on('click', () => onEventClick && onEventClick(event));

      // Custom popup
      const popupContent = `
        <div style="font-family:Inter,system-ui,sans-serif;">
          <div style="font-size:12px;font-weight:700;color:#E6EDF3;margin-bottom:4px;">${event.title}</div>
          <div style="font-size:10px;color:#8B949E;margin-bottom:6px;">${event.location}</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="
              width:6px;height:6px;border-radius:50%;
              background:${color};
              box-shadow:0 0 6px ${color}80;
            "></span>
            <span style="font-size:9px;font-family:'JetBrains Mono',monospace;font-weight:700;color:${color};letter-spacing:0.1em;">
              ${getSeverityLabel(event.severity)}
            </span>
            <span style="font-size:9px;color:#8B949E;margin-left:auto;">SEV ${event.severity}/5</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'intel-popup',
        maxWidth: 220,
        closeButton: false,
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.remove());
    };
  }, [map, events, onEventClick]);

  return null;
};

const WorldMap = ({ events = [], onEventClick }) => {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[20, 15]}
        zoom={2.5}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true}
        className="h-full w-full absolute inset-0"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={10}
        />
        {/* Separate labels layer on top for better readability */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={10}
          pane="overlayPane"
        />

        <PulsingMarkers events={events} onEventClick={onEventClick} />
      </MapContainer>

      {/* Map overlay grid effect */}
      <div className="absolute inset-0 pointer-events-none z-[400]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(13,17,23,0.6) 100%)',
        }}
      />

      {/* Corner coordinates display */}
      <div className="absolute bottom-2 left-2 z-[500] px-2 py-1 bg-base/80 backdrop-blur-sm rounded border border-hover/40">
        <span className="text-[9px] font-mono text-muted tracking-wider">LAT 20.00° N • LON 15.00° E</span>
      </div>
    </div>
  );
};

export default WorldMap;
