import { DailyMealPlan, Meal, NutritionGoal, DietaryStyle } from '../types';

// Bilingual nutrition data
const NUTRITION_TRANSLATIONS: Record<string, { es: string }> = {
  // Meal names
  'Oatmeal with Berries and Nuts': { es: 'Avena con Bayas y Nueces' },
  'Greek Yogurt Protein Bowl': { es: 'Tazón de Yogur Griego con Proteína' },
  'Vegan Smoothie Bowl': { es: 'Tazón de Batido Vegano' },
  'Egg and Avocado Toast': { es: 'Tostada de Huevo y Aguacate' },
  'Quinoa Chicken Bowl': { es: 'Tazón de Quinua con Pollo' },
  'Vegan Buddha Bowl': { es: 'Tazón Buda Vegano' },
  'Mediterranean Salad': { es: 'Ensalada Mediterránea' },
  'Turkey and Hummus Wrap': { es: 'Wrap de Pavo y Hummus' },
  'Baked Salmon with Roasted Vegetables': { es: 'Salmón Horneado con Verduras Asadas' },
  'Vegan Lentil Curry': { es: 'Curry de Lentejas Vegano' },
  'Lean Beef Stir Fry': { es: 'Salteado de Ternera Magra' },
  'Vegetarian Pasta Primavera': { es: 'Pasta Primavera Vegetariana' },
  'Apple with Almond Butter': { es: 'Manzana con Mantequilla de Almendras' },
  'Greek Yogurt with Berries': { es: 'Yogur Griego con Bayas' },
  'Hummus with Vegetables': { es: 'Hummus con Verduras' },
  'Protein Smoothie': { es: 'Batido de Proteína' },

  // Meal descriptions
  'A hearty and nutritious breakfast with complex carbohydrates and antioxidants.': { es: 'Un desayuno abundante y nutritivo con carbohidratos complejos y antioxidantes.' },
  'High-protein breakfast with healthy fats and fiber.': { es: 'Desayuno alto en proteínas con grasas saludables y fibra.' },
  'Plant-based breakfast packed with nutrients and fiber.': { es: 'Desayuno a base de plantas lleno de nutrientes y fibra.' },
  'Protein-rich breakfast with healthy fats and whole grains.': { es: 'Desayuno rico en proteínas con grasas saludables y granos enteros.' },
  'Balanced lunch with lean protein, complex carbs, and vegetables.': { es: 'Almuerzo balanceado con proteína magra, carbohidratos complejos y verduras.' },
  'Plant-based lunch with protein from legumes and healthy fats.': { es: 'Almuerzo a base de plantas con proteína de legumbres y grasas saludables.' },
  'Fresh and light lunch with Mediterranean flavors.': { es: 'Almuerzo fresco y ligero con sabores mediterráneos.' },
  'Protein-packed wrap with fiber and healthy fats.': { es: 'Wrap lleno de proteínas con fibra y grasas saludables.' },
  'Omega-3 rich dinner with lean protein and fiber.': { es: 'Cena rica en Omega-3 con proteína magra y fibra.' },
  'Plant-based dinner rich in protein and fiber.': { es: 'Cena a base de plantas rica en proteínas y fibra.' },
  'High-protein dinner with vegetables and complex carbs.': { es: 'Cena alta en proteínas con verduras y carbohidratos complejos.' },
  'Light vegetarian dinner with whole grain pasta.': { es: 'Cena vegetariana ligera con pasta integral.' },
  'Fiber-rich snack with healthy fats and protein.': { es: 'Snack rico en fibra con grasas saludables y proteína.' },
  'Protein-rich snack with antioxidants.': { es: 'Snack rico en proteínas con antioxidantes.' },
  'Plant-based snack with protein and fiber.': { es: 'Snack a base de plantas con proteína y fibra.' },
  'Quick protein boost with essential nutrients.': { es: 'Refuerzo rápido de proteínas con nutrientes esenciales.' },

  // Ingredient translations
  'rolled oats': { es: 'avena en hojuelas' },
  'almond milk': { es: 'leche de almendras' },
  'mixed berries': { es: 'bayas mixtas' },
  'strawberries': { es: 'fresas' },
  'blueberries': { es: 'arándanos' },
  'raspberries': { es: 'frambuesas' },
  'chopped almonds': { es: 'almendras picadas' },
  'honey': { es: 'miel' },
  'cinnamon': { es: 'canela' },
  'Greek yogurt': { es: 'yogur griego' },
  'non-fat': { es: 'sin grasa' },
  'granola': { es: 'granola' },
  'chia seeds': { es: 'semillas de chía' },
  'chopped walnuts': { es: 'nueces picadas' },
  'frozen banana': { es: 'plátano congelado' },
  'frozen mango': { es: 'mango congelado' },
  'spinach': { es: 'espinacas' },
  'protein powder': { es: 'proteína en polvo' },
  'plant-based': { es: 'a base de plantas' },
  'coconut flakes': { es: 'copos de coco' },
  'whole grain bread': { es: 'pan integral' },
  'large eggs': { es: 'huevos grandes' },
  'avocado': { es: 'aguacate' },
  'cherry tomatoes': { es: 'tomates cherry' },
  'salt and pepper': { es: 'sal y pimienta' },
  'olive oil': { es: 'aceite de oliva' },
  'cooked quinoa': { es: 'quinua cocida' },
  'grilled chicken breast': { es: 'pechuga de pollo a la parrilla' },
  'mixed vegetables': { es: 'verduras mixtas' },
  'broccoli': { es: 'brócoli' },
  'carrots': { es: 'zanahorias' },
  'bell peppers': { es: 'pimientos' },
  'chickpeas': { es: 'garbanzos' },
  'lemon juice': { es: 'jugo de limón' },
  'herbs': { es: 'hierbas' },
  'brown rice': { es: 'arroz integral' },
  'black beans': { es: 'frijoles negros' },
  'roasted sweet potato': { es: 'batata asada' },
  'kale': { es: 'col rizada' },
  'tahini dressing': { es: 'aderezo de tahini' },
  'mixed greens': { es: 'verduras mixtas' },
  'cucumber': { es: 'pepino' },
  'olives': { es: 'aceitunas' },
  'feta cheese': { es: 'queso feta' },
  'balsamic vinegar': { es: 'vinagre balsámico' },
  'whole grain tortilla': { es: 'tortilla integral' },
  'turkey breast': { es: 'pechuga de pavo' },
  'hummus': { es: 'hummus' },
  'shredded carrots': { es: 'zanahorias ralladas' },
  'salmon fillet': { es: 'filete de salmón' },
  'roasted vegetables': { es: 'verduras asadas' },
  'asparagus': { es: 'espárragos' },
  'zucchini': { es: 'calabacín' },
  'garlic': { es: 'ajo' },
  'red lentils': { es: 'lentejas rojas' },
  'coconut milk': { es: 'leche de coco' },
  'curry spices': { es: 'especias de curry' },
  'turmeric': { es: 'cúrcuma' },
  'cumin': { es: 'comino' },
  'coriander': { es: 'cilantro' },
  'fresh cilantro': { es: 'cilantro fresco' },
  'lean beef strips': { es: 'tiras de ternera magra' },
  'snap peas': { es: 'guisantes dulces' },
  'low-sodium soy sauce': { es: 'salsa de soja baja en sodio' },
  'sesame oil': { es: 'aceite de sésamo' },
  'ginger': { es: 'jengibre' },
  'whole grain pasta': { es: 'pasta integral' },
  'parmesan cheese': { es: 'queso parmesano' },
  'fresh basil': { es: 'albahaca fresca' },
  'medium apple': { es: 'manzana mediana' },
  'almond butter': { es: 'mantequilla de almendras' },
  'sprinkle of cinnamon': { es: 'pizca de canela' },
  'whole grain crackers': { es: 'galletas integrales' },
  'celery': { es: 'apio' }
};

