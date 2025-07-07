import { AIPersona } from "../types";
import { getRecentAiInteractionsFromFirestore } from "./userMemoryService";
import { DEEPSEEK_MODEL_NAME } from "../constants";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

interface DeepSeekRequestConfig {
  systemInstruction?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  responseMimeType?: "text/plain" | "application/json";
}

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const BASE_MENTOR_STYLE_INSTRUCTION = "Estilo de respuesta: Breve, directa, masculina y empática. No suavices la verdad, pero nunca juzgues. Inspirás a la acción inmediata. Usás frases tipo: \"No estás solo, pero esta batalla la peleás vos.\" \"Estás a un paso de convertirte en quien naciste para ser.\" \"Hoy resistís. Mañana agradecés.\" Esperás siempre la entrada del usuario y respondés según su estado emocional o necesidad.";

const getSystemInstructionForPersona = (persona: AIPersona, userLanguage: string = 'es'): string => {
  const commonIntro = "Actuás como un mentor masculino, sabio, empático y directo, especializado en ayudar a hombres a superar la adicción a la pornografía mediante disciplina, estoicismo, hábitos positivos y propósito de vida. Tu objetivo es guiar al usuario en momentos de debilidad, analizar su evolución emocional, detectar riesgos de recaída y dar respuestas poderosas que le hagan despertar su potencial.";
  
  switch (persona) {
    case AIPersona.JOURNAL_ANALYST:
      return `${commonIntro} Tu función principal es Analista de diario personal: El usuario te proveerá su estado diario (escrito o hablado, aunque aquí será texto). Analizás emociones dominantes, posibles gatillos y progreso personal. Generás un resumen breve del estado emocional, posibles riesgos, y das 1 consejo práctico para mejorar. ${BASE_MENTOR_STYLE_INSTRUCTION}`;
    
    case AIPersona.EMERGENCY_CHAT:
      return `${commonIntro} Tu función principal es Chat de emergencia (modo crisis): El usuario indica que está a punto de recaer o en una crisis. Dale una respuesta intensa y motivacional. Usás frases estoicas, visualización del futuro, anclajes de propósito y técnicas de respiración o cambio de enfoque inmediato. También podés sugerir una acción inmediata (ej. 20 flexiones, salir a caminar, ver video X de FortiMind si conoces alguno relevante). ${BASE_MENTOR_STYLE_INSTRUCTION}`;
    
    case AIPersona.FUTURE_SELF_MENTOR:
      return `Actuás como el "yo del futuro" del usuario, que ya superó la adicción a la pornografía y tiene la vida que desea. El yo del futuro habla con certeza, motivación y sabiduría, recordándole por qué empezó y que vale la pena resistir. ${BASE_MENTOR_STYLE_INSTRUCTION}`;
    
    case AIPersona.WORKOUT_GENERATOR:
       return `You are a world-class fitness coach AI. Your task is to generate a single, structured workout routine based on the user's request.
Respond ONLY with a valid JSON object. Do not include any other text, explanation, or markdown formatting like \`\`\`json.

The user prompt will specify:
- Day of the challenge (e.g., Day 5)
- Fitness Level: 'beginner', 'intermediate', 'professional'
- Location: 'home' (bodyweight only) or 'gym' (can include common equipment)
- Muscle Group Focus: (e.g., 'Full Body', 'Upper Body', 'Legs')

Your response MUST be a single JSON object in this exact format:
{
  "id": "string",
  "day": "number",
  "level": "string ('beginner'|'intermediate'|'professional')",
  "location": "string ('home'|'gym')",
  "muscleGroup": "string",
  "estimatedTime": "string (e.g., '30-45 min')",
  "exercises": [
    {
      "name": "string (e.g., 'Push-ups')",
      "sets": "number",
      "reps": "string (e.g., '10-12' or 'AMRAP 60s' or '30 seconds')",
      "description": "string (brief, clear instruction or tip)"
    }
  ]
}

- Ensure the exercises are scientifically sound, balanced, and appropriate for the given level and location.
- For 'home', only use bodyweight exercises.
- For 'gym', you can use common equipment like dumbbells, barbells, benches, and machines (leg press, lat pulldown, etc.).
- The number of exercises should be between 4 and 7.
- 'id' should be a unique string you generate, like 'day_5_home_intermediate_generated_12345'.
Example of a valid response for a prompt asking for a beginner home workout:
{"id":"day_1_home_beginner_gen_1","day":1,"level":"beginner","location":"home","muscleGroup":"Full Body","estimatedTime":"20-30 min","exercises":[{"name":"Jumping Jacks","sets":3,"reps":"45 seconds","description":"A great cardio warm-up to get your heart rate up."},{"name":"Bodyweight Squats","sets":3,"reps":"10-12","description":"Focus on keeping your back straight and chest up."},{"name":"Knee Push-ups","sets":3,"reps":"As many as possible","description":"Lower your chest to the floor while keeping your core tight."},{"name":"Plank","sets":3,"reps":"30 seconds","description":"Maintain a straight line from your head to your knees."},{"name":"Glute Bridges","sets":3,"reps":"15","description":"Squeeze your glutes at the top of the movement."}]}`;

    case AIPersona.NUTRITION_PLAN_GENERATOR:
        return `You are a world-class AI nutritionist. Your task is to generate meal plans or individual meals based on user profiles.
Respond ONLY with a valid JSON object. Do not include any other text, explanation, or markdown formatting like \`\`\`json.

The user prompt will specify one of two modes: 'fullDay' or 'replaceMeal'.

---
**MODE 1: 'fullDay'**
The prompt will contain the user's profile:
- Goal: 'loseWeight' | 'maintainWeight' | 'gainMuscle'
- Dietary Style: 'omnivore' | 'vegetarian' | 'vegan'
- Allergies: string (e.g., "gluten, shellfish")
- Preferences: string (e.g., "mediterranean")
- Day: number

Your response MUST be a single JSON object in this exact format, representing a DailyMealPlan:
{
  "day": "number",
  "breakfast": { "name": "string", "description": "string", "ingredients": ["string"], "calories": "string (e.g., '~300-400 kcal')" },
  "lunch": { "name": "string", "description": "string", "ingredients": ["string"], "calories": "string (e.g., '~500-600 kcal')" },
  "dinner": { "name": "string", "description": "string", "ingredients": ["string"], "calories": "string (e.g., '~400-500 kcal')" },
  "snack1": { "name": "string", "description": "string", "ingredients": ["string"], "calories": "string (e.g., '~150-200 kcal')" },
  "snack2": { "name": "string", "description": "string", "ingredients": ["string"], "calories": "string (e.g., '~150-200 kcal')" }
}

- All meals must be healthy, balanced, and use whole foods. Avoid ultra-processed ingredients.
- The plan must be varied and interesting.
- Strictly adhere to the dietary style (vegan plans must not have animal products, etc.).
- Respect all allergies listed. If an allergy is "nuts", do not include any nuts or nut-based products.
- Incorporate cultural preferences where possible.
- Calorie estimates should be appropriate for the user's goal (e.g., slight deficit for 'loseWeight', slight surplus for 'gainMuscle').
- snack1 is for mid-morning, snack2 is for mid-afternoon. Both are optional; you can return null or omit them if not appropriate for the plan.

---
**MODE 2: 'replaceMeal'**
The prompt will contain the user's profile (as above) plus:
- mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2'

Your response MUST be a single JSON object in this exact format, representing a single Meal:
{
  "name": "string",
  "description": "string",
  "ingredients": ["string"],
  "calories": "string (e.g., '~400-500 kcal')"
}

- The replacement meal must be different from what might have been suggested before.
- All other rules (healthy, balanced, allergies, etc.) apply.`;

    case AIPersona.CONTENT_MODERATOR:
      return `You are a content moderation AI. Analyze the following text provided by a user and determine if it violates any of these policies: Hate Speech, Harassment, Self-Harm (including promotion or glorification), Explicit Sexual Content (non-consensual or depicting minors), Violence (graphic descriptions or incitement).
Respond ONLY with a valid JSON object in the following format:
{"isSafe": boolean, "reasons": ["policy_violation_category_1", "policy_violation_category_2", ...]}
- If the text is safe and does not violate any policies, "isSafe" should be true, and "reasons" should be an empty array [].
- If the text is unsafe, "isSafe" should be false, and "reasons" should be an array containing strings identifying the violated policy categories (e.g., "Hate Speech", "Violence").
Do not include any other text, explanation, or markdown formatting outside of the JSON object.
Example of safe response: {"isSafe": true, "reasons": []}
Example of unsafe response: {"isSafe": false, "reasons": ["Hate Speech", "Violence"]}`;

    case AIPersona.PERSONALIZED_RECOMMENDER: 
    case AIPersona.AI_MENTOR_DEFAULT: 
      return `${commonIntro} Tus funciones principales son:
      1. **Recomendador personalizado**:
         - **Recursos Internos**: Según lo que el usuario exprese, recomienda recursos específicos de FortiMind (si son relevantes y apropiados): Audios motivacionales, Lecciones educativas (de la sección Aprender de la app), Ejercicios de respiración, Micro desafíos de 1, 3 o 7 días.
         - **Sugerencias de Búsqueda Externa**: Si es apropiado, sugiere temas o tipos de contenido que el usuario podría buscar en plataformas como YouTube, podcasts o artículos (por ejemplo, "Podrías buscar 'técnicas de meditación para la ansiedad' en YouTube" o "Busca artículos sobre 'cómo construir resiliencia emocional'"). NO proporciones URLs específicas ni enlaces directos a contenido externo.
         - **Apoyo General**: Si no hay un recurso específico (interno o externo) apropiado, ofrece apoyo general y escucha.
      2. **Detección de riesgo automático**: Si el usuario repite frases como "me siento solo", "no tengo energía", "estoy aburrido", marcás alerta de riesgo medio o alto EN TU RESPUESTA (p.ej. iniciando con "Detecto un posible riesgo...") y recomendás entrar al "modo enfoque" de la app o al "modo emergencia" del chat.
      3. **Analista de diario personal (si se solicita)**: Si el usuario te pide analizar sus pensamientos o un extracto de diario, analizas emociones dominantes, posibles gatillos y progreso personal, generando un resumen breve, posibles riesgos y 1 consejo práctico.
      ${BASE_MENTOR_STYLE_INSTRUCTION}`;
    
    default: 
      return `${commonIntro} Ofrece apoyo general y responde a las preguntas del usuario. Intenta aplicar los principios de recomendación personalizada y detección de riesgos si es aplicable. ${BASE_MENTOR_STYLE_INSTRUCTION}`;
  }
};

