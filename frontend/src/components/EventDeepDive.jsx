import { X, Star, Sparkles, BrainCircuit } from 'lucide-react';
import ImpactRadar from './ImpactRadar';
import NarrativeComparison from './NarrativeComparison';

const EventDeepDive = ({ event, onClose }) => {
  if (!event) return null; // Avoid rendering if no event selected

  // Render Severity Stars
  const renderStars = (severity) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 transition-all duration-300 ${
          i < severity 
            ? 'fill-accent-red text-accent-red drop-shadow-[0_0_8px_rgba(233,69,96,0.6)]' 
            : 'text-hover stroke-[1.5]'
        }`} 
      />
    ));
  };

  return (
    <div className={`fixed right-0 top-[65px] h-[calc(100vh-65px)] w-[420px] bg-surface border-l border-hover overflow-y-auto z-50 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out transform translate-x-0`}>
      
      {/* 🔴 Header Section */}
      <div className="sticky top-0 bg-surface/90 backdrop-blur-md z-10 border-b border-hover p-6 flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-extrabold text-primary tracking-tight leading-tight mb-2">
            {event.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted font-medium">
            <span>{event.location}</span>
            <span className="w-1 h-1 rounded-full bg-hover" />
            <span>{event.date || 'Live Analysis'}</span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 bg-base hover:bg-hover rounded-full text-muted hover:text-primary transition-colors border border-hover shadow-sm"
          aria-label="Close Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in fade-in-0">
        
        {/* ⭐ Severity Indicator */}
        <div className="bg-base border border-hover rounded-2xl p-5 shadow-inner">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Threat Severity</h3>
          <div className="flex items-center gap-1.5">
            {renderStars(event.severity)}
            <span className="ml-3 text-2xl font-black text-primary tracking-tighter shadow-sm">{event.severity}<span className="text-muted text-base font-medium">/ 5</span></span>
          </div>
        </div>

        {/* 🎯 Impact Radar Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <h3 className="text-sm font-bold text-primary tracking-widest uppercase">System Impact</h3>
          </div>
          <div className="bg-base border border-hover rounded-2xl p-4 shadow-inner">
            <ImpactRadar />
          </div>
        </div>

        {/* ⚖️ Narrative Comparison */}
        <div>
           <NarrativeComparison />
        </div>

        {/* 🤖 AI Summary Card */}
        <div className="bg-gradient-to-br from-[#1A1F2B] to-base border border-accent-green/20 rounded-2xl p-5 relative overflow-hidden group shadow-[0_4px_20px_-5px_rgba(0,255,65,0.1)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 blur-[40px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <BrainCircuit className="w-5 h-5 text-accent-green" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest">AI Analysis</h3>
          </div>
          
          <p className="text-sm text-primary/90 leading-relaxed mb-5 relative z-10">
            "This conflict is likely to increase oil price volatility in the short term but does not yet threaten global supply chains."
          </p>
          
          <button className="w-full py-2.5 px-4 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 shadow-inner group-hover:border-accent-green/50">
            <Sparkles className="w-4 h-4" />
            Explain This Simply
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventDeepDive;