// Helper function to get translated meal name
export const getTranslatedMealName = (name: string, language: 'en' | 'es' = 'en'): string => {
  if (language === 'en') return name;
  return NUTRITION_TRANSLATIONS[name]?.es || name;
};

// Helper function to get translated description
export const getTranslatedMealDescription = (description: string, language: 'en' | 'es' = 'en'): string => {
  if (language === 'en') return description;
  return NUTRITION_TRANSLATIONS[description]?.es || description;
};

// Helper function to get translated ingredient
export const getTranslatedIngredient = (ingredient: string, language: 'en' | 'es' = 'en'): string => {
  if (language === 'en') return ingredient;
  return NUTRITION_TRANSLATIONS[ingredient]?.es || ingredient;
};

// Predefined meals for different dietary styles and goals
export const PREDEFINED_MEALS: Record<string, Meal> = {
  // Breakfast Meals
  'breakfast_oatmeal_berries': {
    name: 'Oatmeal with Berries and Nuts',
    description: 'A hearty and nutritious breakfast with complex carbohydrates and antioxidants.',
    ingredients: [
      '1 cup rolled oats',
      '1 cup almond milk',
      '1/2 cup mixed berries (strawberries, blueberries, raspberries)',
      '2 tbsp chopped almonds',
      '1 tbsp honey',
      '1/2 tsp cinnamon'
    ],
    calories: '~350-400 kcal'
  },
  'breakfast_greek_yogurt_bowl': {
    name: 'Greek Yogurt Protein Bowl',
    description: 'High-protein breakfast with healthy fats and fiber.',
    ingredients: [
      '1 cup Greek yogurt (non-fat)',
      '1/4 cup granola',
      '1/2 cup mixed berries',
      '1 tbsp chia seeds',
      '1 tbsp honey',
      '2 tbsp chopped walnuts'
    ],
    calories: '~300-350 kcal'
  },
  'breakfast_vegan_smoothie_bowl': {
    name: 'Vegan Smoothie Bowl',
    description: 'Plant-based breakfast packed with nutrients and fiber.',
    ingredients: [
      '1 frozen banana',
      '1/2 cup frozen mango',
      '1/2 cup spinach',
      '1 cup almond milk',
      '2 tbsp protein powder (plant-based)',
      'Toppings: granola, berries, coconut flakes'
    ],
    calories: '~250-300 kcal'
  },
  'breakfast_egg_avocado_toast': {
    name: 'Egg and Avocado Toast',
    description: 'Protein-rich breakfast with healthy fats and whole grains.',
    ingredients: [
      '2 slices whole grain bread',
      '2 large eggs',
      '1/2 avocado',
      '1/4 cup cherry tomatoes',
      'Salt and pepper to taste',
      '1 tsp olive oil'
    ],
    calories: '~400-450 kcal'
  },

  // Lunch Meals
  'lunch_quinoa_chicken_bowl': {
    name: 'Quinoa Chicken Bowl',
    description: 'Balanced lunch with lean protein, complex carbs, and vegetables.',
    ingredients: [
      '1/2 cup cooked quinoa',
      '4 oz grilled chicken breast',
      '1 cup mixed vegetables (broccoli, carrots, bell peppers)',
      '1/4 cup chickpeas',
      '2 tbsp olive oil',
      'Lemon juice and herbs for seasoning'
    ],
    calories: '~450-500 kcal'
  },
  'lunch_vegan_buddha_bowl': {
    name: 'Vegan Buddha Bowl',
    description: 'Plant-based lunch with protein from legumes and healthy fats.',
    ingredients: [
      '1/2 cup brown rice',
      '1/2 cup black beans',
      '1 cup roasted sweet potato',
      '1 cup kale',
      '1/4 avocado',
      '2 tbsp tahini dressing'
    ],
    calories: '~400-450 kcal'
  },
  'lunch_mediterranean_salad': {
    name: 'Mediterranean Salad',
    description: 'Fresh and light lunch with Mediterranean flavors.',
    ingredients: [
      '2 cups mixed greens',
      '1/2 cup cherry tomatoes',
      '1/4 cup cucumber',
      '1/4 cup olives',
      '2 oz feta cheese',
      '2 tbsp olive oil and balsamic vinegar'
    ],
    calories: '~300-350 kcal'
  },
  'lunch_turkey_wrap': {
    name: 'Turkey and Hummus Wrap',
    description: 'Protein-packed wrap with fiber and healthy fats.',
    ingredients: [
      '1 whole grain tortilla',
      '3 oz turkey breast',
      '2 tbsp hummus',
      '1/4 cup shredded carrots',
      '1/4 cup spinach',
      '1/4 cup bell peppers'
    ],
    calories: '~350-400 kcal'
  },

  // Dinner Meals
  'dinner_salmon_vegetables': {
    name: 'Baked Salmon with Roasted Vegetables',
    description: 'Omega-3 rich dinner with lean protein and fiber.',
    ingredients: [
      '5 oz salmon fillet',
      '1 cup roasted vegetables (asparagus, zucchini, bell peppers)',
      '1/2 cup quinoa',
      '1 tbsp olive oil',
      'Lemon, garlic, and herbs for seasoning'
    ],
    calories: '~500-550 kcal'
  },
  'dinner_vegan_lentil_curry': {
    name: 'Vegan Lentil Curry',
    description: 'Plant-based dinner rich in protein and fiber.',
    ingredients: [
      '1/2 cup red lentils',
      '1 cup coconut milk',
      '1 cup mixed vegetables',
      '1/2 cup brown rice',
      'Curry spices (turmeric, cumin, coriander)',
      'Fresh cilantro for garnish'
    ],
    calories: '~450-500 kcal'
  },
  'dinner_lean_beef_stir_fry': {
    name: 'Lean Beef Stir Fry',
    description: 'High-protein dinner with vegetables and complex carbs.',
    ingredients: [
      '4 oz lean beef strips',
      '1 cup mixed vegetables (broccoli, carrots, snap peas)',
      '1/2 cup brown rice',
      '2 tbsp low-sodium soy sauce',
      '1 tbsp sesame oil',
      'Ginger and garlic for flavor'
    ],
    calories: '~500-550 kcal'
  },
  'dinner_vegetarian_pasta': {
    name: 'Vegetarian Pasta Primavera',
    description: 'Light vegetarian dinner with whole grain pasta.',
    ingredients: [
      '1 cup whole grain pasta',
      '1 cup mixed vegetables',
      '2 tbsp olive oil',
      '1/4 cup parmesan cheese',
      'Fresh basil and garlic',
      'Lemon juice for brightness'
    ],
    calories: '~400-450 kcal'
  },

  // Snack Meals
  'snack_apple_nuts': {
    name: 'Apple with Almond Butter',
    description: 'Fiber-rich snack with healthy fats and protein.',
    ingredients: [
      '1 medium apple',
      '2 tbsp almond butter',
      '1 tbsp chopped almonds',
      'Sprinkle of cinnamon'
    ],
    calories: '~200-250 kcal'
  },
  'snack_greek_yogurt_berries': {
    name: 'Greek Yogurt with Berries',
    description: 'Protein-rich snack with antioxidants.',
    ingredients: [
      '1/2 cup Greek yogurt',
      '1/4 cup mixed berries',
      '1 tbsp honey',
      '1 tbsp granola'
    ],
    calories: '~150-200 kcal'
  },
  'snack_vegan_hummus_veggies': {
    name: 'Hummus with Vegetables',
    description: 'Plant-based snack with protein and fiber.',
    ingredients: [
      '1/4 cup hummus',
      '1 cup mixed vegetables (carrots, celery, bell peppers)',
      '1/4 cup whole grain crackers'
    ],
    calories: '~200-250 kcal'
  },
  'snack_protein_smoothie': {
    name: 'Protein Smoothie',
    description: 'Quick protein boost with fruits and healthy fats.',
    ingredients: [
      '1 scoop protein powder',
      '1 cup almond milk',
      '1/2 banana',
      '1 tbsp peanut butter',
      '1 tbsp chia seeds'
    ],
    calories: '~250-300 kcal'
  }
};

