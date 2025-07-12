import React, { useState } from 'react';
import { Apple, Leaf, Star, Target, Clock, CheckCircle, TrendingUp, Award, Zap, Heart, Calendar, BookOpen } from 'lucide-react';

const NutritionChallengePage: React.FC = () => {
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<number>(5);
  const [totalDays] = useState<number>(30);

  const challenges = [
    {
      id: 1,
      title: "Hidratación Perfecta",
      subtitle: "8 vasos de agua al día",
      icon: <Apple className="w-8 h-8" />,
      difficulty: "Principiante",
      duration: "7 días",
      points: 100,
      description: "Mantén tu cuerpo hidratado bebiendo la cantidad óptima de agua diariamente",
      color: "cyan",
      progress: 75
    },
    {
      id: 2,
      title: "Desafío Verde",
      subtitle: "5 porciones de vegetales",
      icon: <Leaf className="w-8 h-8" />,
      difficulty: "Intermedio",
      duration: "14 días",
      points: 250,
      description: "Incorpora más vegetales frescos y nutritivos en cada comida principal",
      color: "green",
      progress: 60
    },
    {
      id: 3,
      title: "Proteína Power",
      subtitle: "Fuentes variadas de proteína",
      icon: <Zap className="w-8 h-8" />,
      difficulty: "Avanzado",
      duration: "21 días",
      points: 350,
      description: "Optimiza tu consumo de proteínas con fuentes diversas y de alta calidad",
      color: "yellow",
      progress: 30
    },
    {
      id: 4,
      title: "Detox Natural",
      subtitle: "Elimina procesados",
      icon: <Heart className="w-8 h-8" />,
      difficulty: "Experto",
      duration: "30 días",
      points: 500,
      description: "Purifica tu alimentación eliminando alimentos ultraprocesados",
      color: "magenta",
      progress: 0
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan': return { glow: 'glow-cyan', text: 'text-glow-cyan', border: 'border-cyan-400' };
      case 'green': return { glow: 'glow-green', text: 'text-glow-green', border: 'border-green-400' };
      case 'yellow': return { glow: 'glow-yellow', text: 'text-glow-yellow', border: 'border-yellow-400' };
      case 'magenta': return { glow: 'glow-magenta', text: 'text-glow-magenta', border: 'border-magenta-400' };
      default: return { glow: 'glow-cyan', text: 'text-glow-cyan', border: 'border-cyan-400' };
    }
  };

  const progressPercentage = (completedDays / totalDays) * 100;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Fondo animado */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/5 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Apple className="text-green-400 mr-4 animate-pulse" size={40} />
            <h1 className="text-4xl md:text-6xl font-futuristic text-glow-green">
              RETO NUTRICIÓN
            </h1>
            <Leaf className="text-yellow-400 ml-4 animate-pulse" size={40} />
          </div>
          <p className="text-xl md:text-2xl text-secondary mb-8 font-futuristic-light">
            Transforma tu alimentación con desafíos científicamente diseñados
          </p>

          {/* Progreso general */}
          <div className="glassmorphism glow-green max-w-md mx-auto p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-futuristic text-green-400">PROGRESO ACTUAL</span>
              <span className="font-futuristic text-white">{completedDays}/{totalDays}</span>
            </div>
            <div className="w-full bg-card rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 glow-green"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center">
              <TrendingUp className="text-green-400 mr-2" size={20} />
              <span className="text-green-400 font-futuristic text-sm">
                {Math.round(progressPercentage)}% COMPLETADO
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-futuristic glow-cyan text-center">
            <Calendar className="text-cyan-400 mx-auto mb-3" size={32} />
            <div className="text-3xl font-futuristic text-glow-cyan mb-2">5</div>
            <div className="text-muted font-futuristic-light text-sm">DÍAS ACTIVOS</div>
          </div>
          
          <div className="card-futuristic glow-yellow text-center">
            <Star className="text-yellow-400 mx-auto mb-3" size={32} />
            <div className="text-3xl font-futuristic text-glow-yellow mb-2">1,250</div>
            <div className="text-muted font-futuristic-light text-sm">PUNTOS XP</div>
          </div>
          
          <div className="card-futuristic glow-green text-center">
            <CheckCircle className="text-green-400 mx-auto mb-3" size={32} />
            <div className="text-3xl font-futuristic text-glow-green mb-2">3</div>
            <div className="text-muted font-futuristic-light text-sm">COMPLETADOS</div>
          </div>
          
          <div className="card-futuristic glow-magenta text-center">
            <Award className="text-magenta-400 mx-auto mb-3" size={32} />
            <div className="text-3xl font-futuristic text-glow-magenta mb-2">15</div>
            <div className="text-muted font-futuristic-light text-sm">RACHA ACTUAL</div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {challenges.map((challenge) => {
            const colors = getColorClasses(challenge.color);
            const isActive = activeChallenge === challenge.id;
            
            return (
              <div 
                key={challenge.id}
                className={`card-futuristic ${colors.glow} ${isActive ? colors.border : 'border-secondary'} cursor-pointer transition-all duration-300 hover:scale-105`}
                onClick={() => setActiveChallenge(isActive ? null : challenge.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${
                    challenge.color === 'cyan' ? 'from-cyan-500 to-blue-500' :
                    challenge.color === 'green' ? 'from-green-500 to-emerald-500' :
                    challenge.color === 'yellow' ? 'from-yellow-500 to-orange-500' :
                    'from-magenta-500 to-pink-500'
                  } text-black`}>
                    {challenge.icon}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-futuristic ${colors.text}`}>
                      +{challenge.points} XP
                    </div>
                    <div className="text-xs text-muted">
                      {challenge.difficulty}
                    </div>
                  </div>
                </div>

                <h3 className={`text-xl font-futuristic ${colors.text} mb-2`}>
                  {challenge.title}
                </h3>
                <p className="text-secondary mb-4 font-futuristic-light">
                  {challenge.subtitle}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted">Progreso</span>
                    <span className={colors.text}>{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-card rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${
                        challenge.color === 'cyan' ? 'from-cyan-400 to-blue-400' :
                        challenge.color === 'green' ? 'from-green-400 to-emerald-400' :
                        challenge.color === 'yellow' ? 'from-yellow-400 to-orange-400' :
                        'from-magenta-400 to-pink-400'
                      } h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Challenge Details */}
                {isActive && (
                  <div className="glassmorphism p-4 mt-4 animate-fade-in">
                    <p className="text-primary mb-4 text-sm">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <Clock className="mr-1" size={14} />
                        <span>{challenge.duration}</span>
                      </div>
                      <button className={`btn-futuristic ${colors.glow} px-4 py-2 text-xs`}>
                        {challenge.progress === 0 ? 'COMENZAR' : 'CONTINUAR'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nutrition Tips */}
        <div className="glassmorphism glow-violet p-8 mb-12">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="text-violet-400 mr-3" size={28} />
            <h3 className="text-2xl font-futuristic text-glow-violet">
              CONSEJOS NUTRICIONALES
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Apple className="text-white" size={24} />
              </div>
              <h4 className="font-futuristic text-cyan-400 mb-2">HIDRATACIÓN</h4>
              <p className="text-sm text-secondary">
                Bebe agua antes de cada comida para mejorar la digestión y el metabolismo
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-white" size={24} />
              </div>
              <h4 className="font-futuristic text-green-400 mb-2">VEGETALES</h4>
              <p className="text-sm text-secondary">
                Incluye vegetales de diferentes colores para obtener todos los nutrientes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h4 className="font-futuristic text-yellow-400 mb-2">PROTEÍNAS</h4>
              <p className="text-sm text-secondary">
                Combina proteínas vegetales y animales para un perfil aminoacídico completo
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-muted font-futuristic-light mb-6">
            ¿Listo para revolucionar tu alimentación?
          </p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="text-green-400 animate-pulse" size={20} />
            <span className="font-futuristic text-glow-green">
              NUTRE TU CUERPO. FORTALECE TU MENTE. SÉ FORTIMIND.
            </span>
            <Heart className="text-green-400 animate-pulse" size={20} />
          </div>
          
          <button className="btn-futuristic glow-green px-8 py-4 text-lg">
            COMENZAR NUEVO RETO
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionChallengePage;
