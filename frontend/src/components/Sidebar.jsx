import ConflictCard from './ConflictCard';

const Sidebar = ({ conflicts }) => {
  return (
    <aside className="w-[280px] min-w-[280px] bg-surface flex flex-col h-full border-r border-hover z-10 shadow-xl">
      <div className="p-4 border-b border-hover flex items-center justify-between">
        <h2 className="font-bold tracking-tight text-primary uppercase text-sm">Active Conflicts</h2>
        <span className="text-xs bg-accent-red/10 text-accent-red px-2 py-0.5 rounded-full font-medium border border-accent-red/20">
          {conflicts.length} Live
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
        {conflicts.map(conflict => (
          <ConflictCard key={conflict.id} conflict={conflict} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
