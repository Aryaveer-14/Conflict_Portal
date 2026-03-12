import { MapPin, Calendar } from 'lucide-react';

const ConflictCard = ({ conflict }) => {
  // Determine severity color
  const getSeverityColor = (severity) => {
    if (severity >= 5) return 'bg-accent-red shadow-[0_0_8px_rgba(233,69,96,0.6)]';
    if (severity >= 4) return 'bg-accent-orange shadow-[0_0_8px_rgba(244,162,97,0.6)]';
    return 'bg-accent-blue shadow-[0_0_8px_rgba(88,166,255,0.6)]';
  };

  return (
    <div className="bg-base border border-hover rounded-xl p-4 hover:border-accent-blue/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm text-primary group-hover:text-accent-blue transition-colors leading-tight pr-2">
          {conflict.title}
        </h3>
        <div className="flex-shrink-0 pt-1">
          <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(conflict.severity)}`} />
        </div>
      </div>
      
      <div className="flex flex-col gap-2 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{conflict.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{conflict.date}</span>
        </div>
      </div>
    </div>
  );
};

export default ConflictCard;
