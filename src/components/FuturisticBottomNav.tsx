import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  Activity, 
  Settings,
  Star,
  MessageCircle
} from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

const FuturisticBottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/goals', icon: Target, label: 'Objetivos' },
    { to: '/challenges', icon: Activity, label: 'Retos' },
    { to: '/consultas/inicio', icon: MessageCircle, label: 'Consultas', isNew: true },
    { to: '/subscription', icon: Star, label: 'Premium' },
    { to: '/settings', icon: Settings, label: 'Config' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      {/* Glassmorphism background */}
      <div className="glassmorphism border-t border-gray-800 mx-4 mb-4 rounded-2xl">
        <nav className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isItemActive = isActive(item.to);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[50px] group
                          ${isItemActive 
                            ? 'text-cyan-400 glow-cyan' 
                            : 'text-gray-400 hover:text-white hover:glow-blue'
                          }`}
              >
                {/* Icon container with glow effect */}
                <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                  isItemActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 scale-110' 
                    : 'group-hover:bg-gradient-to-r group-hover:from-blue-500/10 group-hover:to-cyan-500/10 group-hover:scale-105'
                }`}>
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 ${
                      isItemActive ? 'animate-pulse' : 'group-hover:animate-pulse'
                    }`} 
                  />
                  
                  {/* New badge */}
                  {item.isNew && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-magenta-400 rounded-full animate-pulse glow-magenta"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-futuristic mt-1 transition-all duration-300 ${
                  isItemActive 
                    ? 'text-cyan-400 font-bold' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isItemActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full glow-cyan animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default FuturisticBottomNav;