// Predefined daily meal plans
export const PREDEFINED_MEAL_PLANS: Record<string, DailyMealPlan> = {
  // Weight Loss Plans
  'day_1_loseWeight_omnivore': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_greek_yogurt_bowl'],
    lunch: PREDEFINED_MEALS['lunch_mediterranean_salad'],
    dinner: PREDEFINED_MEALS['dinner_salmon_vegetables'],
    snack1: PREDEFINED_MEALS['snack_apple_nuts'],
    snack2: PREDEFINED_MEALS['snack_greek_yogurt_berries']
  },
  'day_1_loseWeight_vegetarian': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_oatmeal_berries'],
    lunch: PREDEFINED_MEALS['lunch_vegan_buddha_bowl'],
    dinner: PREDEFINED_MEALS['dinner_vegetarian_pasta'],
    snack1: PREDEFINED_MEALS['snack_vegan_hummus_veggies'],
    snack2: PREDEFINED_MEALS['snack_greek_yogurt_berries']
  },
  'day_1_loseWeight_vegan': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_vegan_smoothie_bowl'],
    lunch: PREDEFINED_MEALS['lunch_vegan_buddha_bowl'],
    dinner: PREDEFINED_MEALS['dinner_vegan_lentil_curry'],
    snack1: PREDEFINED_MEALS['snack_vegan_hummus_veggies'],
    snack2: PREDEFINED_MEALS['snack_apple_nuts']
  },

  // Weight Maintenance Plans
  'day_1_maintainWeight_omnivore': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_egg_avocado_toast'],
    lunch: PREDEFINED_MEALS['lunch_quinoa_chicken_bowl'],
    dinner: PREDEFINED_MEALS['dinner_lean_beef_stir_fry'],
    snack1: PREDEFINED_MEALS['snack_protein_smoothie'],
    snack2: PREDEFINED_MEALS['snack_greek_yogurt_berries']
  },
  'day_1_maintainWeight_vegetarian': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_oatmeal_berries'],
    lunch: PREDEFINED_MEALS['lunch_mediterranean_salad'],
    dinner: PREDEFINED_MEALS['dinner_vegetarian_pasta'],
    snack1: PREDEFINED_MEALS['snack_vegan_hummus_veggies'],
    snack2: PREDEFINED_MEALS['snack_protein_smoothie']
  },
  'day_1_maintainWeight_vegan': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_vegan_smoothie_bowl'],
    lunch: PREDEFINED_MEALS['lunch_vegan_buddha_bowl'],
    dinner: PREDEFINED_MEALS['dinner_vegan_lentil_curry'],
    snack1: PREDEFINED_MEALS['snack_vegan_hummus_veggies'],
    snack2: PREDEFINED_MEALS['snack_apple_nuts']
  },

  // Muscle Gain Plans
  'day_1_gainMuscle_omnivore': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_egg_avocado_toast'],
    lunch: PREDEFINED_MEALS['lunch_quinoa_chicken_bowl'],
    dinner: PREDEFINED_MEALS['dinner_salmon_vegetables'],
    snack1: PREDEFINED_MEALS['snack_protein_smoothie'],
    snack2: PREDEFINED_MEALS['snack_greek_yogurt_berries']
  },
  'day_1_gainMuscle_vegetarian': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_greek_yogurt_bowl'],
    lunch: PREDEFINED_MEALS['lunch_vegan_buddha_bowl'],
    dinner: PREDEFINED_MEALS['dinner_vegetarian_pasta'],
    snack1: PREDEFINED_MEALS['snack_protein_smoothie'],
    snack2: PREDEFINED_MEALS['snack_greek_yogurt_berries']
  },
  'day_1_gainMuscle_vegan': {
    day: 1,
    breakfast: PREDEFINED_MEALS['breakfast_vegan_smoothie_bowl'],
    lunch: PREDEFINED_MEALS['lunch_vegan_buddha_bowl'],
    dinner: PREDEFINED_MEALS['dinner_vegan_lentil_curry'],
    snack1: PREDEFINED_MEALS['snack_protein_smoothie'],
    snack2: PREDEFINED_MEALS['snack_vegan_hummus_veggies']
  }
};

