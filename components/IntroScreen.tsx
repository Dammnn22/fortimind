import React, { useEffect, useState } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
  isDarkMode?: boolean;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, isDarkMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const phrases = [
    "Sé disciplinado.",
    "Sé fuerte.",
    "Sé FortiMind."
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < phrases.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Esperar un poco más en la última frase, luego completar
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Animated background blur effect */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br animate-pulse ${
          isDarkMode 
            ? 'from-purple-900/20 via-blue-900/20 to-indigo-900/20' 
            : 'from-purple-100/40 via-blue-100/40 to-indigo-100/40'
        }`} />
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-float ${
          isDarkMode ? 'bg-purple-500/10' : 'bg-purple-300/20'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl animate-float-delayed ${
          isDarkMode ? 'bg-blue-500/10' : 'bg-blue-300/20'
        }`} />
      </div>

      {/* Text container */}
      <div className="relative z-10 text-center">
        {phrases.map((phrase, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-700 ease-out
              ${currentStep === index 
                ? 'opacity-100 scale-100 blur-0 translate-y-0' 
                : currentStep > index 
                  ? 'opacity-0 scale-110 blur-sm -translate-y-4'
                  : 'opacity-0 scale-90 blur-sm translate-y-4'
              }
            `}
          >
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-extralight tracking-wide ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {phrase}
            </h1>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${currentStep >= i 
                  ? (isDarkMode ? 'bg-white scale-110' : 'bg-gray-900 scale-110')
                  : (isDarkMode ? 'bg-white/50' : 'bg-gray-400/50')
                }
              `}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -10px) scale(1.05); }
          50% { transform: translate(-5px, -20px) scale(0.95); }
          75% { transform: translate(-10px, 10px) scale(1.02); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-15px, 10px) scale(0.98); }
          50% { transform: translate(8px, 20px) scale(1.03); }
          75% { transform: translate(12px, -8px) scale(0.97); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;
