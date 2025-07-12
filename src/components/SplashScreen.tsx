import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showStatic, setShowStatic] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('static'); // 'static', 'word', 'complete'

  const words = ['DISCIPLINADO', 'FUERTE', 'FORTIMIND'];
  const colors = ['#38BDF8', '#10B981', '#F59E0B'];

  useEffect(() => {
    const animateSequence = async () => {
      // Mostrar "SÉ" primero
      setShowStatic(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        setCurrentWordIndex(wordIndex);
        setAnimationPhase('word');
        
        // Mostrar palabra con animación de entrada
        setShowWord(true);
        
        // Mantener visible por un tiempo
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        // Si no es la última palabra, resetear para la siguiente
        if (wordIndex < words.length - 1) {
          setShowWord(false);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Animación completa - mostrar resultado final
      setAnimationPhase('complete');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsComplete(true);
      
      if (onComplete) {
        onComplete();
      }
    };

    animateSequence();
  }, [onComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <div className="splash-container splash-optimized">
      {/* Fondo con efectos optimizados */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 transition-all duration-500 ease-out"
          style={{
            backgroundImage: `
              linear-gradient(${colors[currentWordIndex]}30 1px, transparent 1px),
              linear-gradient(90deg, ${colors[currentWordIndex]}30 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Partículas optimizadas */}
        <div 
          className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full opacity-40 animate-pulse transition-all duration-500 ease-out"
          style={{ backgroundColor: colors[currentWordIndex] }}
        />
        <div 
          className="absolute top-3/4 right-1/3 w-3 h-3 rounded-full opacity-30 animate-pulse transition-all duration-500 ease-out"
          style={{ 
            backgroundColor: colors[currentWordIndex],
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute bottom-1/4 left-2/3 w-1 h-1 rounded-full opacity-50 animate-pulse transition-all duration-500 ease-out"
          style={{ 
            backgroundColor: colors[currentWordIndex],
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className="splash-content">
        <div className="splash-text">
          {/* "SÉ" estático */}
          {showStatic && (
            <span 
              className="static-word"
              style={{
                color: '#E2E8F0',
                fontWeight: '700',
                marginRight: '0.75rem',
                fontSize: 'inherit',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'inline-block',
                letterSpacing: '-0.02em',
                textShadow: '0 0 15px rgba(226, 232, 240, 0.3)',
                zIndex: 10,
                animation: 'fade-in 0.8s ease-out'
              }}
            >
              SÉ
            </span>
          )}
          
          {/* Texto con animación solo de entrada */}
          {animationPhase === 'complete' ? (
            // Mostrar resultado final: "SÉ FORTIMIND"
            <span 
              className="final-word"
              style={{ 
                color: colors[2], // Color de FORTIMIND
                fontWeight: '800',
                fontSize: 'inherit',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'inline-block',
                letterSpacing: '-0.02em',
                textShadow: `0 0 20px ${colors[2]}40`,
                zIndex: 10,
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              FORTIMIND
            </span>
          ) : (
            // Mostrar palabra actual durante la animación
            <span 
              className="animated-word"
              style={{ 
                color: colors[currentWordIndex],
                fontWeight: '800',
                fontSize: 'inherit',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'inline-block',
                letterSpacing: '-0.02em',
                textShadow: `0 0 20px ${colors[currentWordIndex]}40`,
                zIndex: 10,
                opacity: showWord ? 1 : 0,
                transform: showWord ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'opacity, transform'
              }}
            >
              {words[currentWordIndex]}
            </span>
          )}
        </div>
      </div>

      {/* Efectos de brillo optimizados */}
      <div 
        className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl animate-pulse transition-all duration-500 ease-out"
        style={{ 
          backgroundColor: `${colors[currentWordIndex]}20`
        }}
      />
      <div 
        className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-3xl animate-pulse transition-all duration-500 ease-out"
        style={{ 
          backgroundColor: `${colors[currentWordIndex]}15`,
          animationDelay: '2s'
        }}
      />
    </div>
  );
};

export default SplashScreen;