// Helper function to get a meal plan by key
export const getPredefinedMealPlan = (
  day: number,
  goal: NutritionGoal,
  dietaryStyle: DietaryStyle
): DailyMealPlan | null => {
  const key = `day_${day}_${goal}_${dietaryStyle}`;
  return PREDEFINED_MEAL_PLANS[key] || null;
};

// Helper function to get a random meal plan for a given day/goal/dietary style
export const getRandomPredefinedMealPlan = (
  day: number,
  goal: NutritionGoal,
  dietaryStyle: DietaryStyle
): DailyMealPlan | null => {
  const availablePlans = Object.values(PREDEFINED_MEAL_PLANS).filter(
    plan => {
      // Filter by dietary style compatibility
      const isVeganCompatible = dietaryStyle === 'vegan' || 
        (plan.breakfast.name.includes('vegan') || plan.lunch.name.includes('vegan') || plan.dinner.name.includes('vegan'));
      const isVegetarianCompatible = dietaryStyle === 'vegetarian' || dietaryStyle === 'vegan' || 
        !plan.breakfast.name.includes('chicken') && !plan.lunch.name.includes('beef') && !plan.dinner.name.includes('salmon');
      
      return isVeganCompatible && isVegetarianCompatible;
    }
  );
  
  if (availablePlans.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availablePlans.length);
  const selectedPlan = availablePlans[randomIndex];
  
  // Create a new plan with the correct day
  return {
    ...selectedPlan,
    day: day,
  };
};

