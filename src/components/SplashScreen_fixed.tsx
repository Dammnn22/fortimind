import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const words = ['DISCIPLINADO', 'FUERTE', 'FORTIMIND'];

  useEffect(() => {
    const animateSequence = async () => {
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        setCurrentWordIndex(wordIndex);
        setDisplayText('');
        setShowCursor(true);
        
        const word = words[wordIndex];
        
        // Escribir letra por letra
        for (let i = 1; i <= word.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 120));
          setDisplayText(word.substring(0, i));
        }
        
        // Pausa con cursor visible
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Ocultar cursor y limpiar si no es la última palabra
        if (wordIndex < words.length - 1) {
          setShowCursor(false);
          await new Promise(resolve => setTimeout(resolve, 300));
          setDisplayText('');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          // Última palabra - ocultar cursor y finalizar
          setShowCursor(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      }
    };

    animateSequence();
  }, [onComplete]);

  const getTextColor = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #38BDF8, #7DD3FC)', // DISCIPLINADO - Azul
      'linear-gradient(135deg, #7C3AED, #A78BFA)', // FUERTE - Púrpura
      'linear-gradient(135deg, #06B6D4, #38BDF8, #7C3AED)' // FORTIMIND - Cian a Púrpura
    ];
    return gradients[index] || gradients[0];
  };

  if (isComplete) {
    return null;
  }

  return (
    <div className="splash-container">
      {/* Fondo con efectos sutiles */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Partículas de fondo */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-2/3 w-0.5 h-0.5 bg-cyan-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Contenido principal */}
      <div className="splash-content">
        <div className="splash-text">
          {/* "SÉ" siempre visible y estático */}
          <span className="static-word">SÉ </span>
          
          {/* Palabra animada */}
          <span 
            style={{ 
              background: getTextColor(currentWordIndex),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '800',
              display: 'inline-block',
              borderRight: showCursor ? '3px solid #38BDF8' : 'none',
              animation: showCursor ? 'blink-caret 1s infinite' : 'none',
              minWidth: '20px'
            }}
          >
            {displayText}
          </span>
        </div>
      </div>

      {/* Efectos de brillo */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
    </div>
  );
};

export default SplashScreen;
