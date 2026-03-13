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
    
    // Simulating API call since backend is not ready
    setTimeout(() => {
      // Mock data adjusted vaguely by severity for visualization purposes
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
    <div className="flex flex-col lg:flex-row h-full w-full gap-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 🔴 Left Panel: Control Panel (~40%) */}
      <div className="w-full lg:w-[40%] bg-surface border border-hover rounded-2xl p-6 shadow-xl flex flex-col h-fit">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-hover">
          <div className="p-2 bg-accent-red/10 rounded-xl border border-accent-red/20 shadow-inner">
            <AlertTriangle className="w-6 h-6 text-accent-red" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary">Run a Simulation</h2>
        </div>

        <div className="space-y-6">
          {/* Crisis Type Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary tracking-wide">Crisis Type</label>
            <div className="relative">
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full bg-base border border-hover text-primary rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all font-medium text-sm"
              >
                {CRISIS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                ▼
              </div>
            </div>
          </div>

          {/* Severity Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-primary tracking-wide">Severity Level</label>
              <span className="text-lg font-black text-accent-red tracking-tighter shadow-sm">{severity}<span className="text-muted text-sm font-medium">/5</span></span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full h-2 bg-base rounded-lg appearance-none cursor-pointer accent-accent-red outline-none border border-hover"
            />
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted">
              <span>Minimal</span>
              <span>Catastrophic</span>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full !mt-8 py-3.5 px-4 bg-accent-red hover:bg-[#ff5577] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(233,69,96,0.2)] hover:shadow-[0_0_25px_rgba(233,69,96,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Initializing Models...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔵 Right Panel: Simulation Results (~60%) */}
      <div className="flex-1 bg-surface border border-hover rounded-2xl p-6 shadow-xl flex flex-col min-h-[400px]">
        <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
          Simulation Results Timeline
          {results && <span className="text-xs font-semibold tracking-wider uppercase bg-accent-green/10 text-accent-green border border-accent-green/20 px-2 py-0.5 rounded-full ml-auto">Data Generated</span>}
        </h3>
        
        <div className="flex-1 w-full bg-base border border-hover rounded-xl p-4 flex items-center justify-center shadow-inner relative">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center text-muted gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent-red" />
              <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Running Monte Carlo simulation...</p>
            </div>
          ) : results ? (
            <div className="w-full h-full min-h-[300px] animate-in slide-in-from-right-8 duration-500">
               <SimulationChart data={results} />
            </div>
          ) : (
            <div className="text-center text-muted max-w-sm">
              <div className="w-16 h-16 bg-hover/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-hover">
                <AlertTriangle className="w-8 h-8 text-muted/50" />
              </div>
              <p className="text-sm leading-relaxed">Configure parameters and run the simulation to generate predictive impact analytics.</p>
            </div>
          )}
          
        </div>
      </div>
      
    </div>
  );
};

export default ScenarioSimulator;