// Helper function to get a random meal for a specific meal type
export const getRandomMeal = (
  mealType: keyof Omit<DailyMealPlan, 'day'>,
  dietaryStyle: DietaryStyle
): Meal | null => {
  const availableMeals = Object.values(PREDEFINED_MEALS).filter(meal => {
    // Filter by meal type (breakfast, lunch, dinner, snack)
    const isCorrectType = meal.name.toLowerCase().includes(mealType) || 
      (mealType === 'snack1' || mealType === 'snack2') && meal.name.toLowerCase().includes('snack');
    
    // Filter by dietary style
    const isVeganCompatible = dietaryStyle === 'vegan' || 
      !meal.name.toLowerCase().includes('chicken') && 
      !meal.name.toLowerCase().includes('beef') && 
      !meal.name.toLowerCase().includes('turkey') && 
      !meal.name.toLowerCase().includes('salmon') && 
      !meal.name.toLowerCase().includes('egg') && 
      !meal.name.toLowerCase().includes('yogurt') && 
      !meal.name.toLowerCase().includes('cheese');
    
    const isVegetarianCompatible = dietaryStyle === 'vegetarian' || dietaryStyle === 'vegan' || 
      !meal.name.toLowerCase().includes('chicken') && 
      !meal.name.toLowerCase().includes('beef') && 
      !meal.name.toLowerCase().includes('turkey') && 
      !meal.name.toLowerCase().includes('salmon');
    
    return isCorrectType && isVeganCompatible && isVegetarianCompatible;
  });
  
  if (availableMeals.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableMeals.length);
  return availableMeals[randomIndex];
};

// Calorie targets for different goals
export const CALORIE_TARGETS = {
  loseWeight: {
    daily: 1500,
    breakfast: 300,
    lunch: 400,
    dinner: 500,
    snack1: 150,
    snack2: 150
  },
  maintainWeight: {
    daily: 2000,
    breakfast: 400,
    lunch: 500,
    dinner: 600,
    snack1: 200,
    snack2: 200
  },
  gainMuscle: {
    daily: 2500,
    breakfast: 500,
    lunch: 600,
    dinner: 700,
    snack1: 250,
    snack2: 250
  }
};

// Macro ratios for different goals
export const MACRO_RATIOS = {
  loseWeight: {
    protein: 0.3, // 30%
    carbs: 0.4,   // 40%
    fats: 0.3     // 30%
  },
  maintainWeight: {
    protein: 0.25, // 25%
    carbs: 0.45,   // 45%
    fats: 0.3      // 30%
  },
  gainMuscle: {
    protein: 0.3, // 30%
    carbs: 0.5,   // 50%
    fats: 0.2     // 20%
  }
}; 