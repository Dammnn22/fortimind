import React, { useState } from 'react';
import { Dumbbell, Zap, Trophy, Target, Timer, Flame, Activity, Award, Calendar, TrendingUp, Play, Pause } from 'lucide-react';

const ExerciseChallengePage: React.FC = () => {
  const [activeWorkout, setActiveWorkout] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedWorkouts] = useState(12);
  const [currentStreak] = useState(7);

  const workouts = [
    {
      id: 1,
      title: "Fuerza Explosiva",
      subtitle: "Entrenamiento de alta intensidad",
      icon: <Dumbbell className="w-8 h-8" />,
      duration: "30 min",
      difficulty: "Intermedio",
      calories: 350,
      exercises: 8,
      description: "Desarrolla fuerza explosiva con ejercicios compuestos de alta intensidad",
      color: "cyan",
      sets: [
        { name: "Push-ups", reps: "3x15", rest: "60s" },
        { name: "Squats", reps: "3x20", rest: "60s" },
        { name: "Burpees", reps: "3x10", rest: "90s" },
        { name: "Mountain Climbers", reps: "3x30s", rest: "60s" }
      ]
    },
    {
      id: 2,
      title: "Cardio Killer",
      subtitle: "Quema grasa extrema",
      icon: <Flame className="w-8 h-8" />,
      duration: "25 min",
      difficulty: "Avanzado",
      calories: 450,
      exercises: 6,
      description: "Rutina cardiovascular intensa para maximizar la quema de calorías",
      color: "magenta",
      sets: [
        { name: "High Knees", reps: "4x30s", rest: "30s" },
        { name: "Jump Squats", reps: "4x15", rest: "45s" },
        { name: "Plank Jacks", reps: "4x20", rest: "30s" },
        { name: "Sprint in Place", reps: "4x20s", rest: "60s" }
      ]
    },
    {
      id: 3,
      title: "Core Power",
      subtitle: "Fortalecimiento del núcleo",
      icon: <Target className="w-8 h-8" />,
      duration: "20 min",
      difficulty: "Principiante",
      calories: 200,
      exercises: 10,
      description: "Rutina específica para desarrollar un core fuerte y estable",
      color: "yellow",
      sets: [
        { name: "Plank", reps: "3x60s", rest: "30s" },
        { name: "Russian Twists", reps: "3x25", rest: "45s" },
        { name: "Dead Bug", reps: "3x10/lado", rest: "30s" },
        { name: "Bicycle Crunches", reps: "3x20", rest: "45s" }
      ]
    },
    {
      id: 4,
      title: "Beast Mode",
      subtitle: "Entrenamiento completo",
      icon: <Trophy className="w-8 h-8" />,
      duration: "45 min",
      difficulty: "Experto",
      calories: 600,
      exercises: 12,
      description: "El desafío definitivo: rutina completa para atletas avanzados",
      color: "green",
      sets: [
        { name: "Pull-ups", reps: "4x8", rest: "90s" },
        { name: "Deadlifts", reps: "4x12", rest: "120s" },
        { name: "Clean & Press", reps: "4x6", rest: "90s" },
        { name: "Box Jumps", reps: "4x10", rest: "60s" }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'cyan': return { 
        glow: 'glow-cyan', 
        text: 'text-glow-cyan', 
        border: 'border-cyan-400',
        gradient: 'from-cyan-500 to-blue-500'
      };
      case 'magenta': return { 
        glow: 'glow-magenta', 
        text: 'text-glow-magenta', 
        border: 'border-magenta-400',
        gradient: 'from-magenta-500 to-pink-500'
      };
      case 'yellow': return { 
        glow: 'glow-yellow', 
        text: 'text-glow-yellow', 
        border: 'border-yellow-400',
        gradient: 'from-yellow-500 to-orange-500'
      };
      case 'green': return { 
        glow: 'glow-green', 
        text: 'text-glow-green', 
        border: 'border-green-400',
        gradient: 'from-green-500 to-emerald-500'
      };
      default: return { 
        glow: 'glow-cyan', 
        text: 'text-glow-cyan', 
        border: 'border-cyan-400',
        gradient: 'from-cyan-500 to-blue-500'
      };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante': return 'text-green-400';
      case 'Intermedio': return 'text-yellow-400';
      case 'Avanzado': return 'text-orange-400';
      case 'Experto': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Fondo animado */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-magenta-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Dumbbell className="text-cyan-400 mr-4 animate-pulse" size={40} />
            <h1 className="text-4xl md:text-6xl font-futuristic text-glow-cyan">
              RETO EJERCICIOS
            </h1>
            <Flame className="text-magenta-400 ml-4 animate-pulse" size={40} />
          </div>
          <p className="text-xl md:text-2xl text-secondary mb-8 font-futuristic-light">
            Supera tus límites con entrenamientos de élite
          </p>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glassmorphism glow-cyan p-4 text-center">
              <Calendar className="text-cyan-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-futuristic text-glow-cyan">{completedWorkouts}</div>
              <div className="text-xs text-muted font-futuristic-light">ENTRENAMIENTOS</div>
            </div>
            
            <div className="glassmorphism glow-magenta p-4 text-center">
              <Flame className="text-magenta-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-futuristic text-glow-magenta">{currentStreak}</div>
              <div className="text-xs text-muted font-futuristic-light">DÍAS SEGUIDOS</div>
            </div>
            
            <div className="glassmorphism glow-yellow p-4 text-center">
              <Trophy className="text-yellow-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-futuristic text-glow-yellow">2,450</div>
              <div className="text-xs text-muted font-futuristic-light">CALORÍAS</div>
            </div>
            
            <div className="glassmorphism glow-green p-4 text-center">
              <Award className="text-green-400 mx-auto mb-2" size={24} />
              <div className="text-2xl font-futuristic text-glow-green">85%</div>
              <div className="text-xs text-muted font-futuristic-light">OBJETIVO</div>
            </div>
          </div>
        </div>

        {/* Workout Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {workouts.map((workout) => {
            const colors = getColorClasses(workout.color);
            const isActive = activeWorkout === workout.id;
            
            return (
              <div 
                key={workout.id}
                className={`card-futuristic ${colors.glow} ${isActive ? colors.border : 'border-secondary'} cursor-pointer transition-all duration-300 hover:scale-105`}
              >
                {/* Workout Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.gradient} text-black`}>
                    {workout.icon}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-futuristic ${colors.text}`}>
                      {workout.calories} CAL
                    </div>
                    <div className={`text-xs ${getDifficultyColor(workout.difficulty)}`}>
                      {workout.difficulty}
                    </div>
                  </div>
                </div>

                <h3 className={`text-xl font-futuristic ${colors.text} mb-2`}>
                  {workout.title}
                </h3>
                <p className="text-secondary mb-4 font-futuristic-light">
                  {workout.subtitle}
                </p>

                {/* Workout Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <Timer className="text-muted mx-auto mb-1" size={16} />
                    <div className="text-xs text-muted">{workout.duration}</div>
                  </div>
                  <div className="text-center">
                    <Activity className="text-muted mx-auto mb-1" size={16} />
                    <div className="text-xs text-muted">{workout.exercises} ejercicios</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="text-muted mx-auto mb-1" size={16} />
                    <div className="text-xs text-muted">{workout.difficulty}</div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  className={`w-full btn-futuristic ${colors.glow} mb-4`}
                  onClick={() => setActiveWorkout(isActive ? null : workout.id)}
                >
                  {isActive ? 'OCULTAR DETALLES' : 'VER ENTRENAMIENTO'}
                </button>

                {/* Workout Details */}
                {isActive && (
                  <div className="glassmorphism p-4 animate-fade-in">
                    <p className="text-primary mb-4 text-sm">
                      {workout.description}
                    </p>
                    
                    <h4 className="font-futuristic text-white mb-3">EJERCICIOS:</h4>
                    <div className="space-y-3">
                      {workout.sets.map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between p-3 glass-card">
                          <div>
                            <div className="font-medium text-primary">{exercise.name}</div>
                            <div className="text-xs text-muted">{exercise.reps}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted">Descanso</div>
                            <div className="text-sm text-secondary">{exercise.rest}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted">Set actual:</span>
                        <span className={`font-futuristic ${colors.text}`}>{currentSet}/3</span>
                      </div>
                      
                      <button 
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                          isTimerActive ? 'bg-red-600 hover:bg-red-700' : `bg-gradient-to-r ${colors.gradient}`
                        } text-black font-futuristic transition-all`}
                        onClick={() => setIsTimerActive(!isTimerActive)}
                      >
                        {isTimerActive ? <Pause size={16} /> : <Play size={16} />}
                        <span>{isTimerActive ? 'PAUSAR' : 'COMENZAR'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="glassmorphism glow-violet p-8 mb-12">
          <div className="flex items-center justify-center mb-6">
            <Activity className="text-violet-400 mr-3" size={28} />
            <h3 className="text-2xl font-futuristic text-glow-violet">
              ESTADÍSTICAS DE RENDIMIENTO
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="text-white" size={32} />
              </div>
              <h4 className="font-futuristic text-cyan-400 mb-2">FUERZA</h4>
              <div className="text-2xl font-futuristic text-white mb-1">+25%</div>
              <p className="text-xs text-muted">Último mes</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-magenta-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="text-white" size={32} />
              </div>
              <h4 className="font-futuristic text-magenta-400 mb-2">RESISTENCIA</h4>
              <div className="text-2xl font-futuristic text-white mb-1">+18%</div>
              <p className="text-xs text-muted">Último mes</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={32} />
              </div>
              <h4 className="font-futuristic text-yellow-400 mb-2">TÉCNICA</h4>
              <div className="text-2xl font-futuristic text-white mb-1">92%</div>
              <p className="text-xs text-muted">Precisión</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white" size={32} />
              </div>
              <h4 className="font-futuristic text-green-400 mb-2">LOGROS</h4>
              <div className="text-2xl font-futuristic text-white mb-1">8</div>
              <p className="text-xs text-muted">Este mes</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-muted font-futuristic-light mb-6">
            ¿Listo para romper todos los límites?
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Zap className="text-cyan-400 animate-pulse" size={20} />
            <span className="font-futuristic text-glow-cyan">
              ENTRENA DURO. SUPÉRATE. SÉ FORTIMIND.
            </span>
            <Zap className="text-cyan-400 animate-pulse" size={20} />
          </div>
          
          <button className="btn-futuristic glow-cyan px-8 py-4 text-lg">
            COMENZAR ENTRENAMIENTO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseChallengePage;
