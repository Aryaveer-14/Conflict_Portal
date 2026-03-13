import { useState } from 'react';
import { AlertTriangle, Play, Loader2 } from 'lucide-react';
import SimulationChart from './SimulationChart';

const CRISIS_OPTIONS = [
  { value: 'oil_embargo', label: 'Oil Embargo' },
  { value: 'strait_blockade', label: 'Strait Blockade' },
  { value: 'trade_war', label: 'Trade War' },
  { value: 'cyber_attack', label: 'Cyber Attack' }
];

const MOCK_RESULTS = {
  oil_embargo: [
    { day: 1, oil_change_pct: 5, shipping_disruption_pct: 2 },
    { day: 7, oil_change_pct: 12, shipping_disruption_pct: 4 },
    { day: 30, oil_change_pct: 25, shipping_disruption_pct: 5 },
    { day: 90, oil_change_pct: 35, shipping_disruption_pct: 8 }
  ],
  strait_blockade: [
    { day: 1, oil_change_pct: 2, shipping_disruption_pct: 3 },
    { day: 7, oil_change_pct: 5, shipping_disruption_pct: 7 },
    { day: 30, oil_change_pct: 12, shipping_disruption_pct: 15 },
    { day: 90, oil_change_pct: 18, shipping_disruption_pct: 20 }
  ],
  trade_war: [
    { day: 1, oil_change_pct: 0, shipping_disruption_pct: 1 },
    { day: 7, oil_change_pct: 2, shipping_disruption_pct: 5 },
    { day: 30, oil_change_pct: -5, shipping_disruption_pct: 12 },
    { day: 90, oil_change_pct: -8, shipping_disruption_pct: 18 }
  ],
  cyber_attack: [
    { day: 1, oil_change_pct: 1, shipping_disruption_pct: 10 },
    { day: 7, oil_change_pct: 3, shipping_disruption_pct: 25 },
    { day: 30, oil_change_pct: 8, shipping_disruption_pct: 15 },
    { day: 90, oil_change_pct: 4, shipping_disruption_pct: 5 }
  ]
};

const ScenarioSimulator = () => {
  const [scenarioType, setScenarioType] = useState('strait_blockade');
  const [severity, setSeverity] = useState(3);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    setResults(null);
    
    setTimeout(() => {
      const baseData = MOCK_RESULTS[scenarioType] || MOCK_RESULTS['strait_blockade'];
      const scaledData = baseData.map(item => ({
        day: item.day,
        oil_change_pct: Math.round(item.oil_change_pct * (severity / 3)),
        shipping_disruption_pct: Math.round(item.shipping_disruption_pct * (severity / 3))
      }));
      setResults(scaledData);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 max-w-7xl mx-auto">
      
      {/* Control Panel */}
      <div className="w-full lg:w-[38%] bg-surface/80 backdrop-blur-sm border border-hover/40 rounded p-5 flex flex-col h-fit">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-hover/40">
          <div className="p-1.5 bg-accent-red/10 rounded border border-accent-red/20">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-primary">Run Simulation</h2>
            <span className="text-[9px] font-mono text-muted tracking-wider">MONTE CARLO ENGINE</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Crisis Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Crisis Type</label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              className="w-full bg-base border border-hover text-primary rounded px-3 py-2.5 appearance-none focus:outline-none focus:border-accent-blue/40 transition-all font-mono text-xs"
            >
              {CRISIS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Severity</label>
              <span className="text-sm font-mono font-black text-accent-red">
                {severity}<span className="text-muted text-xs font-medium">/5</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-base rounded appearance-none cursor-pointer accent-accent-red outline-none border border-hover"
            />
            <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-muted">
              <span>Minimal</span>
              <span>Catastrophic</span>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-accent-red hover:bg-accent-red/90 text-white rounded font-mono font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,77,77,0.15)] hover:shadow-[0_0_20px_rgba(255,77,77,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                INITIALIZING...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                EXECUTE SIMULATION
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="flex-1 bg-surface/80 backdrop-blur-sm border border-hover/40 rounded p-5 flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono font-bold text-primary tracking-wider uppercase">
            Simulation Output
          </h3>
          {results && (
            <span className="text-[9px] font-mono font-bold tracking-widest bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-1.5 py-0.5 rounded">
              DATA READY
            </span>
          )}
        </div>
        
        <div className="flex-1 w-full bg-base/60 border border-hover/40 rounded p-4 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-muted gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-accent-red" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest animate-pulse">
                Running Monte Carlo simulation...
              </p>
            </div>
          ) : results ? (
            <div className="w-full h-full min-h-[300px]">
               <SimulationChart data={results} />
            </div>
          ) : (
            <div className="text-center text-muted max-w-sm">
              <div className="w-12 h-12 bg-hover/30 rounded flex items-center justify-center mx-auto mb-3 border border-hover">
                <AlertTriangle className="w-6 h-6 text-muted/40" />
              </div>
              <p className="text-[11px] font-mono leading-relaxed tracking-wide">
                Configure parameters and execute to generate predictive analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
