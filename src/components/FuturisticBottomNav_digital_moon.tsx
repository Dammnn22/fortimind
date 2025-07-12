import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  Settings,
  MessageCircle,
  Dumbbell,
  Apple
} from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

const FuturisticBottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/goals', icon: Target, label: 'Objetivos' },
    { to: '/exercise-challenge', icon: Dumbbell, label: 'Ejercicio' },
    { to: '/nutrition-challenge', icon: Apple, label: 'Nutrición' },
    { to: '/consultas/inicio', icon: MessageCircle, label: 'Consultas', isNew: true },
    { to: '/settings', icon: Settings, label: 'Config' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-35 lg:hidden ${className}`}>
      {/* Background con tema digital-moon optimizado para mobile */}
      <div className="mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-sky-500/20 shadow-2xl shadow-sky-500/10">
        <nav className="flex items-center justify-around px-1 sm:px-2 py-2 sm:py-3">
          {navItems.map((item) => {
            const isItemActive = isActive(item.to);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 min-w-[45px] sm:min-w-[50px] group
                          ${isItemActive 
                            ? 'text-sky-400 scale-105 sm:scale-110' 
                            : 'text-slate-400 hover:text-sky-300 hover:scale-105'
                          }`}
              >
                {/* Glow effect para elemento activo */}
                {isItemActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-violet-400/20 rounded-lg sm:rounded-xl blur-sm" />
                )}
                
                {/* Background hover */}
                <div className={`absolute inset-0 rounded-lg sm:rounded-xl transition-all duration-300 ${
                  isItemActive 
                    ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/20' 
                    : 'group-hover:bg-white/5'
                }`} />
                
                {/* Icono */}
                <div className="relative z-10 mb-0.5 sm:mb-1">
                  <Icon 
                    size={18} 
                    className={`sm:w-5 sm:h-5 transition-all duration-300 ${
                      isItemActive ? 'drop-shadow-lg' : 'group-hover:scale-110'
                    }`} 
                  />
                  {/* Badge "NUEVO" */}
                  {item.isNew && (
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs sm:text-xs font-medium transition-all duration-300 relative z-10 text-center leading-tight ${
                  isItemActive 
                    ? 'text-sky-300 font-semibold' 
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.label}
                </span>

                {/* Indicator bar */}
                {isItemActive && (
                  <div className="absolute -top-0.5 sm:-top-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 sm:h-1 bg-gradient-to-r from-sky-400 to-violet-400 rounded-full shadow-lg shadow-sky-400/50" />
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
