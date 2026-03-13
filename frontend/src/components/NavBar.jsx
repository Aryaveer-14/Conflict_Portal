import { Link, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, Globe, Shield, Menu, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const links = [
    { name: 'Dashboard', path: '/', icon: <Activity className="w-4 h-4" /> },
    { name: 'AI Analyst', path: '/chat', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Simulator', path: '/simulator', icon: <Globe className="w-4 h-4" /> },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <nav className="bg-surface/95 backdrop-blur-md border-b border-hover/60 px-4 py-0 sticky top-0 z-50">
      <div className="flex items-center justify-between h-12">
        
        {/* Left: Logo + Platform Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-accent-blue/10 flex items-center justify-center border border-accent-blue/30 group-hover:bg-accent-blue/20 transition-colors">
              <Shield className="w-4 h-4 text-accent-blue" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-[0.2em] uppercase text-primary leading-none">
                GCIP
              </span>
              <span className="text-[9px] tracking-wider text-muted leading-none mt-0.5 hidden sm:block">
                CONFLICT INTELLIGENCE
              </span>
            </div>
          </Link>

          <div className="hidden md:block w-px h-6 bg-hover mx-1" />
          
          <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="tracking-wide">GLOBAL MONITORING ACTIVE</span>
          </div>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                    : 'text-muted hover:text-primary hover:bg-hover/50 border border-transparent'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Status + Time */}
        <div className="flex items-center gap-3">
          {/* AI Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-base border border-hover">
            <Cpu className="w-3 h-3 text-accent-green" />
            <span className="text-[10px] font-mono font-medium text-accent-green tracking-wide">
              AI ONLINE
            </span>
          </div>
          
          {/* Clock */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-mono font-bold text-primary tracking-wider leading-none">
              {formatTime(currentTime)}
            </span>
            <span className="text-[9px] font-mono text-muted tracking-wider leading-none mt-0.5">
              {formatDate(currentTime)} UTC
            </span>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-1.5 rounded text-muted hover:bg-hover hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden border-t border-hover py-2 flex flex-col gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-all ${
                  isActive
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-muted hover:bg-hover hover:text-primary'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
