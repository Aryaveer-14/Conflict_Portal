import { FileText, TrendingUp, Shield, AlertTriangle, Cpu } from 'lucide-react';
import CommodityChart from './CommodityChart';

const riskData = [
  { label: 'GLOBAL RISK', score: 78, color: '#FF4D4D' },
  { label: 'ENERGY', score: 64, color: '#F4A261' },
  { label: 'TRADE', score: 52, color: '#58A6FF' },
  { label: 'FOOD SEC.', score: 41, color: '#3FB950' },
];

const narratives = [
  {
    id: 1,
    label: 'Energy Supply Disruption',
    description: 'Eastern border regions face pipeline vulnerability. Supply route diversions underway.',
    confidence: 'HIGH',
    timestamp: '14 min ago',
  },
  {
    id: 2,
    label: 'Maritime Route Diversion',
    description: 'Shipping rerouted via Cape of Good Hope. Transit cost up 40%.',
    confidence: 'HIGH',
    timestamp: '28 min ago',
  },
  {
    id: 3,
    label: 'Diplomatic Stalemate',
    description: 'Negotiations stalled. Increased troop mobilization detected in conflict perimeter.',
    confidence: 'MEDIUM',
    timestamp: '1h ago',
  },
  {
    id: 4,
    label: 'Commodity Price Surge',
    description: 'Brent crude sees 12% rally driven by supply concerns and speculative positioning.',
    confidence: 'MEDIUM',
    timestamp: '2h ago',
  },
];

const RiskBar = ({ label, score, color }) => {
  const filled = Math.round(score / 10);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono font-bold text-muted tracking-wider w-16 shrink-0">{label}</span>
      <div className="flex gap-[2px] flex-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[6px] flex-1 rounded-[1px] transition-all duration-500"
            style={{
              backgroundColor: i < filled ? color : '#21262D',
              opacity: i < filled ? 0.85 : 0.4,
              boxShadow: i < filled ? `0 0 4px ${color}30` : 'none',
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono font-bold w-6 text-right" style={{ color }}>{score}</span>
    </div>
  );
};

const ConfidenceBadge = ({ level }) => {
  const styles = {
    HIGH: 'text-accent-green border-accent-green/20 bg-accent-green/10',
    MEDIUM: 'text-accent-orange border-accent-orange/20 bg-accent-orange/10',
    LOW: 'text-accent-red border-accent-red/20 bg-accent-red/10',
  };
  return (
    <span className={`text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border ${styles[level] || styles.MEDIUM}`}>
      {level}
    </span>
  );
};

const InsightsPanel = () => {
  return (
    <aside className="w-[280px] min-w-[280px] bg-surface/80 backdrop-blur-sm flex flex-col h-full border-l border-hover/40 z-10 overflow-hidden">

      {/* Section 1: Global Risk Index */}
      <div className="px-3 py-2.5 border-b border-hover/40">
        <div className="flex items-center gap-2 mb-2.5">
          <Shield className="w-3.5 h-3.5 text-accent-red" />
          <h2 className="font-bold text-[10px] tracking-[0.15em] text-primary uppercase">
            Risk Index
          </h2>
          <span className="ml-auto text-[9px] font-mono text-muted">LIVE</span>
        </div>
        <div className="space-y-1.5">
          {riskData.map((item) => (
            <RiskBar key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* Section 2: Intelligence Feed */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-hover/40">
        <div className="px-3 py-2.5 border-b border-hover/40 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-accent-blue" />
          <h2 className="font-bold text-[10px] tracking-[0.15em] text-primary uppercase">
            Intel Feed
          </h2>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[8px] font-mono text-accent-green tracking-wider">LIVE</span>
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {narratives.map((item, idx) => (
            <div
              key={item.id}
              className="px-3 py-2.5 border-b border-hover/20 hover:bg-hover/20 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-[11px] font-semibold text-primary leading-tight group-hover:text-accent-blue transition-colors">
                  {item.label}
                </h3>
                <ConfidenceBadge level={item.confidence} />
              </div>
              <p className="text-[10px] text-muted leading-relaxed mb-1.5">
                {item.description}
              </p>
              <span className="text-[9px] font-mono text-muted/60">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Commodity Trends */}
      <div className="px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
          <h2 className="font-bold text-[10px] tracking-[0.15em] text-primary uppercase">
            Markets
          </h2>
        </div>
        <CommodityChart />
      </div>

    </aside>
  );
};

export default InsightsPanel;
