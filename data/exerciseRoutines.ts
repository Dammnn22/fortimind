import { WorkoutRoutine, ExerciseLevel, WorkoutLocation } from '../types';

// Bilingual exercise data
const EXERCISE_TRANSLATIONS: Record<string, { es: string }> = {
  // Exercise names
  'Jumping Jacks': { es: 'Saltos de Apertura' },
  'Bodyweight Squats': { es: 'Sentadillas con Peso Corporal' },
  'Push-ups (on knees if needed)': { es: 'Flexiones (de rodillas si es necesario)' },
  'Plank': { es: 'Plancha' },
  'Glute Bridges': { es: 'Puente de Glúteos' },
  'Arm Circles': { es: 'Círculos con Brazos' },
  'Wall Push-ups': { es: 'Flexiones en Pared' },
  'Tricep Dips (on chair)': { es: 'Fondos de Tríceps (en silla)' },
  'Superman Hold': { es: 'Mantener Superman' },
  'Cat-Cow Stretch': { es: 'Estiramiento Gato-Vaca' },
  'Marching in Place': { es: 'Marcha en el Lugar' },
  'Lunges (alternating)': { es: 'Estocadas (alternadas)' },
  'Wall Sit': { es: 'Sentadilla en Pared' },
  'Bicycle Crunches': { es: 'Abdominales Bicicleta' },
  'Standing Side Crunches': { es: 'Abdominales Laterales de Pie' },
  'Burpees': { es: 'Burpees' },
  'Pike Push-ups': { es: 'Flexiones Pike' },
  'Single-Leg Glute Bridges': { es: 'Puente de Glúteos a Una Pierna' },
  'Mountain Climbers': { es: 'Escaladores' },
  'Diamond Push-ups': { es: 'Flexiones Diamante' },
  'Decline Push-ups': { es: 'Flexiones Declinadas' },
  'Tricep Dips (advanced)': { es: 'Fondos de Tríceps (avanzado)' },
  'Plank to Downward Dog': { es: 'Plancha a Perro Hacia Abajo' },
  'Burpee Pull-ups': { es: 'Burpee con Dominadas' },
  'Handstand Push-ups': { es: 'Flexiones en Parada de Manos' },
  'Pistol Squats': { es: 'Sentadillas Pistola' },
  'L-Sit Hold': { es: 'Mantener L-Sit' },
  'One-Arm Push-ups': { es: 'Flexiones a Una Mano' },
  'Treadmill Walk/Jog': { es: 'Caminata/Trote en Cinta' },
  'Leg Press Machine': { es: 'Prensa de Piernas' },
  'Chest Press Machine': { es: 'Prensa de Pecho' },
  'Lat Pulldown Machine': { es: 'Jalón al Pecho' },
  'Abdominal Crunch Machine': { es: 'Máquina de Abdominales' },
  'Elliptical Warm-up': { es: 'Calentamiento en Elíptica' },
  'Seated Row Machine': { es: 'Remo Sentado' },
  'Shoulder Press Machine': { es: 'Prensa de Hombros' },
  'Bicep Curl Machine': { es: 'Máquina de Curl de Bíceps' },
  'Tricep Extension Machine': { es: 'Máquina de Extensión de Tríceps' },
  'Treadmill Jog': { es: 'Trote en Cinta' },
  'Barbell Squats': { es: 'Sentadillas con Barra' },
  'Bench Press': { es: 'Press de Banca' },
  'Bent-Over Rows': { es: 'Remo Inclinado' },
  'Overhead Press': { es: 'Press Militar' },
  'Dynamic Stretching': { es: 'Estiramiento Dinámico' },
  'Deadlifts': { es: 'Peso Muerto' },
  'Weighted Pull-ups': { es: 'Dominadas con Peso' },
  'Military Press': { es: 'Press Militar' },
  'Weighted Dips': { es: 'Fondos con Peso' },

  // Muscle group translations
  'Full Body Foundations': { es: 'Fundamentos de Cuerpo Completo' },
  'Upper Body Focus': { es: 'Enfoque en Tren Superior' },
  'Lower Body & Core': { es: 'Tren Inferior y Core' },
  'Full Body Strength': { es: 'Fuerza de Cuerpo Completo' },
  'Upper Body Power': { es: 'Potencia del Tren Superior' },
  'Full Body Power': { es: 'Potencia de Cuerpo Completo' },
  'Full Body Machine Intro': { es: 'Introducción a Máquinas de Cuerpo Completo' },
  'Upper Body Machines': { es: 'Máquinas del Tren Superior' },
  'Full Body Free Weights': { es: 'Pesos Libres de Cuerpo Completo' },
  'Power & Strength': { es: 'Potencia y Fuerza' },

  // Exercise descriptions
  'A great cardio warm-up to get your heart rate up.': { es: 'Un excelente calentamiento cardiovascular para elevar tu frecuencia cardíaca.' },
  'Focus on form, keeping your back straight and chest up.': { es: 'Enfócate en la forma, mantén la espalda recta y el pecho arriba.' },
  'Lower your chest to the floor while keeping your core tight.': { es: 'Baja tu pecho al suelo mientras mantienes el core tenso.' },
  'Maintain a straight line from your head to your heels.': { es: 'Mantén una línea recta desde tu cabeza hasta los talones.' },
  'Squeeze your glutes at the top of the movement.': { es: 'Aprieta los glúteos en la parte superior del movimiento.' },
  'Warm up your shoulders with controlled circular motions.': { es: 'Calienta tus hombros con movimientos circulares controlados.' },
  'Perfect for building strength before regular push-ups.': { es: 'Perfecto para construir fuerza antes de las flexiones regulares.' },
  'Keep your back close to the chair and lower slowly.': { es: 'Mantén tu espalda cerca de la silla y baja lentamente.' },
  'Lift your chest and legs off the ground, hold the position.': { es: 'Levanta tu pecho y piernas del suelo, mantén la posición.' },
  'Gentle spinal mobility exercise.': { es: 'Ejercicio suave de movilidad espinal.' },
  'Gentle cardio warm-up with high knees.': { es: 'Calentamiento cardiovascular suave con rodillas altas.' },
  'Step forward and lower your back knee toward the ground.': { es: 'Da un paso hacia adelante y baja la rodilla trasera hacia el suelo.' },
  'Slide your back down the wall until thighs are parallel to floor.': { es: 'Desliza tu espalda por la pared hasta que los muslos estén paralelos al suelo.' },
  'Alternate touching elbow to opposite knee.': { es: 'Alterna tocando el codo con la rodilla opuesta.' },
  'Lift knee toward elbow while crunching sideways.': { es: 'Levanta la rodilla hacia el codo mientras haces abdominales laterales.' },
  'Full body exercise combining squat, push-up, and jump.': { es: 'Ejercicio de cuerpo completo que combina sentadilla, flexión y salto.' },
  'Advanced push-up variation targeting shoulders.': { es: 'Variación avanzada de flexión que apunta a los hombros.' },
  'Lift one leg while performing glute bridge.': { es: 'Levanta una pierna mientras realizas el puente de glúteos.' },
  'Dynamic core exercise with alternating knee drives.': { es: 'Ejercicio dinámico de core con impulsos alternados de rodilla.' },
  'Hands form diamond shape for tricep focus.': { es: 'Las manos forman forma de diamante para enfocarse en tríceps.' },
  'Feet elevated for increased difficulty.': { es: 'Pies elevados para mayor dificultad.' },
  'Full range of motion dips.': { es: 'Fondos con rango completo de movimiento.' },
  'Hold the lifted position longer.': { es: 'Mantén la posición elevada por más tiempo.' },
  'Dynamic movement between positions.': { es: 'Movimiento dinámico entre posiciones.' },
  'Burpee followed by pull-up if you have a bar.': { es: 'Burpee seguido de dominada si tienes una barra.' },
  'Advanced shoulder exercise against wall.': { es: 'Ejercicio avanzado de hombros contra la pared.' },
  'Single-leg squat with other leg extended.': { es: 'Sentadilla a una pierna con la otra pierna extendida.' },
  'Advanced core exercise holding legs up.': { es: 'Ejercicio avanzado de core manteniendo las piernas arriba.' },
  'Ultimate push-up variation.': { es: 'Variación definitiva de flexión.' },
  'Warmup to get the blood flowing.': { es: 'Calentamiento para hacer fluir la sangre.' },
  'Choose a light to moderate weight to learn the movement.': { es: 'Elige un peso ligero a moderado para aprender el movimiento.' },
  'Keeps the movement controlled and safe.': { es: 'Mantiene el movimiento controlado y seguro.' },
  'Focus on squeezing your back muscles to pull the bar down.': { es: 'Enfócate en apretar los músculos de la espalda para bajar la barra.' },
  'Keep the movement slow and controlled.': { es: 'Mantén el movimiento lento y controlado.' },
  'Low-impact cardio warm-up.': { es: 'Calentamiento cardiovascular de bajo impacto.' },
  'Focus on pulling with your back, not arms.': { es: 'Enfócate en jalar con tu espalda, no con los brazos.' },
  'Keep your back against the seat.': { es: 'Mantén tu espalda contra el asiento.' },
  'Control the movement, don\'t swing.': { es: 'Controla el movimiento, no balancees.' },
  'Keep elbows stationary.': { es: 'Mantén los codos estacionarios.' },
  'Moderate pace warm-up.': { es: 'Calentamiento a ritmo moderado.' },
  'Focus on form and depth.': { es: 'Enfócate en la forma y profundidad.' },
  'Have a spotter for safety.': { es: 'Ten un compañero para seguridad.' },
  'Keep your back straight.': { es: 'Mantén tu espalda recta.' },
  'Press directly overhead.': { es: 'Presiona directamente por encima de la cabeza.' },
  'Comprehensive warm-up routine.': { es: 'Rutina de calentamiento completa.' },
  'Focus on form and progressive overload.': { es: 'Enfócate en la forma y sobrecarga progresiva.' },
  'Add weight for increased difficulty.': { es: 'Añade peso para mayor dificultad.' },
  'Strict overhead press.': { es: 'Press estricto por encima de la cabeza.' },
  'Add weight belt for resistance.': { es: 'Añade cinturón de peso para resistencia.' }
};

