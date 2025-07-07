import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  calories: string;
}

interface DayPlan {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack1?: Meal | null;
  snack2?: Meal | null;
  totalCalories?: string;
  macros?: string;
}

interface WeekPlan {
  week: number;
  days: DayPlan[];
}

interface NutritionPlanViewerProps {
  planJson: string;
}

const parsePlan = (planJson: string): WeekPlan[] => {
  try {
    console.log('Parsing plan JSON:', planJson);
    
    // First try to parse as a single day
    try {
      const singleDay = JSON.parse(planJson);
      if (singleDay && singleDay.day && singleDay.breakfast) {
        // It's a single day, wrap it in a week structure
        console.log('Parsed as single day, wrapping in week structure');
        return [{
          week: 1,
          days: [singleDay]
        }];
      }
    } catch (e) {
      // Not a single day, continue with array parsing
    }
    
    // Try to parse as array of weeks
    try {
      // Buscar el primer array JSON en el texto
      const arrayMatch = planJson.match(/\[([\s\S]*?)\]/);
      const jsonStr = arrayMatch ? `[${arrayMatch[1]}]` : planJson;
      const plan = JSON.parse(jsonStr);
      
      if (Array.isArray(plan)) {
        console.log('Parsed as array of weeks:', plan.length, 'weeks');
        return plan;
      }
      
      if (plan.semanas) {
        console.log('Parsed as semanas object');
        return plan.semanas;
      }
    } catch (e) {
      console.error('Failed to parse as array:', e);
    }
    
    console.log('No valid plan structure found');
    return [];
  } catch (error) {
    console.error('Error parsing plan:', error);
    return [];
  }
};

const getLocalMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
};

const NutritionPlanViewer: React.FC<NutritionPlanViewerProps> = ({ planJson }) => {
  const weeks = parsePlan(planJson);
  const [completedDay, setCompletedDay] = useState<number | null>(null);
  const [resetTime, setResetTime] = useState(getLocalMidnight());

  // Reiniciar el estado a medianoche local
  useEffect(() => {
    const now = Date.now();
    const timeout = resetTime - now;
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setCompletedDay(null);
        setResetTime(getLocalMidnight());
      }, timeout);
      return () => clearTimeout(timer);
    } else {
      setCompletedDay(null);
      setResetTime(getLocalMidnight());
    }
  }, [resetTime]);

  const handleCompleteDay = (day: number) => {
    setCompletedDay(day);
    toast.success('¡Plan nutricional completado por hoy! Vuelve mañana para tu siguiente día.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!weeks || weeks.length === 0 && (
        <div className="text-center text-red-600 font-bold">No se pudo interpretar el plan generado por la IA.</div>
      )}
      {weeks && weeks.map(week => (
        <div key={week.week} className="mb-8 border rounded-xl shadow bg-white dark:bg-slate-800">
          <div className="px-6 py-4 border-b text-lg font-bold bg-primary/10 dark:bg-primary-dark/20 rounded-t-xl">Semana {week.week}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {week.days && week.days.map(day => (
              <div key={day.day} className={`rounded-lg border shadow p-4 bg-neutral-50 dark:bg-slate-900 flex flex-col ${completedDay === day.day ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-primary">Día {day.day}</span>
                  <button
                    className={`px-3 py-1 rounded bg-green-500 text-white font-semibold text-xs shadow hover:bg-green-600 transition ${completedDay === day.day ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={completedDay === day.day}
                    onClick={() => handleCompleteDay(day.day)}
                  >
                    {completedDay === day.day ? 'Completado' : 'Marcar como completado'}
                  </button>
                </div>
                <div className="mb-2">
                  <strong>Desayuno:</strong> {day.breakfast?.name || 'No especificado'} <br />
                  <span className="text-xs text-gray-500">{day.breakfast?.description || ''}</span>
                  <div className="text-xs mt-1">Ingredientes: {day.breakfast?.ingredients?.join(', ') || 'No especificados'}</div>
                  <div className="text-xs">Calorías: {day.breakfast?.calories || 'No especificadas'}</div>
                </div>
                <div className="mb-2">
                  <strong>Almuerzo:</strong> {day.lunch?.name || 'No especificado'} <br />
                  <span className="text-xs text-gray-500">{day.lunch?.description || ''}</span>
                  <div className="text-xs mt-1">Ingredientes: {day.lunch?.ingredients?.join(', ') || 'No especificados'}</div>
                  <div className="text-xs">Calorías: {day.lunch?.calories || 'No especificadas'}</div>
                </div>
                <div className="mb-2">
                  <strong>Cena:</strong> {day.dinner?.name || 'No especificado'} <br />
                  <span className="text-xs text-gray-500">{day.dinner?.description || ''}</span>
                  <div className="text-xs mt-1">Ingredientes: {day.dinner?.ingredients?.join(', ') || 'No especificados'}</div>
                  <div className="text-xs">Calorías: {day.dinner?.calories || 'No especificadas'}</div>
                </div>
                {day.snack1 && (
                  <div className="mb-2">
                    <strong>Snack 1:</strong> {day.snack1.name} <br />
                    <span className="text-xs text-gray-500">{day.snack1.description}</span>
                    <div className="text-xs mt-1">Ingredientes: {day.snack1.ingredients?.join(', ')}</div>
                    <div className="text-xs">Calorías: {day.snack1.calories}</div>
                  </div>
                )}
                {day.snack2 && (
                  <div className="mb-2">
                    <strong>Snack 2:</strong> {day.snack2.name} <br />
                    <span className="text-xs text-gray-500">{day.snack2.description}</span>
                    <div className="text-xs mt-1">Ingredientes: {day.snack2.ingredients?.join(', ')}</div>
                    <div className="text-xs">Calorías: {day.snack2.calories}</div>
                  </div>
                )}
                {day.totalCalories && (
                  <div className="mt-2 text-sm font-semibold">Total calorías: {day.totalCalories}</div>
                )}
                {day.macros && (
                  <div className="text-xs text-gray-600">Macronutrientes: {day.macros}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NutritionPlanViewer; 