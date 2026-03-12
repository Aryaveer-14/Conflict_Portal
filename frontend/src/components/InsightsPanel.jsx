import { FileText, TrendingUp, Radio } from 'lucide-react';
import CommodityChart from './CommodityChart';

const InsightsPanel = () => {
  return (
    <aside className="w-[260px] min-w-[260px] bg-surface flex flex-col h-full border-l border-hover z-10 shadow-xl overflow-y-auto">
      
      {/* Section 1: Top Narratives */}
      <div className="p-4 border-b border-hover">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-accent-blue" />
          <h2 className="font-bold text-primary text-sm tracking-wide uppercase">Top Narratives</h2>
        </div>
        
        <div className="space-y-3">
          {/* Placeholder Narrative Card */}
          <div className="bg-base p-3.5 rounded-xl border border-hover hover:border-accent-blue/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-3 h-3 text-accent-red animate-pulse" />
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Intercepted</span>
            </div>
            <p className="text-xs text-primary mb-3 leading-relaxed">
              Energy supply lines face disruption risks near eastern border regions.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted uppercase font-medium">Confidence: High</span>
            </div>
          </div>

          <div className="bg-base p-3.5 rounded-xl border border-hover hover:border-accent-blue/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-3 h-3 text-accent-orange" />
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Analysis</span>
            </div>
            <p className="text-xs text-primary mb-3 leading-relaxed">
              Diplomatic negotiations stalled; increased localized mobilization detected.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted uppercase font-medium">Confidence: Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Commodity Trends */}
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-accent-green" />
          <h2 className="font-bold text-primary text-sm tracking-wide uppercase">Commodity Trends</h2>
        </div>
        
        {/* Commodity Trends Chart Rendered Here */}
        <div className="bg-base rounded-xl border border-hover p-4 shadow-inner">
          <CommodityChart />
        </div>
      </div>

    </aside>
  );
};

export default InsightsPanel;
