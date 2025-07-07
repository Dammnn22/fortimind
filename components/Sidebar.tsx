import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, Target, TrendingUp, BookOpen, MessageSquareHeart, Settings, Sun, Moon, BarChart3, Repeat, Award as AwardIcon, LogOut, UserPlus, LogIn, User as UserIconLucide, Menu as MenuIcon, X as XIcon, Gem, Star, Bell, Dumbbell, Leaf, TestTube } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  toggleTheme: () => void;
  isGuestModeActive: boolean;
  onLogout: () => void;
}

const LOGO_SIZE_DESKTOP = 44;
const LOGO_SIZE_MOBILE = 36;
const SIRVIRTUS_COLOR = '#22d3ee'; // Celeste

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, toggleTheme, isGuestModeActive, onLogout }) => {
  const location = useLocation();
  const { t } = useLocalization();

  const navLinks = [
    { to: '/', icon: <TrendingUp size={20} />, label: t('dashboard') },
    { to: '/streaks', icon: <ShieldCheck size={20} />, label: t('streaks') },
    { to: '/goals', icon: <Target size={20} />, label: t('goals') },
    { to: '/habits', icon: <Repeat size={20} />, label: t('habits') },
    { to: '/focus', icon: <Zap size={20} />, label: t('focusMode') },
    { to: '/journal', icon: <MessageSquareHeart size={20} />, label: t('journal') },
    { to: '/statistics', icon: <BarChart3 size={20} />, label: t('statistics') },
    { to: '/learn', icon: <BookOpen size={20} />, label: t('learn') },
    { to: '/support', icon: <ShieldCheck size={20} />, label: t('support') },
    { to: '/challenges', icon: <AwardIcon size={20} />, label: t('challenges') },
    { to: '/exercise-challenge', icon: <Dumbbell size={20} />, label: t('exerciseChallenge') },
    { to: '/nutrition-challenge', icon: <Leaf size={20} />, label: t('nutritionChallenge') },
    { to: '/subscription', icon: <Star size={20} />, label: t('premium') },
    { to: '/admin-dashboard', icon: <BarChart3 size={20} />, label: 'Admin Dashboard' },
    { to: '/settings', icon: <Settings size={20} />, label: t('settings') },
  ];

  return (
    <aside
      className={`
        fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:shadow-lg
      `}
      aria-label="Sidebar"
    >
      {/* Branding: logo1 + Fortimind, debajo a la derecha logo2 + SirVirtus */}
      <div className="flex flex-col px-6 py-7 border-b border-gray-200 dark:border-slate-700 select-none">
        <div className="flex items-center space-x-3">
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg"
            style={{
              width: `${LOGO_SIZE_DESKTOP}px`,
              height: `${LOGO_SIZE_DESKTOP}px`,
            }}
          >
            <img
              src="/logo1.svg"
              alt="Fortimind Logo"
              className="object-contain"
              style={{ width: '70%', height: '70%' }}
            />
          </div>
          <span className="text-2xl font-bold text-primary dark:text-primary-light select-none">Fortimind</span>
        </div>
        <div className="flex items-center justify-end mt-2 w-full">
          <img
            src="/logo2.svg"
            alt="SirVirtus Logo"
            className="object-contain"
            style={{ width: 22, height: 22 }}
          />
          <span className="ml-2 text-base font-semibold" style={{ color: SIRVIRTUS_COLOR }}>SirVirtus</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-1">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out
              ${location.pathname === link.to ? 'bg-primary text-white shadow-md' : 'hover:bg-primary-light hover:text-primary-dark dark:hover:bg-slate-700 dark:text-neutral-light'}
            `}
            onClick={onClose}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Acciones abajo */}
      <div className="mt-auto space-y-2 px-4 pb-6">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out hover:bg-primary-light hover:text-primary-dark dark:hover:bg-slate-700 dark:text-neutral-light"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out hover:bg-danger-light hover:text-danger-dark dark:hover:bg-red-700 dark:text-neutral-light"
        >
          <LogOut size={20} />
          <span>{isGuestModeActive ? 'Salir de invitado' : 'Cerrar sesión'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 