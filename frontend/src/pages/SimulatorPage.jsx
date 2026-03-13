import ScenarioSimulator from '../components/ScenarioSimulator';

const SimulatorPage = () => {
  return (
    <div className="h-[calc(100vh-48px)] w-full overflow-y-auto bg-base p-4 md:p-6">
      <div className="max-w-7xl mx-auto w-full mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-lg font-bold tracking-tight text-primary uppercase">Crisis Simulator</h1>
          <span className="text-[9px] font-mono font-bold tracking-widest bg-accent-orange/10 text-accent-orange border border-accent-orange/20 px-1.5 py-0.5 rounded">
            SCENARIO MODE
          </span>
        </div>
        <p className="text-muted text-[11px] font-mono max-w-3xl leading-relaxed tracking-wide">
          Hypothesize geopolitical events and model cascading effects across global systems.
        </p>
      </div>

      <ScenarioSimulator />
    </div>
  );
};

export default SimulatorPage;
