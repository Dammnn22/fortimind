import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuestModeContextType {
  isGuestModeActive: boolean;
  setGuestModeActive: (active: boolean) => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export const useGuestMode = () => {
  const context = useContext(GuestModeContext);
  if (!context) {
    // Si no hay contexto, devolver valores por defecto
    return {
      isGuestModeActive: false,
      setGuestModeActive: () => {}
    };
  }
  return context;
};

interface GuestModeProviderProps {
  children: ReactNode;
}

export const GuestModeProvider: React.FC<GuestModeProviderProps> = ({ children }) => {
  const [isGuestModeActive, setGuestModeActive] = useState(false);

  return (
    <GuestModeContext.Provider value={{ isGuestModeActive, setGuestModeActive }}>
      {children}
    </GuestModeContext.Provider>
  );
};

export default GuestModeContext;
