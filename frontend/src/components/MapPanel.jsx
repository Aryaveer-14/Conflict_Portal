import WorldMap from './WorldMap';

const MapPanel = ({ events, onEventClick }) => {
  return (
    <div className="flex-1 bg-base relative flex items-center justify-center h-[calc(100vh-64px)] w-full z-0 overflow-hidden border-x border-hover">
      {/* Background radial gradient just to maintain aesthetic if map fails to load */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-hover/30 to-base pointer-events-none" />
      
      {/* The World Map component filling the space */}
      <WorldMap events={events} onEventClick={onEventClick} />
    </div>
  );
};

export default MapPanel;
