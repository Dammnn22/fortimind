import * as functions from "firebase-functions";

// Configuración de DeepSeek
const DEEPSEEK_API_KEY = functions.config().deepseek?.api_key;
const DEEPSEEK_MODEL_NAME = "deepseek-chat";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Obtiene consejos de DeepSeek AI
 */
export const getDeepSeekAdvice = async (
  prompt: string,
  persona: string = 'AI_MENTOR_DEFAULT',
  language: string = 'es'
): Promise<string | null> => {
  if (!DEEPSEEK_API_KEY) {
    console.warn("DeepSeek API key is not set in environment variables. DeepSeek features will be disabled.");
    return "Error: DeepSeek AI service is not available. Please check API key.";
  }

  try {
    const systemInstruction = getSystemInstructionForPersona(persona, language);
    
    const messages: DeepSeekMessage[] = [
      {
        role: "system",
        content: systemInstruction
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const requestPayload: DeepSeekRequest = {
      model: DEEPSEEK_MODEL_NAME,
      messages: messages,
      temperature: 0.3, // Lower temp for consistent JSON
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

    const data = await response.json() as DeepSeekResponse;
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      console.error('No choices in DeepSeek response:', data);
      return null;
    }

  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
};

/**
 * Obtiene la instrucción del sistema para cada persona de IA
 */
const getSystemInstructionForPersona = (persona: string, language: string = 'es'): string => {
  const commonIntro = language === 'es' 
    ? 'Eres un asistente de IA experto y amigable. Responde siempre en español de manera clara, útil y empática.'
    : 'You are an expert and friendly AI assistant. Always respond in English in a clear, helpful, and empathetic manner.';

  const BASE_MENTOR_STYLE_INSTRUCTION = language === 'es'
    ? 'Mantén un tono motivacional, positivo y profesional. Sé específico en tus consejos y siempre considera el contexto del usuario.'
    : 'Maintain a motivational, positive, and professional tone. Be specific in your advice and always consider the user\'s context.';

  switch (persona) {
    case 'NUTRITION_PLAN_GENERATOR':
      return `You are a world-class AI nutritionist. Your task is to generate meal plans or individual meals based on user profiles.
Respond ONLY with a valid JSON object. Do not include any other text, explanation, or markdown formatting like \`\`\`json.

The user prompt will specify the requirements for the meal plan.
Your response MUST be a single JSON object in the exact format specified in the prompt.

- All meals must be healthy, balanced, and use whole foods. Avoid ultra-processed ingredients.
- The plan must be varied and interesting.
- Strictly adhere to dietary requirements (vegan plans must not have animal products, etc.).
- Respect all allergies listed.
- Incorporate cultural preferences where possible.
- Calorie estimates should be appropriate for the user's goal.
- NO EXPLIQUES NADA, solo devuelve el JSON directamente.`;

    case 'WORKOUT_GENERATOR':
      return `You are a world-class fitness trainer. Your task is to generate workout routines based on user profiles.
Respond ONLY with a valid JSON object. Do not include any other text, explanation, or markdown formatting.

The user prompt will specify the requirements for the workout routine.
Your response MUST be a single JSON object in the exact format specified in the prompt.

- All exercises must be safe and appropriate for the user's fitness level.
- Routines must be varied and progressive.
- Consider the user's available equipment and location.
- Focus on proper form and technique.
- NO EXPLIQUES NADA, solo devuelve el JSON directamente.`;

    default:
      return `${commonIntro} Ofrece apoyo general y responde a las preguntas del usuario. ${BASE_MENTOR_STYLE_INSTRUCTION}`;
  }
}; 