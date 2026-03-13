import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import MapPanel from '../components/MapPanel';
import InsightsPanel from '../components/InsightsPanel';
import EventDeepDive from '../components/EventDeepDive';
import { eventsAPI } from '../api/client';

// Fallback mock data in case API is unreachable
const FALLBACK_CONFLICTS = [
  { id: 1, title: "Ukraine Conflict Escalation", location: "Kyiv, Ukraine", date: "2025-03-10", severity: 5, lat: 48.38, lon: 31.17 },
  { id: 2, title: "Red Sea Shipping Tensions", location: "Yemen", date: "2025-03-09", severity: 4, lat: 15.55, lon: 48.52 },
  { id: 3, title: "Sudan Civil Unrest", location: "Khartoum, Sudan", date: "2025-03-08", severity: 5, lat: 12.86, lon: 30.22 },
  { id: 4, title: "Taiwan Strait Incursions", location: "Taiwan Strait", date: "2025-03-12", severity: 3, lat: 23.69, lon: 120.96 },
  { id: 5, title: "Eastern DRC Clashes", location: "DR Congo", date: "2025-03-07", severity: 4, lat: -4.03, lon: 21.75 }
];

// Map API severity strings to numeric values for the frontend
const severityToNumber = (sev) => {
  switch (sev) {
    case 'critical': return 5;
    case 'high': return 4;
    case 'medium': return 3;
    case 'low': return 2;
    default: return 3;
  }
};

// Transform backend event shape to frontend shape
const transformEvent = (evt) => ({
  id: evt.id,
  title: evt.title,
  location: evt.country,
  date: evt.date ? evt.date.split('T')[0] : '',
  severity: severityToNumber(evt.severity),
  lat: evt.latitude,
  lon: evt.longitude,
  casualties: evt.casualties,
  displaced: evt.displaced,
  description: evt.description,
  region: evt.region,
});

const Dashboard = () => {
  const [conflicts, setConflicts] = useState(FALLBACK_CONFLICTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await eventsAPI.getAll(50);
      const data = res.data;
      const events = data?.data?.events || data?.events || [];
      if (events.length > 0) {
        setConflicts(events.map(transformEvent));
      }
    } catch (err) {
      console.warn('[Dashboard] Using fallback data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex h-[calc(100vh-48px)] w-full overflow-hidden bg-base relative">
      {loading && (
        <div className="absolute top-2 right-2 z-50 text-[9px] font-mono text-muted animate-pulse tracking-widest">
          SYNCING...
        </div>
      )}
      
      {/* Left Sidebar: Active Conflicts Feed */}
      <Sidebar
        conflicts={conflicts}
        onConflictClick={handleEventClick}
        selectedId={selectedEvent?.id}
      />
      
      {/* Center: World Map (primary focus) */}
      <MapPanel events={conflicts} onEventClick={handleEventClick} />
      
      {/* Right Sidebar: Intelligence + Markets */}
      <InsightsPanel />
      
      {/* Deep dive overlay */}
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
