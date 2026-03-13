import { X, BrainCircuit, Sparkles, Shield } from 'lucide-react';
import ImpactRadar from './ImpactRadar';
import NarrativeComparison from './NarrativeComparison';

const EventDeepDive = ({ event, onClose }) => {
  if (!event) return null;

  const getSeverityInfo = (severity) => {
    if (severity >= 5) return { color: '#FF4D4D', label: 'CRITICAL', bg: 'bg-accent-red/10' };
    if (severity >= 4) return { color: '#F4A261', label: 'HIGH RISK', bg: 'bg-accent-orange/10' };
    if (severity >= 3) return { color: '#58A6FF', label: 'ELEVATED', bg: 'bg-accent-blue/10' };
    return { color: '#3FB950', label: 'LOW', bg: 'bg-accent-green/10' };
  };

  const info = getSeverityInfo(event.severity);

  return (
    <div className="fixed right-0 top-[48px] h-[calc(100vh-48px)] w-[380px] bg-surface/95 backdrop-blur-md border-l border-hover/40 overflow-y-auto z-50 shadow-[-10px_0_40px_-15px_rgba(0,0,0,0.6)]">
      
      {/* Header */}
      <div className="sticky top-0 bg-surface/95 backdrop-blur-md z-10 border-b border-hover/40 px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: info.color, boxShadow: `0 0 8px ${info.color}60` }}
              />
              <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: info.color }}>
                {info.label}
              </span>
            </div>
            <h2 className="text-sm font-bold text-primary tracking-tight leading-tight mb-1">
              {event.title}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono">
              <span>{event.location}</span>
              <span className="text-hover">•</span>
              <span>{event.date || 'Live'}</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 bg-base hover:bg-hover rounded text-muted hover:text-primary transition-colors border border-hover/40"
            aria-label="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Severity Meter */}
        <div className="bg-base/60 border border-hover/40 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">Threat Assessment</span>
            <span className="text-lg font-mono font-black text-primary">
              {event.severity}<span className="text-muted text-xs font-medium">/5</span>
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-sm transition-all"
                style={{
                  backgroundColor: i < event.severity ? info.color : '#21262D',
                  boxShadow: i < event.severity ? `0 0 6px ${info.color}40` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Impact Radar */}
        <div className="bg-base/60 border border-hover/40 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">System Impact</span>
          </div>
          <ImpactRadar />
        </div>

        {/* Narrative Divergence */}
        <NarrativeComparison />

        {/* AI Analysis Card */}
        <div className="bg-base/60 border border-accent-blue/20 rounded p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 blur-[30px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <BrainCircuit className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-[9px] font-mono font-bold text-accent-blue uppercase tracking-widest">AI Analysis</span>
          </div>
          
          <p className="text-[11px] text-primary/80 leading-relaxed mb-3 relative z-10">
            "This conflict is likely to increase oil price volatility in the short term. Current reserves buffer provides 45-day window before supply chain stress manifests downstream."
          </p>
          
          <button className="w-full py-2 px-3 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/20 rounded text-[10px] font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 relative z-10">
            <Sparkles className="w-3 h-3" />
            REQUEST DETAILED BRIEF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDeepDive;
