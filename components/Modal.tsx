
import React, { ReactNode, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const { t } = useLocalization();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 10); 
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false); 
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div 
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out ${isAnimatingIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} max-h-[calc(100vh-5rem)] flex flex-col p-6`}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          {title && <h2 className="text-xl font-semibold text-neutral-dark dark:text-white">{title}</h2>}
          <button
            onClick={onClose}
            className="text-neutral-dark dark:text-neutral-light hover:text-danger dark:hover:text-danger-light transition-colors"
            aria-label={t('closeModalAria')}
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
