import React, { cloneElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  MessageSquareHeart, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  X, 
  MessageCircle,
  Star,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isGuestModeActive: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  isGuestModeActive,
  onLogout,
}) => {
  const location = useLocation();
  
  const navLinks = [
    { to: "/", icon: <Home size={20} />, label: "Inicio" },
    { 
      to: "/consultas", 
      icon: <MessageCircle size={20} />, 
      label: "Consultas 1:1",
      isNew: true,
      description: "Sesiones con profesionales"
    },
    { to: "/goals", icon: <Target size={20} />, label: "Objetivos" },
    { to: "/habits", icon: <TrendingUp size={20} />, label: "Hábitos" },
    { to: "/challenges", icon: <BarChart3 size={20} />, label: "Desafíos" },
    { to: "/learn", icon: <BookOpen size={20} />, label: "Aprender" },
    { to: "/support", icon: <MessageSquareHeart size={20} />, label: "Soporte" },
    { to: "/settings", icon: <Settings size={20} />, label: "Configuración" },
    // --- NUEVOS ACCESOS ---
    { to: "/admin-dashboard", icon: <BarChart3 size={20} />, label: "Admin Dashboard" },
    { to: "/nutrition-challenge", icon: <Star size={20} />, label: "Reto Nutrición" },
    { to: "/exercise-challenge", icon: <TrendingUp size={20} />, label: "Reto de Ejercicios" },
    { to: "/subscription", icon: <CreditCard size={20} />, label: "Premium" },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 transform transition-all duration-500 ease-out z-50 md:relative md:translate-x-0 
                    bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-r border-gray-200/20 dark:border-[#00FFFF]/10 
                    shadow-2xl dark:shadow-[0_0_50px_rgba(0,255,255,0.1)]
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/10 dark:border-[#00FFFF]/20 bg-gradient-to-r from-transparent to-white/5 dark:to-[#00FFFF]/5">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-600 dark:from-[#00FFFF] dark:to-white bg-clip-text text-transparent tracking-wide">
            FORTIMIND
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-3 rounded-xl bg-white/10 dark:bg-[#00FFFF]/10 hover:bg-white/20 dark:hover:bg-[#00FFFF]/20 transition-all duration-300 border border-gray-200/20 dark:border-[#00FFFF]/30"
          >
            <X size={20} className="text-gray-800 dark:text-[#00FFFF]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`group flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden
                          ${location.pathname === link.to 
                            ? 'bg-gradient-to-r from-[#00FFFF]/20 to-[#00FFFF]/10 text-black dark:text-[#00FFFF] shadow-lg dark:shadow-[0_0_20px_rgba(0,255,255,0.3)] border border-[#00FFFF]/30' 
                            : link.isNew 
                              ? 'bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-[#FF0055]/10 dark:to-[#00FFFF]/10 hover:from-purple-100/90 hover:to-blue-100/90 dark:hover:from-[#FF0055]/20 dark:hover:to-[#00FFFF]/20 border border-purple-200/50 dark:border-[#FF0055]/30 text-purple-700 dark:text-[#FF0055] backdrop-blur-sm'
                              : 'hover:bg-white/60 dark:hover:bg-white/5 hover:backdrop-blur-md text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-transparent hover:border-gray-200/30 dark:hover:border-white/20'
                          }`}
            >
              <div className="flex items-center space-x-4 flex-1 relative z-10">
                <div className={`p-2 rounded-xl ${location.pathname === link.to ? 'bg-[#00FFFF]/20' : 'bg-white/20 dark:bg-white/10'} group-hover:scale-110 transition-transform duration-300`}>
                  {cloneElement(link.icon, { 
                    size: 20, 
                    className: location.pathname === link.to 
                      ? 'text-[#00FFFF] dark:text-[#00FFFF]' 
                      : 'text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white'
                  })}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm tracking-wide">{link.label}</span>
                  {link.description && (
                    <div className="text-xs opacity-75 mt-1 font-medium">{link.description}</div>
                  )}
                </div>
              </div>
              
              {/* Badge "NUEVO" para consultas */}
              {link.isNew && location.pathname !== link.to && (
                <div className="flex items-center space-x-2 relative z-10">
                  <Star size={14} className="text-[#FF0055] animate-pulse" />
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-[#FF0055] to-[#FF4A00] px-3 py-1 rounded-full shadow-lg">
                    NUEVO
                  </span>
                </div>
              )}
              
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/10 dark:border-[#00FFFF]/20 space-y-3 bg-gradient-to-t from-white/5 to-transparent dark:from-[#0A0A0A]/50">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-4 px-5 py-4 rounded-xl bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 border border-gray-200/30 dark:border-white/20 hover:border-gray-300/50 dark:hover:border-[#00FFFF]/30 backdrop-blur-sm group"
          >
            <div className="p-2 rounded-lg bg-white/30 dark:bg-white/10 group-hover:scale-110 transition-transform duration-300">
              {theme === 'light' ? 
                <Moon size={18} className="text-gray-600 dark:text-gray-300" /> : 
                <Sun size={18} className="text-gray-600 dark:text-gray-300" />
              }
            </div>
            <span className="font-semibold text-sm tracking-wide">Cambiar tema</span>
          </button>
          
          {!isGuestModeActive && (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-4 px-5 py-4 rounded-xl bg-red-50/50 dark:bg-[#FF0055]/10 hover:bg-red-100/70 dark:hover:bg-[#FF0055]/20 text-red-600 dark:text-[#FF0055] hover:text-red-700 dark:hover:text-[#FF0055] transition-all duration-300 border border-red-200/50 dark:border-[#FF0055]/30 hover:border-red-300/70 dark:hover:border-[#FF0055]/50 backdrop-blur-sm group"
            >
              <div className="p-2 rounded-lg bg-red-100/50 dark:bg-[#FF0055]/20 group-hover:scale-110 transition-transform duration-300">
                <LogOut size={18} className="text-red-600 dark:text-[#FF0055]" />
              </div>
              <span className="font-semibold text-sm tracking-wide">Cerrar sesión</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
