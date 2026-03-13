import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Activity, ShieldAlert, Zap, ArrowRight, Database, ChevronRight, Terminal } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const fullText = "INITIALIZING GLOBAL CONFLICT IMPACT INTELLIGENCE PLATFORM...";


  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);


    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const newsTicker = [
    "BREAKING: UKRAINE CONFLICT ESCALATION IMPACTS EUROPEAN ENERGY MARKETS",
    "URGENT: RED SEA SHIPPING TENSIONS DISRUPT GLOBAL SUPPLY CHAINS",
    "ALERT: SUDAN CIVIL UNREST TRIGGERS LOGISTICAL BOTTLENECKS",
    "UPDATE: TAIWAN STRAIT INCURSIONS CAUSE CHIP MANUFACTURING CONCERNS",
    "LIVE: EASTERN DRC CLASHES AFFECT RARE EARTH MINERAL EXPORTS"
  ];

  return (
    <div className="min-h-screen bg-base text-primary overflow-hidden relative selection:bg-accent-green/30 selection:text-accent-green flex flex-col">
      {/* Interactive Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Glow following cursor */}
        <div 
          className="absolute inset-0 transition-opacity duration-300 ease-linear"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 255, 65, 0.08), transparent 60%)`
          }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff410a_1px,transparent_1px),linear-gradient(to_bottom,#00ff410a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Top News Ticker */}
      <div className="relative z-20 bg-accent-green/10 text-accent-green py-1 flex items-center overflow-hidden font-orbitron text-xs md:text-sm font-semibold tracking-widest border-b border-accent-green/30 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
        <div className="px-4 bg-base border-r border-accent-green/30 z-30 flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]"></span>
          LIVE INTEL
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center h-full whitespace-nowrap">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            className="flex gap-12 pl-4"
          >
            {[...newsTicker, ...newsTicker, ...newsTicker].map((news, i) => (
              <span key={i} className="flex-shrink-0 text-primary">
                {news} <span className="mx-6 text-accent-green/50">///</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-12 pb-24 flex-1 flex flex-col justify-center">
        
        {/* Top Header / News Ticker Vibe */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-12 border-b border-accent-green/20 pb-4 w-fit pr-10"
        >
          <div className="p-2 border border-accent-green/30 bg-accent-green/10 animate-pulse">
            <Activity className="w-5 h-5 text-accent-green" />
          </div>
          <p className="font-orbitron tracking-widest text-accent-green/80 text-sm md:text-base">
            <span className="text-accent-green font-bold">GCIP</span> // SYS_ACTIVE //
            <span className="ml-4 font-mono text-muted">{new Date().toISOString().split('T')[0]}</span>
          </p>
        </motion.div>

        {/* Hero Section */}
        <div className="max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-4 font-mono text-sm text-primary font-semibold tracking-wider bg-surface border border-accent-green/20 w-fit px-3 py-1.5 rounded-sm shadow-[0_0_10px_rgba(0,255,65,0.05)]"
          >
            <Terminal className="w-4 h-4 text-accent-green" />
            <span>{typedText}</span>
            <span className="w-2 h-4 bg-accent-green animate-pulse"></span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="font-rajdhani text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[1.1] tracking-tight mb-8 drop-shadow-lg"
          >
            <span className="text-primary">Anticipate</span> <br/>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-primary to-accent-green pr-2 drop-shadow-[0_0_15px_rgba(0,255,65,0.3)]">Global Impact.</span><br/>
            <span className="text-primary">Secure the Future.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed mb-10 border-l-2 border-accent-green pl-6 py-2 bg-gradient-to-r from-accent-green/5 to-transparent backdrop-blur-sm"
          >
            The <strong className="text-white">Global Conflict Impact Intelligence Platform (GCIP)</strong> translates raw worldwide geopolitical volatility into predictable, actionable intelligence. Operating at the forefront of defense and economics, we decode supply chain disruption and international risk in real-time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 mt-4"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 font-orbitron font-bold tracking-widest text-base transition-all duration-300 bg-accent-green text-black hover:bg-accent-green/90 border border-accent-green hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0 w-full h-full -right-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer"></div>
              <span className="relative z-10">ENTER SECURE PORTAL</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-orbitron font-semibold tracking-widest text-primary hover:text-accent-green transition-colors border border-surface hover:border-accent-green/50 bg-surface backdrop-blur-sm rounded-sm"
            >
              SYSTEM CAPABILITIES
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div 
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 relative z-10"
        >
          {/* Card 1 */}
          <div className="bg-surface/60 backdrop-blur-md border border-hover hover:border-accent-green/50 p-8 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,255,65,0.15)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-3xl group-hover:bg-accent-green/20 transition-all"></div>
            <div className="w-12 h-12 bg-surface border border-accent-green/30 flex items-center justify-center mb-6 group-hover:border-accent-green transition-colors relative z-10">
              <ShieldAlert className="w-6 h-6 text-primary group-hover:text-accent-green transition-colors" />
            </div>
            <h3 className="font-rajdhani text-2xl font-bold mb-3 uppercase tracking-wide text-primary">Live Conflict Tracking</h3>
            <p className="text-muted text-sm leading-relaxed relative z-10">
              Consolidating real-time updates from multiple OSINT, diplomatic, and news streams to pinpoint hostilities, border clashes, and emerging geopolitical tension globally.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-surface/60 backdrop-blur-md border border-hover hover:border-accent-green/50 p-8 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,255,65,0.15)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-3xl group-hover:bg-accent-green/20 transition-all"></div>
            <div className="w-12 h-12 bg-surface border border-accent-green/30 flex items-center justify-center mb-6 group-hover:border-accent-green transition-colors relative z-10">
              <Database className="w-6 h-6 text-primary group-hover:text-accent-green transition-colors" />
            </div>
            <h3 className="font-rajdhani text-2xl font-bold mb-3 uppercase tracking-wide text-primary">Resource Impact</h3>
            <p className="text-muted text-sm leading-relaxed relative z-10">
              Mapping friction points to global supply chains. Understand the downstream effects on crude oil, rare earth metals, wheat, and global maritime shipping routes instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-surface/60 backdrop-blur-md border border-hover hover:border-accent-green/50 p-8 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,255,65,0.15)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-3xl group-hover:bg-accent-green/20 transition-all"></div>
            <div className="w-12 h-12 bg-surface border border-accent-green/30 flex items-center justify-center mb-6 group-hover:border-accent-green transition-colors relative z-10">
              <Zap className="w-6 h-6 text-primary group-hover:text-accent-green transition-colors" />
            </div>
            <h3 className="font-rajdhani text-2xl font-bold mb-3 uppercase tracking-wide text-primary">AI-Powered Simulations</h3>
            <p className="text-muted text-sm leading-relaxed relative z-10">
              Interact with our Gemini-driven agent to run scenario forecasts. "What if the Red Sea is completely blocked?" Get multi-step reasoning and probability scores for global stability.
            </p>
          </div>
        </motion.div>
        
        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-20 border-t border-hover pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted/60 font-mono"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Globe className="w-4 h-4 text-accent-green/50" />
            <span>GLOBAL COVERAGE: <span className="text-accent-green">ACTIVE</span></span>
          </div>
          <div className="flex gap-6">
            <span>DATA ENCRYPTION: SECURT</span>
            <span>AI CORE: GOOGLE GEMINI</span>
            <span>VER: 3.0.0</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default LandingPage;