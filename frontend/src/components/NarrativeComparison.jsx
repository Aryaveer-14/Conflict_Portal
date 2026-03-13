import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const NarrativeComparison = () => {
  return (
    <div className="bg-base border border-hover rounded-2xl overflow-hidden flex flex-col shadow-inner">
      <div className="p-3 bg-surface border-b border-hover">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Media vs Reality Divergence</h3>
      </div>
      
      <div className="flex flex-col relative">
        <div className="flex w-full divide-x divide-hover">
          {/* Public Narrative */}
          <div className="flex-1 p-4 bg-hover/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-accent-orange" />
              <h4 className="text-sm font-semibold text-primary">Public Narrative</h4>
            </div>
            <p className="text-xs text-muted italic leading-relaxed">
              "Media reports claim global oil supply will collapse completely within the next two weeks."
            </p>
          </div>
          
          {/* Measured Reality */}
          <div className="flex-1 p-4 bg-accent-green/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              <h4 className="text-sm font-semibold text-primary">Measured Reality</h4>
            </div>
            <p className="text-xs text-primary leading-relaxed">
              "Current shipping data shows only minor disruptions. Supply reserves remain stable."
            </p>
          </div>
        </div>

        {/* Divergence Bar */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface border border-hover flex items-center justify-center shadow-lg z-10">
          <ArrowRight className="w-4 h-4 text-muted" />
        </div>
      </div>
    </div>
  );
};

export default NarrativeComparison;
