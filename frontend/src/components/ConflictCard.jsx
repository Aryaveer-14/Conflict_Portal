const ConflictCard = ({ conflict, isSelected, onClick }) => {
  const getSeverityInfo = (severity) => {
    if (severity >= 5) return { color: '#FF4D4D', label: 'CRITICAL', bg: 'bg-accent-red/10', border: 'border-accent-red/20', text: 'text-accent-red' };
    if (severity >= 4) return { color: '#F4A261', label: 'HIGH', bg: 'bg-accent-orange/10', border: 'border-accent-orange/20', text: 'text-accent-orange' };
    if (severity >= 3) return { color: '#58A6FF', label: 'MONITORING', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20', text: 'text-accent-blue' };
    return { color: '#3FB950', label: 'LOW', bg: 'bg-accent-green/10', border: 'border-accent-green/20', text: 'text-accent-green' };
  };

  const info = getSeverityInfo(conflict.severity);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`px-3 py-2.5 border-b border-hover/30 cursor-pointer transition-all duration-200 group ${
        isSelected
          ? 'bg-accent-blue/10 border-l-2 border-l-accent-blue'
          : 'hover:bg-hover/30 border-l-2 border-l-transparent'
      }`}
    >
      {/* Title */}
      <h3 className="font-semibold text-[11px] text-primary group-hover:text-accent-blue transition-colors leading-tight mb-1 truncate">
        {conflict.title}
      </h3>

      {/* Location + Date row */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1.5">
        <span>{conflict.location}</span>
        <span className="text-hover">•</span>
        <span>{formatDate(conflict.date)}</span>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: info.color, boxShadow: `0 0 6px ${info.color}60` }}
        />
        <span className={`text-[9px] font-mono font-bold tracking-wider ${info.text}`}>
          {info.label}
        </span>
      </div>
    </div>
  );
};

export default ConflictCard;
