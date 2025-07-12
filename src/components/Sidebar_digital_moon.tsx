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
  CreditCard,
  Shield,
  Users,
  Dumbbell,
  Apple
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isGuestModeActive: boolean;
  onLogout: () => void;
  firebaseUser?: any; // Para poder verificar roles
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  isGuestModeActive,
  onLogout,
  firebaseUser,
}) => {
  const location = useLocation();
  
  // Elementos base de navegación
  const baseNavLinks = [
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
    { 
      to: "/exercise-challenge", 
      icon: <Dumbbell size={20} />, 
      label: "Reto Ejercicio",
      description: "Desafíos de fitness"
    },
    { 
      to: "/nutrition-challenge", 
      icon: <Apple size={20} />, 
      label: "Reto Nutrición",
      description: "Desafíos alimentarios"
    },
    { to: "/learn", icon: <BookOpen size={20} />, label: "Aprender" },
    { to: "/journal", icon: <MessageSquareHeart size={20} />, label: "Diario" },
    { to: "/statistics", icon: <Star size={20} />, label: "Estadísticas" },
    { to: "/settings", icon: <Settings size={20} />, label: "Configuración" }
  ];

  // Elementos administrativos (solo para administradores)
  const adminNavLinks = [
    { 
      to: "/admin-dashboard", 
      icon: <Shield size={20} />, 
      label: "Admin Dashboard",
      description: "Panel administrativo"
    }
  ];

  // Elementos para especialistas
  const specialistNavLinks = [
    { 
      to: "/especialista-dashboard", 
      icon: <Users size={20} />, 
      label: "Dashboard Especialista",
      description: "Panel de especialistas"
    }
  ];

  // Combinar elementos según el contexto
  let navLinks = [...baseNavLinks];

  // TODO: Aquí se pueden agregar verificaciones de roles cuando esté implementado
  // Por ahora, mostrar todos los elementos para que el usuario pueda acceder
  navLinks = [...navLinks, ...adminNavLinks, ...specialistNavLinks];

  if (!isGuestModeActive) {
    navLinks.push({
      to: "/subscription",
      icon: <CreditCard size={20} />,
      label: "Suscripción"
    });
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        backdrop-blur-xl border-r border-sky-500/20 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:transform-none shadow-2xl shadow-sky-500/10
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sky-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              FortiMind
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden group"
          >
            <X size={20} className="text-slate-300 group-hover:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`
                  group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 relative overflow-hidden
                  hover:bg-gradient-to-r hover:from-sky-500/20 hover:to-violet-500/20
                  hover:border-l-4 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/25
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-500/30 to-violet-500/30 border-l-4 border-sky-400 shadow-lg shadow-sky-500/25' 
                    : 'hover:bg-white/5'
                  }
                `}
              >
                {/* Glow effect cuando está activo */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-violet-400/10 rounded-xl blur-sm" />
                )}
                
                <div className={`
                  p-2 rounded-lg transition-all duration-200 relative z-10
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-400 to-violet-500 text-white shadow-lg' 
                    : 'text-slate-400 group-hover:text-sky-400 group-hover:bg-sky-400/10'
                  }
                `}>
                  {cloneElement(link.icon, { size: 18 })}
                </div>
                <div className="flex-1 relative z-10">
                  <div className="flex items-center space-x-2">
                    <span className={`
                      font-medium transition-colors
                      ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                    `}>
                      {link.label}
                    </span>
                    {link.isNew && (
                      <span className="px-2 py-1 text-xs bg-gradient-to-r from-cyan-400 to-sky-500 text-white rounded-full font-medium animate-pulse">
                        NUEVO
                      </span>
                    )}
                  </div>
                  {link.description && (
                    <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-400">
                      {link.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sky-500/20 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg text-slate-400 group-hover:text-sky-400 group-hover:bg-sky-400/10 transition-all duration-200">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <span className="font-medium">
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg text-slate-400 group-hover:text-red-400 group-hover:bg-red-400/10 transition-all duration-200">
              <LogOut size={18} />
            </div>
            <span className="font-medium">
              {isGuestModeActive ? 'Salir del Modo Invitado' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
