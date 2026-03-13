import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MapPanel from '../components/MapPanel';
import InsightsPanel from '../components/InsightsPanel';
import EventDeepDive from '../components/EventDeepDive';

// Mock Conflict Data for Sidebar
// Added 'severity' property exactly as passed to the Map
const mockConflicts = [
  // Europe / Middle East / Africa
  { id: 1,  title: "Ukraine Conflict Escalation",         location: "Ukraine",          date: "2026-03-10", severity: 5, lat: 48.38,   lon: 31.17   },
  { id: 2,  title: "Red Sea Shipping Tensions",           location: "Yemen",            date: "2026-03-09", severity: 4, lat: 15.55,   lon: 48.52   },
  { id: 3,  title: "Sudan Civil Unrest",                  location: "Sudan",            date: "2026-03-08", severity: 5, lat: 12.86,   lon: 30.22   },
  { id: 4,  title: "Taiwan Strait Incursions",            location: "Taiwan",           date: "2026-03-12", severity: 3, lat: 23.69,   lon: 120.96  },
  { id: 5,  title: "Eastern DRC Clashes",                 location: "DR Congo",         date: "2026-03-07", severity: 4, lat: -4.03,   lon: 21.75   },
  { id: 6,  title: "Gaza-Israel Ongoing Hostilities",     location: "Gaza Strip",       date: "2026-03-11", severity: 5, lat: 31.35,   lon: 34.31   },
  { id: 7,  title: "Sahel Insurgency",                    location: "Mali / Burkina Faso", date: "2026-03-06", severity: 4, lat: 12.36, lon: -1.53  },
  // South America
  { id: 8,  title: "Ecuador Gang Violence Escalation",    location: "Ecuador",          date: "2026-03-10", severity: 4, lat: -1.83,   lon: -78.18  },
  { id: 9,  title: "Colombia FARC Dissident Activity",    location: "Colombia",         date: "2026-03-09", severity: 3, lat: 4.57,    lon: -74.30  },
  { id: 10, title: "Haiti Security Crisis",               location: "Haiti",            date: "2026-03-08", severity: 4, lat: 18.97,   lon: -72.29  },
  { id: 11, title: "Venezuela Border Tensions",           location: "Venezuela",        date: "2026-03-07", severity: 3, lat: 6.42,    lon: -66.59  },
  { id: 12, title: "Peru Narco-Insurgency Clashes",       location: "Peru",             date: "2026-03-06", severity: 2, lat: -9.19,   lon: -75.02  },
  // North America
  { id: 13, title: "Mexico Cartel Territorial Conflict",  location: "Mexico",           date: "2026-03-11", severity: 4, lat: 23.63,   lon: -102.55 },
  { id: 14, title: "US-Mexico Border Crisis",             location: "US–Mexico Border", date: "2026-03-10", severity: 2, lat: 28.93,   lon: -107.61 },
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