// Helper function to get translated exercise name
export const getTranslatedExerciseName = (name: string, language: 'en' | 'es' = 'en'): string => {
  if (language === 'en') return name;
  return EXERCISE_TRANSLATIONS[name]?.es || name;
};

// Helper function to get translated description
export const getTranslatedDescription = (description: string, language: 'en' | 'es' = 'en'): string => {
  if (language === 'en') return description;
  return EXERCISE_TRANSLATIONS[description]?.es || description;
};

// Helper function to get translated muscle group
export const getTranslatedMuscleGroup = (muscleGroup: string, language: 'en' | 'es' = 'en'): string => {
  if (language === 'en') return muscleGroup;
  return EXERCISE_TRANSLATIONS[muscleGroup]?.es || muscleGroup;
};

// Predefined exercise routines for different levels, days, and locations
export const PREDEFINED_ROUTINES: Record<string, WorkoutRoutine> = {
  // Beginner Home Routines
  'day_1_home_beginner': {
    id: 'day_1_home_beginner',
    day: 1,
    level: 'beginner',
    location: 'home',
    muscleGroup: 'Full Body Foundations',
    estimatedTime: '20-30 min',
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', description: 'A great cardio warm-up to get your heart rate up.' },
      { name: 'Bodyweight Squats', sets: 3, reps: '10-12', description: 'Focus on form, keeping your back straight and chest up.' },
      { name: 'Push-ups (on knees if needed)', sets: 3, reps: 'As many as possible', description: 'Lower your chest to the floor while keeping your core tight.' },
      { name: 'Plank', sets: 3, reps: '30 seconds', description: 'Maintain a straight line from your head to your heels.' },
      { name: 'Glute Bridges', sets: 3, reps: '15', description: 'Squeeze your glutes at the top of the movement.'},
    ]
  },
  'day_2_home_beginner': {
    id: 'day_2_home_beginner',
    day: 2,
    level: 'beginner',
    location: 'home',
    muscleGroup: 'Upper Body Focus',
    estimatedTime: '25-35 min',
    exercises: [
      { name: 'Arm Circles', sets: 2, reps: '30 seconds each direction', description: 'Warm up your shoulders with controlled circular motions.' },
      { name: 'Wall Push-ups', sets: 3, reps: '12-15', description: 'Perfect for building strength before regular push-ups.' },
      { name: 'Tricep Dips (on chair)', sets: 3, reps: '8-10', description: 'Keep your back close to the chair and lower slowly.' },
      { name: 'Superman Hold', sets: 3, reps: '20 seconds', description: 'Lift your chest and legs off the ground, hold the position.' },
      { name: 'Cat-Cow Stretch', sets: 2, reps: '10 reps', description: 'Gentle spinal mobility exercise.'},
    ]
  },
  'day_3_home_beginner': {
    id: 'day_3_home_beginner',
    day: 3,
    level: 'beginner',
    location: 'home',
    muscleGroup: 'Lower Body & Core',
    estimatedTime: '25-35 min',
    exercises: [
      { name: 'Marching in Place', sets: 1, reps: '2 minutes', description: 'Gentle cardio warm-up with high knees.' },
      { name: 'Lunges (alternating)', sets: 3, reps: '10 each leg', description: 'Step forward and lower your back knee toward the ground.' },
      { name: 'Wall Sit', sets: 3, reps: '30 seconds', description: 'Slide your back down the wall until thighs are parallel to floor.' },
      { name: 'Bicycle Crunches', sets: 3, reps: '10 each side', description: 'Alternate touching elbow to opposite knee.' },
      { name: 'Standing Side Crunches', sets: 3, reps: '12 each side', description: 'Lift knee toward elbow while crunching sideways.'},
    ]
  },

  // Intermediate Home Routines
  'day_1_home_intermediate': {
    id: 'day_1_home_intermediate',
    day: 1,
    level: 'intermediate',
    location: 'home',
    muscleGroup: 'Full Body Strength',
    estimatedTime: '35-45 min',
    exercises: [
      { name: 'Burpees', sets: 3, reps: '8-10', description: 'Full body exercise combining squat, push-up, and jump.' },
      { name: 'Pike Push-ups', sets: 3, reps: '8-12', description: 'Advanced push-up variation targeting shoulders.' },
      { name: 'Single-Leg Glute Bridges', sets: 3, reps: '12 each leg', description: 'Lift one leg while performing glute bridge.' },
      { name: 'Mountain Climbers', sets: 3, reps: '30 seconds', description: 'Dynamic core exercise with alternating knee drives.' },
      { name: 'Diamond Push-ups', sets: 3, reps: '6-10', description: 'Hands form diamond shape for tricep focus.'},
    ]
  },
  'day_2_home_intermediate': {
    id: 'day_2_home_intermediate',
    day: 2,
    level: 'intermediate',
    location: 'home',
    muscleGroup: 'Upper Body Power',
    estimatedTime: '40-50 min',
    exercises: [
      { name: 'Decline Push-ups', sets: 4, reps: '10-15', description: 'Feet elevated for increased difficulty.' },
      { name: 'Pike Push-ups', sets: 3, reps: '8-12', description: 'Advanced shoulder exercise.' },
      { name: 'Tricep Dips (advanced)', sets: 3, reps: '12-15', description: 'Full range of motion dips.' },
      { name: 'Superman Hold', sets: 3, reps: '30 seconds', description: 'Hold the lifted position longer.' },
      { name: 'Plank to Downward Dog', sets: 3, reps: '10 reps', description: 'Dynamic movement between positions.'},
    ]
  },

  // Professional Home Routines
  'day_1_home_professional': {
    id: 'day_1_home_professional',
    day: 1,
    level: 'professional',
    location: 'home',
    muscleGroup: 'Full Body Power',
    estimatedTime: '45-60 min',
    exercises: [
      { name: 'Burpee Pull-ups', sets: 4, reps: '8-12', description: 'Burpee followed by pull-up if you have a bar.' },
      { name: 'Handstand Push-ups', sets: 3, reps: '5-8', description: 'Advanced shoulder exercise against wall.' },
      { name: 'Pistol Squats', sets: 3, reps: '6-10 each leg', description: 'Single-leg squat with other leg extended.' },
      { name: 'L-Sit Hold', sets: 3, reps: '20-30 seconds', description: 'Advanced core exercise holding legs up.' },
      { name: 'One-Arm Push-ups', sets: 3, reps: '3-6 each arm', description: 'Ultimate push-up variation.'},
    ]
  },

  // Beginner Gym Routines
  'day_1_gym_beginner': {
    id: 'day_1_gym_beginner',
    day: 1,
    level: 'beginner',
    location: 'gym',
    muscleGroup: 'Full Body Machine Intro',
    estimatedTime: '30-45 min',
    exercises: [
      { name: 'Treadmill Walk/Jog', sets: 1, reps: '5-10 minutes', description: 'Warmup to get the blood flowing.' },
      { name: 'Leg Press Machine', sets: 3, reps: '10-12', description: 'Choose a light to moderate weight to learn the movement.' },
      { name: 'Chest Press Machine', sets: 3, reps: '10-12', description: 'Keeps the movement controlled and safe.' },
      { name: 'Lat Pulldown Machine', sets: 3, reps: '10-12', description: 'Focus on squeezing your back muscles to pull the bar down.' },
      { name: 'Abdominal Crunch Machine', sets: 3, reps: '12-15', description: 'Keep the movement slow and controlled.'},
    ]
  },
  'day_2_gym_beginner': {
    id: 'day_2_gym_beginner',
    day: 2,
    level: 'beginner',
    location: 'gym',
    muscleGroup: 'Upper Body Machines',
    estimatedTime: '35-45 min',
    exercises: [
      { name: 'Elliptical Warm-up', sets: 1, reps: '5 minutes', description: 'Low-impact cardio warm-up.' },
      { name: 'Seated Row Machine', sets: 3, reps: '12-15', description: 'Focus on pulling with your back, not arms.' },
      { name: 'Shoulder Press Machine', sets: 3, reps: '10-12', description: 'Keep your back against the seat.' },
      { name: 'Bicep Curl Machine', sets: 3, reps: '12-15', description: 'Control the movement, don\'t swing.' },
      { name: 'Tricep Extension Machine', sets: 3, reps: '12-15', description: 'Keep elbows stationary.'},
    ]
  },

  // Intermediate Gym Routines
  'day_1_gym_intermediate': {
    id: 'day_1_gym_intermediate',
    day: 1,
    level: 'intermediate',
    location: 'gym',
    muscleGroup: 'Full Body Free Weights',
    estimatedTime: '45-60 min',
    exercises: [
      { name: 'Treadmill Jog', sets: 1, reps: '8-10 minutes', description: 'Moderate pace warm-up.' },
      { name: 'Barbell Squats', sets: 4, reps: '8-12', description: 'Focus on form and depth.' },
      { name: 'Bench Press', sets: 4, reps: '8-12', description: 'Have a spotter for safety.' },
      { name: 'Bent-Over Rows', sets: 3, reps: '10-12', description: 'Keep your back straight.' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', description: 'Press directly overhead.'},
    ]
  },

  // Professional Gym Routines
  'day_1_gym_professional': {
    id: 'day_1_gym_professional',
    day: 1,
    level: 'professional',
    location: 'gym',
    muscleGroup: 'Power & Strength',
    estimatedTime: '60-75 min',
    exercises: [
      { name: 'Dynamic Stretching', sets: 1, reps: '10 minutes', description: 'Comprehensive warm-up routine.' },
      { name: 'Deadlifts', sets: 5, reps: '5-8', description: 'Focus on form and progressive overload.' },
      { name: 'Weighted Pull-ups', sets: 4, reps: '6-10', description: 'Add weight for increased difficulty.' },
      { name: 'Military Press', sets: 4, reps: '6-8', description: 'Strict overhead press.' },
      { name: 'Weighted Dips', sets: 3, reps: '8-12', description: 'Add weight belt for resistance.'},
    ]
  },
};

