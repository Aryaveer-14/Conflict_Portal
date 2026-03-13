import ConflictCard from './ConflictCard';
import { AlertTriangle, Radio } from 'lucide-react';

const Sidebar = ({ conflicts, onConflictClick, selectedId }) => {
  const activeCount = conflicts.filter(c => c.severity >= 4).length;

  return (
    <aside className="w-[240px] min-w-[240px] bg-surface/80 backdrop-blur-sm flex flex-col h-full border-r border-hover/40 z-10">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-hover/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-accent-red animate-pulse" />
          <h2 className="font-bold tracking-[0.15em] text-primary uppercase text-[10px]">
            Active Conflicts
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold bg-accent-red/15 text-accent-red px-1.5 py-0.5 rounded border border-accent-red/20">
          {conflicts.length} LIVE
        </span>
      </div>

      {/* Risk Summary Bar */}
      <div className="px-3 py-2 border-b border-hover/40 bg-base/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">Threat Level</span>
          <span className="text-[9px] font-mono font-bold text-accent-red tracking-wider">{activeCount} CRITICAL</span>
        </div>
        <div className="flex gap-0.5 h-1">
          {conflicts.map((c, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                backgroundColor: c.severity >= 5 ? '#FF4D4D' :
                                 c.severity >= 4 ? '#F4A261' :
                                 c.severity >= 3 ? '#58A6FF' : '#3FB950',
                opacity: 0.8
              }}
            />
          ))}
        </div>
      </div>

      {/* Conflict List */}
      <div className="flex-1 overflow-y-auto">
        {conflicts.map(conflict => (
          <ConflictCard
            key={conflict.id}
            conflict={conflict}
            isSelected={selectedId === conflict.id}
            onClick={() => onConflictClick && onConflictClick(conflict)}
          />
        ))}
      </div>

      {/* Footer status */}
      <div className="px-3 py-2 border-t border-hover/40 bg-base/40">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[9px] font-mono text-muted tracking-wider">FEED LIVE • AUTO-REFRESH</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
