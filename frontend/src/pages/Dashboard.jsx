import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MapPanel from '../components/MapPanel';
import InsightsPanel from '../components/InsightsPanel';
import EventDeepDive from '../components/EventDeepDive';
import useConflictData from '../hooks/useConflictData';

const Dashboard = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { events } = useConflictData();

  const liveConflicts = events.map((event) => ({
    ...event,
    location: event.location || event.country || event.region || 'Unknown location',
    date: event.date || event.event_date || new Date().toISOString(),
    lat: event.lat ?? event.latitude ?? 0,
    lon: event.lon ?? event.longitude ?? 0,
    severity: Math.max(1, Math.min(5, Math.round((event.severity ?? 1) / 2))),
  }));

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-base relative">
      
      {/* Left Sidebar: Active Conflicts */}
      <Sidebar conflicts={liveConflicts} />
      
      {/* Center Panel: Map Area */}
      <MapPanel events={liveConflicts} onEventClick={handleEventClick} />
      
      {/* Right Sidebar: Intelligence Narratives & Trends */}
      <InsightsPanel />
      
      {/* Absolute slide-in Panel overlay rendered exactly upon selecting event */}
      {selectedEvent && (
        <EventDeepDive 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
      
    </div>
  );
};

export default Dashboard;
