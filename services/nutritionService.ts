import { DailyMealPlan, Meal, UserNutritionChallenge, AIPersona, NutritionGoal, DietaryStyle } from '../types';
import { getDeepSeekAdvice } from './deepSeekService';
import { 
  saveMealPlan, 
  loadMealPlan,
  saveNutritionChallengeData,
  loadNutritionChallengeData
} from './challengeDataService';
import { 
  getPredefinedMealPlan, 
  getRandomPredefinedMealPlan,
  getRandomMeal,
  CALORIE_TARGETS,
  MACRO_RATIOS
} from '../data/nutritionPlans';

export const parseJsonResponse = <T>(jsonResponse: string | null): T | null => {
    if (!jsonResponse) {
        console.error("DeepSeek API returned no response.");
        return null;
    }

    // Check for standardized error message before parsing
    if (jsonResponse.startsWith("Error:")) {
        console.error("Received an error from DeepSeek service:", jsonResponse);
        return null;
    }

    console.log("Raw AI response:", jsonResponse);

    // Multiple parsing strategies
    const parsingStrategies = [
        // Strategy 1: Direct JSON parse
        () => {
            try {
                return JSON.parse(jsonResponse.trim());
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 2: Remove markdown code blocks
        () => {
            try {
                let jsonStr = jsonResponse.trim();
                // Remove ```json and ``` markers
                jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
                return JSON.parse(jsonStr);
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 3: Extract JSON using regex
        () => {
            try {
                const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                return null;
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 4: Extract array and get first element
        () => {
            try {
                const arrayMatch = jsonResponse.match(/\[[\s\S]*\]/);
                if (arrayMatch) {
                    const parsed = JSON.parse(arrayMatch[0]);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // If it's an array of weeks, get first day of first week
                        if (parsed[0]?.days && Array.isArray(parsed[0].days)) {
                            return parsed[0].days[0];
                        }
                        // If it's an array of days, get first day
                        return parsed[0];
                    }
                }
                return null;
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 5: Try to fix common JSON issues
        () => {
            try {
                let jsonStr = jsonResponse.trim();
                // Fix common issues
                jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas
                jsonStr = jsonStr.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
                jsonStr = jsonStr.replace(/\\"/g, '"'); // Fix escaped quotes
                return JSON.parse(jsonStr);
            } catch (e) {
                return null;
            }
        }
    ];

    // Try each strategy
    for (let i = 0; i < parsingStrategies.length; i++) {
        try {
            const result = parsingStrategies[i]();
            if (result) {
                console.log(`Successfully parsed JSON using strategy ${i + 1}`);
                return result as T;
            }
        } catch (e) {
            console.log(`Strategy ${i + 1} failed:`, e);
        }
    }

    console.error("All parsing strategies failed. Raw response:", jsonResponse);
    return null;
};

export const parseTextResponse = (textResponse: string | null): DailyMealPlan | null => {
    if (!textResponse) {
        console.error("DeepSeek API returned no response.");
        return null;
    }

    console.log("Raw AI response:", textResponse);
    console.log("Response length:", textResponse.length);
    console.log("Response type:", typeof textResponse);

    // Strategy 1: Try JSON parsing first (for backward compatibility)
    try {
        const jsonResult = parseJsonResponse<DailyMealPlan>(textResponse);
        if (jsonResult) {
            console.log("Successfully parsed as JSON");
            return jsonResult;
        }
    } catch (e) {
        console.log("JSON parsing failed, trying text parsing");
    }

    // Strategy 2: Parse structured text
    try {
        console.log("Attempting to parse as structured text...");
        const lines = textResponse.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log("Parsed lines:", lines);
        
        const mealPlan: DailyMealPlan = {
            day: 1,
            breakfast: { name: '', description: '', ingredients: [], calories: '' },
            lunch: { name: '', description: '', ingredients: [], calories: '' },
            dinner: { name: '', description: '', ingredients: [], calories: '' },
            snack1: { name: '', description: '', ingredients: [], calories: '' },
            snack2: { name: '', description: '', ingredients: [], calories: '' }
        };

        let currentMeal: keyof DailyMealPlan | null = null;
        let currentField: string | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            console.log(`Processing line ${i}: "${line}"`);
            
            // Extract day number
            const dayMatch = line.match(/DÍA\s+(\d+)/i);
            if (dayMatch) {
                mealPlan.day = parseInt(dayMatch[1]);
                console.log(`Found day: ${mealPlan.day}`);
                continue;
            }

            // Detect meal sections with more flexible patterns
            if (line.match(/^DESAYUNO/i) || line.match(/^BREAKFAST/i)) {
                currentMeal = 'breakfast';
                console.log(`Found breakfast section`);
                continue;
            }
            if (line.match(/^ALMUERZO/i) || line.match(/^LUNCH/i)) {
                currentMeal = 'lunch';
                console.log(`Found lunch section`);
                continue;
            }
            if (line.match(/^CENA/i) || line.match(/^DINNER/i)) {
                currentMeal = 'dinner';
                console.log(`Found dinner section`);
                continue;
            }
            if (line.match(/^SNACK\s*1/i) || line.match(/^SNACK1/i)) {
                currentMeal = 'snack1';
                console.log(`Found snack1 section`);
                continue;
            }
            if (line.match(/^SNACK\s*2/i) || line.match(/^SNACK2/i)) {
                currentMeal = 'snack2';
                console.log(`Found snack2 section`);
                continue;
            }

            // Parse meal fields with more flexible patterns
            if (currentMeal) {
                const meal = mealPlan[currentMeal] as any;
                
                // More flexible name matching
                if (line.match(/^Nombre:/i) || line.match(/^Name:/i)) {
                    meal.name = line.replace(/^Nombre:\s*/i, '').replace(/^Name:\s*/i, '').trim();
                    console.log(`Found name for ${currentMeal}: ${meal.name}`);
                } 
                // More flexible description matching
                else if (line.match(/^Descripción:/i) || line.match(/^Description:/i)) {
                    meal.description = line.replace(/^Descripción:\s*/i, '').replace(/^Description:\s*/i, '').trim();
                    console.log(`Found description for ${currentMeal}: ${meal.description}`);
                } 
                // More flexible ingredients matching
                else if (line.match(/^Ingredientes:/i) || line.match(/^Ingredients:/i)) {
                    const ingredientsStr = line.replace(/^Ingredientes:\s*/i, '').replace(/^Ingredients:\s*/i, '').trim();
                    meal.ingredients = ingredientsStr.split(',').map(i => i.trim()).filter(i => i.length > 0);
                    console.log(`Found ingredients for ${currentMeal}:`, meal.ingredients);
                } 
                // More flexible calories matching
                else if (line.match(/^Calorías:/i) || line.match(/^Calories:/i)) {
                    meal.calories = line.replace(/^Calorías:\s*/i, '').replace(/^Calories:\s*/i, '').trim();
                    console.log(`Found calories for ${currentMeal}: ${meal.calories}`);
                }
                // If line doesn't match any field but we're in a meal section, try to extract info
                else if (line.length > 0 && !line.match(/^[A-Z]/)) {
                    // This might be a continuation of the previous field
                    if (currentField === 'description' && meal.description) {
                        meal.description += ' ' + line;
                    }
                }
            }
        }

        console.log("Final parsed meal plan:", mealPlan);

        // Validate that we have at least the main meals
        if (mealPlan.breakfast.name && mealPlan.lunch.name && mealPlan.dinner.name) {
            console.log("Successfully parsed structured text");
            return mealPlan;
        } else {
            console.log("Missing required meals:", {
                breakfast: !!mealPlan.breakfast.name,
                lunch: !!mealPlan.lunch.name,
                dinner: !!mealPlan.dinner.name
            });
        }
    } catch (e) {
        console.error("Text parsing failed:", e);
    }

    // Strategy 3: Fallback - try to extract any meal information from the text
    try {
        console.log("Attempting fallback parsing...");
        
        // Create a basic meal plan with fallback data
        const mealPlan: DailyMealPlan = {
            day: 1,
            breakfast: { 
                name: 'Desayuno saludable', 
                description: 'Un desayuno nutritivo y equilibrado', 
                ingredients: ['Avena', 'Leche', 'Fruta'], 
                calories: '~300 kcal' 
            },
            lunch: { 
                name: 'Almuerzo balanceado', 
                description: 'Un almuerzo con proteínas y vegetales', 
                ingredients: ['Pollo', 'Arroz', 'Vegetales'], 
                calories: '~500 kcal' 
            },
            dinner: { 
                name: 'Cena ligera', 
                description: 'Una cena nutritiva y ligera', 
                ingredients: ['Pescado', 'Ensalada', 'Quinoa'], 
                calories: '~400 kcal' 
            },
            snack1: { 
                name: 'Snack saludable', 
                description: 'Un snack nutritivo', 
                ingredients: ['Nueces', 'Yogur'], 
                calories: '~200 kcal' 
            },
            snack2: { 
                name: 'Snack de la tarde', 
                description: 'Un snack energético', 
                ingredients: ['Fruta', 'Almendras'], 
                calories: '~150 kcal' 
            }
        };

        // Try to extract any meal names from the text
        const text = textResponse.toLowerCase();
        
        // Look for breakfast-related content
        if (text.includes('desayuno') || text.includes('breakfast')) {
            const breakfastMatch = textResponse.match(/(?:desayuno|breakfast)[:\s]*([^\n]+)/i);
            if (breakfastMatch) {
                mealPlan.breakfast.name = breakfastMatch[1].trim();
            }
        }
        
        // Look for lunch-related content
        if (text.includes('almuerzo') || text.includes('lunch')) {
            const lunchMatch = textResponse.match(/(?:almuerzo|lunch)[:\s]*([^\n]+)/i);
            if (lunchMatch) {
                mealPlan.lunch.name = lunchMatch[1].trim();
            }
        }
        
        // Look for dinner-related content
        if (text.includes('cena') || text.includes('dinner')) {
            const dinnerMatch = textResponse.match(/(?:cena|dinner)[:\s]*([^\n]+)/i);
            if (dinnerMatch) {
                mealPlan.dinner.name = dinnerMatch[1].trim();
            }
        }

        console.log("Fallback meal plan created:", mealPlan);
        return mealPlan;
        
    } catch (e) {
        console.error("Fallback parsing failed:", e);
    }

    console.error("All parsing strategies failed. Raw response:", textResponse);
    return null;
};

/**
 * Generates a full day's meal plan using the DeepSeek API.
 */
export const generateDailyMealPlan = async (
  profile: Pick<UserNutritionChallenge, 'goal' | 'dietaryStyle' | 'allergies' | 'preferences'>,
  day: number,
  userId?: string,
  language?: string
): Promise<DailyMealPlan | null> => {
    // First, try to load from Firestore if user ID is provided
    if (userId) {
        const savedMealPlan = await loadMealPlan(userId, day);
        if (savedMealPlan) {
            console.log(`Loaded saved meal plan for day ${day} from Firestore`);
            return savedMealPlan;
        }
    }

    // Try to get a predefined meal plan
    const predefinedPlan = getPredefinedMealPlan(day, profile.goal, profile.dietaryStyle);
    if (predefinedPlan) {
        console.log(`Using predefined meal plan for day ${day}, goal ${profile.goal}, style ${profile.dietaryStyle}`);
        
        // Save to Firestore if user ID is provided
        if (userId) {
            try {
                await saveMealPlan(userId, day, predefinedPlan);
            } catch (error) {
                console.error('Failed to save predefined meal plan to Firestore:', error);
            }
        }
        
        return predefinedPlan;
    }

    const calorieTarget = CALORIE_TARGETS[profile.goal];
    const macroRatios = MACRO_RATIOS[profile.goal];

    const prompt = `Eres un nutricionista experto. Genera un plan de nutrición para el día ${day}.

OBJETIVO: ${profile.goal}
ESTILO DIETÉTICO: ${profile.dietaryStyle}
ALERGIAS: ${profile.allergies || 'ninguna'}
PREFERENCIAS: ${profile.preferences || 'ninguna'}

RESPONDE con este formato exacto (sin explicaciones adicionales):

DÍA ${day}

DESAYUNO:
Nombre: [nombre del desayuno]
Descripción: [descripción breve]
Ingredientes: [ingrediente 1, ingrediente 2, ingrediente 3]
Calorías: ~XXX kcal

ALMUERZO:
Nombre: [nombre del almuerzo]
Descripción: [descripción breve]
Ingredientes: [ingrediente 1, ingrediente 2, ingrediente 3]
Calorías: ~XXX kcal

CENA:
Nombre: [nombre de la cena]
Descripción: [descripción breve]
Ingredientes: [ingrediente 1, ingrediente 2, ingrediente 3]
Calorías: ~XXX kcal

SNACK 1:
Nombre: [nombre del snack]
Descripción: [descripción breve]
Ingredientes: [ingrediente 1, ingrediente 2]
Calorías: ~XXX kcal

SNACK 2:
Nombre: [nombre del snack]
Descripción: [descripción breve]
Ingredientes: [ingrediente 1, ingrediente 2]
Calorías: ~XXX kcal

TOTAL CALORÍAS: ~XXXX kcal
MACRONUTRIENTES: proteínas XXg, carbohidratos XXg, grasas XXg`;

    const lang = language || 'es';
    const response = await getDeepSeekAdvice(prompt, AIPersona.NUTRITION_PLAN_GENERATOR, lang);
    
    // Use the robust text parser
    const parsedData = parseTextResponse(response);
    
    if (parsedData) {
      // Ensure the day is correct
      parsedData.day = day;
      
      // Validate the structure
      if (parsedData.breakfast && parsedData.lunch && parsedData.dinner) {
        // Save to Firestore if user ID is provided
        if (userId) {
          try {
            await saveMealPlan(userId, day, parsedData);
            console.log(`Generated and saved meal plan for day ${day}`);
          } catch (error) {
            console.error('Failed to save generated meal plan to Firestore:', error);
          }
        }
        
        return parsedData;
      } else {
        console.error('Parsed meal plan is missing required meals:', parsedData);
      }
    }
    
    // Fallback to predefined meal plan
    console.log('Using predefined meal plan as fallback');
    return getPredefinedMealPlan(day, profile.goal, profile.dietaryStyle);
};

/**
 * Generates a replacement for a single meal using the DeepSeek API.
 */
export const generateReplacementMeal = async (
  profile: Pick<UserNutritionChallenge, 'goal' | 'dietaryStyle' | 'allergies' | 'preferences'>,
  mealType: keyof Omit<DailyMealPlan, 'day'>,
  userId?: string,
  language?: string
): Promise<Meal | null> => {
    const calorieTarget = CALORIE_TARGETS[profile.goal];
    const mealCalorieTarget = calorieTarget[mealType as keyof typeof calorieTarget];
    const lang = language || 'es'; // Default to Spanish

    const prompt = `
MODE: 'replaceMeal'
PROFILE:
- Goal: ${profile.goal}
- Dietary Style: ${profile.dietaryStyle}
- Allergies: ${profile.allergies || 'none'}
- Preferences: ${profile.preferences || 'none'}
- Meal Type: ${mealType}
- Calorie Target: ${mealCalorieTarget} kcal

Please return a JSON object with the following structure in ${lang === 'es' ? 'Spanish' : 'English'}:
{
  "name": "${lang === 'es' ? 'Nombre de la comida' : 'Meal Name'}",
  "description": "${lang === 'es' ? 'Descripción breve de la comida' : 'Brief description of the meal'}",
  "ingredients": ["${lang === 'es' ? 'ingrediente 1' : 'ingredient 1'}", "${lang === 'es' ? 'ingrediente 2' : 'ingredient 2'}", "${lang === 'es' ? 'ingrediente 3' : 'ingredient 3'}"],
  "calories": "~XXX-XXX kcal"
}`;

    const jsonResponse = await getDeepSeekAdvice(prompt, AIPersona.NUTRITION_PLAN_GENERATOR, lang);
    const parsedData = parseJsonResponse<Meal>(jsonResponse);

    if (parsedData && parsedData.name && parsedData.ingredients) {
        return parsedData;
    } else {
        console.error("Parsed JSON for replacement meal is malformed:", parsedData);
        // Fallback to random predefined meal
        return getRandomMeal(mealType, profile.dietaryStyle);
    }
};

/**
 * Loads a meal plan for a specific day, trying Firestore first, then generating new one.
 * @param profile User nutrition profile.
 * @param day The current day of the challenge.
 * @param userId User ID for Firestore operations.
 * @param language Optional language for DeepSeek API.
 * @returns A `DailyMealPlan` object or `null` if an error occurs.
 */
export const loadOrGenerateMealPlan = async (
  profile: Pick<UserNutritionChallenge, 'goal' | 'dietaryStyle' | 'allergies' | 'preferences'>,
  day: number,
  userId: string,
  language?: string
): Promise<DailyMealPlan | null> => {
  try {
    // First try to load from Firestore
    const savedMealPlan = await loadMealPlan(userId, day);
    if (savedMealPlan) {
      return savedMealPlan;
    }

    // If not found, generate a new one
    return await generateDailyMealPlan(profile, day, userId, language);
  } catch (error) {
    console.error('Error in loadOrGenerateMealPlan:', error);
    // Final fallback
    return getRandomPredefinedMealPlan(day, profile.goal, profile.dietaryStyle);
  }
};

/**
 * Saves nutrition challenge data to Firestore.
 * @param userId User ID for Firestore operations.
 * @param challengeData The challenge data to save.
 */
export const saveNutritionChallenge = async (
  userId: string,
  challengeData: any
): Promise<void> => {
  try {
    await saveNutritionChallengeData(userId, challengeData);
  } catch (error) {
    console.error('Error saving nutrition challenge data:', error);
    throw error;
  }
};

/**
 * Loads nutrition challenge data from Firestore.
 * @param userId User ID for Firestore operations.
 * @returns The challenge data or null if not found.
 */
export const loadNutritionChallenge = async (
  userId: string
): Promise<any | null> => {
  try {
    return await loadNutritionChallengeData(userId);
  } catch (error) {
    console.error('Error loading nutrition challenge data:', error);
    return null;
  }
};

export const clearNutritionChallenge = async (
  userId: string
): Promise<void> => {
  try {
    // Usar la función existente de reset
    const { resetNutritionChallenge } = await import('./challengeDataService');
    await resetNutritionChallenge(userId);
    console.log('Nutrition challenge data cleared for user:', userId);
  } catch (error) {
    console.error('Error clearing nutrition challenge:', error);
    throw error;
  }
};

/**
 * Genera el siguiente día del reto nutricional con memoria contextual de días anteriores.
 * Solo genera el siguiente día si el anterior existe, manteniendo coherencia nutricional.
 */
export const generateNextDayMealPlan = async (
  userId: string,
  challengeId: string,
  profile: Pick<UserNutritionChallenge, 'goal' | 'dietaryStyle' | 'allergies' | 'preferences'>,
  language?: string
): Promise<DailyMealPlan | null> => {
  try {
    // 1. Determinar el día actual (siguiente al último generado)
    const lastGeneratedDay = await getLastGeneratedDay(userId, challengeId);
    const currentDay = lastGeneratedDay + 1;
    
    // 2. Verificar que el día anterior existe (excepto para el día 1)
    if (currentDay > 1) {
      const previousDay = await loadMealPlanFromChallenge(userId, challengeId, currentDay - 1);
      if (!previousDay) {
        console.error(`No se puede generar el día ${currentDay} porque el día ${currentDay - 1} no existe`);
        return null;
      }
    }
    
    // 3. Recuperar días anteriores para contexto (últimos 3 días para no saturar el prompt)
    const previousDays = await getPreviousDaysForContext(userId, challengeId, currentDay - 1, 3);
    
    // 4. Construir el prompt con memoria contextual
    const prompt = buildContextualNutritionPrompt(currentDay, previousDays, profile);
    
    // 5. Llamar a la IA
    const lang = language || 'es';
    const jsonResponse = await getDeepSeekAdvice(prompt, AIPersona.NUTRITION_PLAN_GENERATOR, lang);
    
    // 6. Limpiar y parsear la respuesta
    let parsedData: DailyMealPlan | null = null;
    if (jsonResponse && typeof jsonResponse === 'string') {
      let cleanResponse = jsonResponse.trim();
      
      // Si la respuesta es muy larga, fallback
      if (cleanResponse.length > 8000) {
        console.error('Respuesta de la IA demasiado larga, se usará fallback.');
        return getPredefinedMealPlan(currentDay, profile.goal, profile.dietaryStyle);
      }
      
      // Extraer solo el JSON usando regex
      const match = cleanResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          // Asegurar que el día sea correcto
          parsed.day = currentDay;
          parsedData = parsed;
        } catch (e) {
          console.error('Error al parsear el JSON extraído:', e, match[0]);
        }
      } else {
        console.error('No se encontró un JSON válido en la respuesta de la IA.');
      }
    }
    
    // 7. Si el parseo falló, usar fallback
    if (!parsedData) {
      console.log('Usando plan predefinido como fallback');
      return getPredefinedMealPlan(currentDay, profile.goal, profile.dietaryStyle);
    }
    
    // 8. Guardar el nuevo día en Firestore solo si es válido
    if (parsedData.breakfast && parsedData.lunch && parsedData.dinner) {
      await saveMealPlanToChallenge(userId, challengeId, currentDay, parsedData);
      console.log(`Plan del día ${currentDay} guardado exitosamente`);
      return parsedData;
    } else {
      console.error('Plan generado no tiene la estructura requerida');
      return getPredefinedMealPlan(currentDay, profile.goal, profile.dietaryStyle);
    }
    
  } catch (error) {
    console.error('Error generando el siguiente día del plan nutricional:', error);
    return null;
  }
};

/**
 * Obtiene el último día generado para un usuario y reto específico
 */
const getLastGeneratedDay = async (userId: string, challengeId: string): Promise<number> => {
  try {
    const days = await getAllGeneratedDays(userId, challengeId);
    return days.length > 0 ? Math.max(...days) : 0;
  } catch (error) {
    console.error('Error obteniendo el último día generado:', error);
    return 0;
  }
};

/**
 * Obtiene todos los días generados para un usuario y reto específico
 */
const getAllGeneratedDays = async (userId: string, challengeId: string): Promise<number[]> => {
  try {
    const { collection, doc, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const daysRef = collection(db, 'users', userId, 'nutritionChallenges', challengeId, 'days');
    const querySnapshot = await getDocs(daysRef);
    
    const days: number[] = [];
    querySnapshot.forEach((doc) => {
      const dayNumber = parseInt(doc.id.replace('day_', ''));
      if (!isNaN(dayNumber)) {
        days.push(dayNumber);
      }
    });
    
    return days.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error obteniendo días generados:', error);
    return [];
  }
};

/**
 * Carga un plan específico de un reto nutricional
 */
const loadMealPlanFromChallenge = async (
  userId: string, 
  challengeId: string, 
  day: number
): Promise<DailyMealPlan | null> => {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const docRef = doc(db, 'users', userId, 'nutritionChallenges', challengeId, 'days', `day_${day}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data as DailyMealPlan;
    }
    
    return null;
  } catch (error) {
    console.error('Error cargando plan del reto:', error);
    return null;
  }
};

/**
 * Obtiene los días anteriores para contexto (últimos N días)
 */
const getPreviousDaysForContext = async (
  userId: string, 
  challengeId: string, 
  lastDay: number, 
  maxDays: number = 3
): Promise<DailyMealPlan[]> => {
  const previousDays: DailyMealPlan[] = [];
  const startDay = Math.max(1, lastDay - maxDays + 1);
  
  for (let day = startDay; day <= lastDay; day++) {
    const plan = await loadMealPlanFromChallenge(userId, challengeId, day);
    if (plan) {
      previousDays.push(plan);
    }
  }
  
  return previousDays;
};

/**
 * Construye el prompt con memoria contextual de días anteriores
 */
const buildContextualNutritionPrompt = (
  currentDay: number, 
  previousDays: DailyMealPlan[], 
  profile: Pick<UserNutritionChallenge, 'goal' | 'dietaryStyle' | 'allergies' | 'preferences'>
): string => {
  let contextSection = '';
  
  if (previousDays.length > 0) {
    const resumenDias = previousDays.map((dia, idx) => {
      const dayNumber = dia.day || (previousDays.length - idx);
      return `Día ${dayNumber}:
Desayuno: ${dia.breakfast?.name || ''}
Almuerzo: ${dia.lunch?.name || ''}
Cena: ${dia.dinner?.name || ''}
Snacks: ${dia.snack1?.name || ''}, ${dia.snack2?.name || ''}`;
    }).join('\n\n');
    
    contextSection = `Estás generando un plan nutricional diario como parte de un reto de 30 días. Aquí tienes el historial de los días anteriores:

${resumenDias}

Tu tarea es generar el Día ${currentDay} del reto, con las siguientes comidas:
- Desayuno
- Almuerzo
- Cena
- Snack 1
- Snack 2

Cada comida debe incluir: nombre, descripción, ingredientes, calorías aproximadas.
NO repitas recetas recientes y mantén variedad nutricional.
Considera el perfil del usuario: objetivo ${profile.goal}, dieta ${profile.dietaryStyle}, alergias: ${profile.allergies || 'ninguna'}, preferencias: ${profile.preferences || 'ninguna'}.

Formato de salida: JSON válido como este:
{
  "day": ${currentDay},
  "breakfast": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "lunch": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "dinner": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack1": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack2": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "totalCalories": "~XXXX kcal",
  "macros": "proteínas XXg, carbohidratos XXg, grasas XXg"
}

NO EXPLIQUES NADA, solo devuelve el JSON directamente.`;
  } else {
    // Para el día 1, usar el prompt original sin contexto
    contextSection = `Genera un plan de nutrición en formato JSON para el día ${currentDay} (primer día del reto), que incluya:
- desayuno
- almuerzo
- cena
- snack1
- snack2
- calorías totales
- macros (proteínas, carbohidratos, grasas)

Considera el perfil del usuario: objetivo ${profile.goal}, dieta ${profile.dietaryStyle}, alergias: ${profile.allergies || 'ninguna'}, preferencias: ${profile.preferences || 'ninguna'}.

Devuelve SOLO un JSON válido como este:
{
  "day": ${currentDay},
  "breakfast": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "lunch": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "dinner": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack1": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack2": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "totalCalories": "~XXXX kcal",
  "macros": "proteínas XXg, carbohidratos XXg, grasas XXg"
}

NO EXPLIQUES NADA, solo devuelve el JSON directamente.`;
  }
  
  return contextSection;
};

/**
 * Guarda un plan específico en un reto nutricional
 */
const saveMealPlanToChallenge = async (
  userId: string, 
  challengeId: string, 
  day: number, 
  mealPlan: DailyMealPlan
): Promise<void> => {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const docRef = doc(db, 'users', userId, 'nutritionChallenges', challengeId, 'days', `day_${day}`);
    await setDoc(docRef, {
      ...mealPlan,
      userId,
      challengeId,
      day,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error guardando plan del reto:', error);
    throw error;
  }
};