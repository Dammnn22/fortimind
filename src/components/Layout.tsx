import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark text-neutral-dark dark:text-neutral-light">
      <header className="w-full h-[80px] fixed top-0 left-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-neutral-800 flex items-center">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between w-full">
          <h1 className="text-xl font-bold">FortiMind</h1>
          {/* Aquí puedes agregar ThemeSwitcher o botones de usuario */}
        </div>
      </header>
      <main className="pt-[90px] px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
