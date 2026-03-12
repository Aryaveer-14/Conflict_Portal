import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MapPanel from '../components/MapPanel';
import InsightsPanel from '../components/InsightsPanel';
import EventDeepDive from '../components/EventDeepDive';

// Mock Conflict Data for Sidebar
// Added 'severity' property exactly as passed to the Map
const mockConflicts = [
  { id: 1, title: "Ukraine Conflict Escalation", location: "Ukraine", date: "2025-03-10", severity: 5, lat: 48.38, lon: 31.17 },
  { id: 2, title: "Red Sea Shipping Tensions", location: "Yemen", date: "2025-03-09", severity: 4, lat: 15.55, lon: 48.52 },
  { id: 3, title: "Sudan Civil Unrest", location: "Sudan", date: "2025-03-08", severity: 5, lat: 12.86, lon: 30.22 },
  { id: 4, title: "Taiwan Strait Incursions", location: "Taiwan", date: "2025-03-12", severity: 3, lat: 23.69, lon: 120.96 },
  { id: 5, title: "Eastern DRC Clashes", location: "DR Congo", date: "2025-03-07", severity: 4, lat: -4.03, lon: 21.75 }
];

const Dashboard = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-base relative">
      
      {/* Left Sidebar: Active Conflicts */}
      <Sidebar conflicts={mockConflicts} />
      
      {/* Center Panel: Map Area */}
      <MapPanel events={mockConflicts} onEventClick={handleEventClick} />
      
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
