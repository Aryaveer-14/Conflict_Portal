import WorldMap from './WorldMap';

const MapPanel = ({ events, onEventClick }) => {
  return (
    <div className="flex-1 relative h-full w-full z-0 overflow-hidden">
      <WorldMap events={events} onEventClick={onEventClick} />
    </div>
  );
};

export default MapPanel;
