import React from 'react';
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
  MessageCircle, // Nuevo icono para consultas
  X 
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

  const NavLinkWrapper: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        onClick={onClose}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out
                    ${isActive ? 'bg-primary text-white shadow-md' : 'hover:bg-primary-light hover:text-primary-dark dark:hover:bg-slate-700'}
                    dark:text-neutral-light`}
      >
        {icon}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h1 className="text-xl font-bold text-primary dark:text-primary-light">
            FortiMind
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLinkWrapper to="/" icon={<Home size={20} />}>
            Inicio
          </NavLinkWrapper>
          
          <NavLinkWrapper to="/goals" icon={<Target size={20} />}>
            Objetivos
          </NavLinkWrapper>
          
          <NavLinkWrapper to="/habits" icon={<TrendingUp size={20} />}>
            Hábitos
          </NavLinkWrapper>
          
          <NavLinkWrapper to="/challenges" icon={<BarChart3 size={20} />}>
            Desafíos
          </NavLinkWrapper>
          
          <NavLinkWrapper to="/learn" icon={<BookOpen size={20} />}>
            Aprender
          </NavLinkWrapper>
          
          <NavLinkWrapper to="/support" icon={<MessageSquareHeart size={20} />}>
            Soporte
          </NavLinkWrapper>

          {/* NUEVA OPCIÓN DE CONSULTAS */}
          <NavLinkWrapper to="/consultas" icon={<MessageCircle size={20} />}>
            Consultas 1:1
          </NavLinkWrapper>

          {/* PÁGINA DE PRUEBA (temporal) */}
          <NavLinkWrapper to="/prueba-consultas" icon={<MessageCircle size={20} />}>
            🧪 Prueba Consultas
          </NavLinkWrapper>
          
          <NavLinkWrapper to="/settings" icon={<Settings size={20} />}>
            Configuración
          </NavLinkWrapper>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t dark:border-slate-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
          >
            <LogOut size={20} />
            <span>{isGuestModeActive ? 'Salir' : 'Cerrar Sesión'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;