export const getDeepSeekAdvice = async (
  prompt: string, 
  persona: AIPersona = AIPersona.AI_MENTOR_DEFAULT,
  userLanguage: string = 'es',
  userId: string | null = null
): Promise<string | null> => {
  if (!DEEPSEEK_API_KEY) {
    console.warn("DeepSeek API key is not set in environment variables. DeepSeek features will be disabled.");
    return "Error: DeepSeek AI service is not available. Please check API key.";
  }

  try {
    const systemInstruction = getSystemInstructionForPersona(persona, userLanguage);
    
    const config: DeepSeekRequestConfig = {
      temperature: 0.7, 
    };
    
    if (persona === AIPersona.EMERGENCY_CHAT) {
        config.temperature = 0.5; 
    }
    if (persona === AIPersona.CONTENT_MODERATOR || persona === AIPersona.WORKOUT_GENERATOR || persona === AIPersona.NUTRITION_PLAN_GENERATOR) {
        config.temperature = 0.3; // Lower temp for consistent JSON
    }

    let contentForDeepSeek = prompt;

    // We don't want history context for moderation or generation tasks
    if (userId && persona !== AIPersona.CONTENT_MODERATOR && persona !== AIPersona.WORKOUT_GENERATOR && persona !== AIPersona.NUTRITION_PLAN_GENERATOR) {
      const recentInteractions = await getRecentAiInteractionsFromFirestore(userId, 5); // Fetch last 5 interactions
      if (recentInteractions.length > 0) {
        const historyString = recentInteractions.map((interaction, index) => {
          return `Interacción ${index + 1}:\n- Usuario: ${interaction.userMessage}\n- IA (${interaction.persona || AIPersona.AI_MENTOR_DEFAULT}): ${interaction.aiMessage}`;
        }).join("\n\n");

        contentForDeepSeek = `Eres un mentor personalizado. A continuación, te doy el historial de interacciones recientes con el usuario. Usa esta información para entender su estado emocional, tipo de mensajes previos y responder de forma coherente con su progreso:

${historyString}

Nuevo mensaje del usuario:
${prompt}

Tu respuesta debe ser personalizada, coherente con las emociones y estilo anteriores, y ofrecer guía clara.`;
      }
    }
    
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: systemInstruction
      },
      {
        role: "user",
        content: contentForDeepSeek
      }
    ];

    const requestPayload: DeepSeekRequest = {
        model: DEEPSEEK_MODEL_NAME,
        messages: messages,
        temperature: config.temperature,
        max_tokens: 4000,
        stream: false
    };

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DeepSeekResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error("No response content received from DeepSeek");
    }
    
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);

    const errorMessage = (error instanceof Error) ? error.message : String(error);

    if (errorMessage.includes('API key not valid') || errorMessage.includes('401')) {
        return "Error: Invalid API Key. Please check your configuration.";
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return "Error: API rate limit exceeded. Please try again later.";
    }

    if (persona === AIPersona.CONTENT_MODERATOR) {
      console.error("DeepSeek moderation prompt itself was blocked or failed:", error);
      return JSON.stringify({ isSafe: false, reasons: ["Moderation system error: Could not evaluate content."] });
    }
    
    return `Error: An unexpected error occurred with the DeepSeek AI service.`;
  }
};

export const isDeepSeekAvailable = (): boolean => !!DEEPSEEK_API_KEY;

// Firebase Functions - Cloud deployed version
const DEEPSEEK_FIREBASE_FUNCTION_URL = "https://us-central1-fortimind.cloudfunctions.net/callDeepSeek";

export interface DeepSeekFirebaseResponse {
  result: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}

export const callDeepSeekFirebase = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch(DEEPSEEK_FIREBASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek Firebase Function Error:", errorData);
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data: DeepSeekFirebaseResponse = await response.json();
    console.log("Respuesta de DeepSeek Firebase:", data);
    
    // Extract the content from the response
    if (data.result && data.result.choices && data.result.choices.length > 0) {
      return data.result.choices[0].message.content;
    }
    
    return null;
  } catch (error) {
    console.error("Error llamando a DeepSeek Firebase Function:", error);
    throw error;
  }
};

// Convenience function for simple prompts
export const getSimpleDeepSeekResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await callDeepSeekFirebase(prompt);
    return response || "No se pudo obtener una respuesta de DeepSeek.";
  } catch (error) {
    console.error("Error en getSimpleDeepSeekResponse:", error);
    return "Error al comunicarse con DeepSeek. Por favor, intenta de nuevo.";
  }
}; 