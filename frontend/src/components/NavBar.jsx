import { Link, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, Globe, Menu } from 'lucide-react';
import { useState } from 'react';

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/', icon: <Activity className="w-5 h-5" /> },
    { name: 'Chat', path: '/chat', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Simulator', path: '/simulator', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-surface border-b border-hover px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center border border-accent-blue/30 group-hover:bg-accent-blue/20 transition-colors">
            <Globe className="w-5 h-5 text-accent-blue" />
          </div>
          <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
            GCIP Platform
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-muted hover:text-primary hover:bg-hover'
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 rounded-lg text-muted hover:bg-hover hover:text-primary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface border-b border-hover p-4 flex flex-col gap-2 shadow-2xl z-50">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent-blue/10 text-accent-blue font-medium'
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
