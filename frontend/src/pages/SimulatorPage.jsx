import ScenarioSimulator from '../components/ScenarioSimulator';

const SimulatorPage = () => {
  return (
    <div className="h-[calc(100vh-65px)] w-full overflow-y-auto bg-base p-6 md:p-8">
      <div className="max-w-7xl mx-auto w-full mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2">Crisis Simulator</h1>
        <p className="text-muted text-sm max-w-3xl leading-relaxed">
          Hypothesize future geopolitical events and measure their cascading effects across global systems. Model changes in trade flow, commodity pricing, and logistical stability.
        </p>
      </div>

      <ScenarioSimulator />
    </div>
  );
};

export default SimulatorPage;
