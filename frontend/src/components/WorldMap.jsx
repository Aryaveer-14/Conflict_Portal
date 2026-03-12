import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 1: return '#3FB950'; // green
    case 2: return '#8DDB8C'; // light green
    case 3: return '#F4A261'; // orange
    case 4: return '#E07A5F'; // dark orange
    case 5: return '#E94560'; // red
    default: return '#58A6FF'; // fallback
  }
};

const getSeverityRadius = (severity) => {
  // Decrease radius based on severity for smaller dots
  return severity * 2 + 2; 
};

const WorldMap = ({ events = [], onEventClick }) => {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full absolute inset-0 bg-base"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={10}
        />
        
        {events.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.lat, event.lon]}
            radius={getSeverityRadius(event.severity)}
            pathOptions={{
              fillColor: getSeverityColor(event.severity),
              fillOpacity: 0.6,
              color: getSeverityColor(event.severity),
              weight: 2
            }}
            eventHandlers={{
              click: () => onEventClick && onEventClick(event)
            }}
          >
            <Popup className="custom-popup">
              <div className="font-bold text-base mb-1 text-primary">{event.title}</div>
              <div className="text-sm font-medium mb-1 text-muted">{event.location}</div>
              <div className="text-xs text-muted">Severity Level: <span className="text-primary font-bold">{event.severity}/5</span></div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Leaflet dark mode overrides targeted to this map */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { font-family: inherit; background: #0D1117 !important; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background-color: #161B22 !important;
          color: #E6EDF3 !important;
          border: 1px solid #21262D !important;
        }
        .custom-popup .leaflet-popup-content { margin: 12px 16px; min-width: 150px; }
        .leaflet-control-attribution { 
          background: rgba(22, 27, 34, 0.8) !important; 
          color: #8B949E !important; 
        }
        .leaflet-control-attribution a { color: #58A6FF !important; }
      `}} />
    </div>
  );
};

export default WorldMap;
