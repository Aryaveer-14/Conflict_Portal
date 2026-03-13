import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const NarrativeComparison = () => {
  return (
    <div className="bg-base/60 border border-hover/40 rounded overflow-hidden">
      <div className="px-3 py-2 bg-hover/20 border-b border-hover/40">
        <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-widest">
          Narrative Divergence
        </span>
      </div>
      
      <div className="flex relative">
        {/* Public Narrative */}
        <div className="flex-1 p-3 border-r border-hover/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="w-3 h-3 text-accent-orange" />
            <span className="text-[9px] font-mono font-bold text-accent-orange tracking-wider">PUBLIC</span>
          </div>
          <p className="text-[10px] text-muted leading-relaxed italic">
            "Global oil supply faces imminent collapse within weeks."
          </p>
        </div>
        
        {/* Measured Reality */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-3 h-3 text-accent-blue" />
            <span className="text-[9px] font-mono font-bold text-accent-blue tracking-wider">ASSESSED</span>
          </div>
          <p className="text-[10px] text-primary/80 leading-relaxed">
            "Minor disruptions. Strategic reserves stable. 45-day buffer intact."
          </p>
        </div>

        {/* Divider icon */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface border border-hover flex items-center justify-center z-10">
          <ArrowRight className="w-3 h-3 text-muted" />
        </div>
      </div>
    </div>
  );
};

export default NarrativeComparison;