// Helper function to get a routine by key
export const getPredefinedRoutine = (
  day: number,
  level: ExerciseLevel,
  location: WorkoutLocation
): WorkoutRoutine | null => {
  const key = `day_${day}_${location}_${level}`;
  return PREDEFINED_ROUTINES[key] || null;
};

// Helper function to get a random routine for a given day/level/location
export const getRandomPredefinedRoutine = (
  day: number,
  level: ExerciseLevel,
  location: WorkoutLocation
): WorkoutRoutine | null => {
  const availableRoutines = Object.values(PREDEFINED_ROUTINES).filter(
    routine => routine.level === level && routine.location === location
  );
  
  if (availableRoutines.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableRoutines.length);
  const selectedRoutine = availableRoutines[randomIndex];
  
  // Create a new routine with the correct day
  return {
    ...selectedRoutine,
    id: `day_${day}_${location}_${level}_random`,
    day: day,
  };
};

// Muscle group rotation for 30-day challenge
export const MUSCLE_GROUP_ROTATION = [
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Push (Chest, Shoulders, Triceps)',
  'Pull (Back, Biceps)',
  'Legs',
  'Core & Cardio',
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Push (Chest, Shoulders, Triceps)',
  'Pull (Back, Biceps)',
  'Legs',
  'Core & Cardio',
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Push (Chest, Shoulders, Triceps)',
  'Pull (Back, Biceps)',
  'Legs',
  'Core & Cardio',
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Push (Chest, Shoulders, Triceps)',
  'Pull (Back, Biceps)',
];

// Get muscle group for a specific day
export const getMuscleGroupForDay = (day: number): string => {
  return MUSCLE_GROUP_ROTATION[(day - 1) % MUSCLE_GROUP_ROTATION.length];
}; 