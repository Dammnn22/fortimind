// AI Service for Firebase Functions
// Este archivo proporciona funciones simples para llamar a las Firebase Functions desplegadas

const DEEPSEEK_FIREBASE_URL = "https://us-central1-fortimind.cloudfunctions.net/callDeepSeek";
const GEMINI_FIREBASE_URL = "https://us-central1-fortimind.cloudfunctions.net/callGemini";

// Función para llamar a DeepSeek Firebase Function
export const callDeepSeek = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(DEEPSEEK_FIREBASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek Error:", errorData);
      throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("Respuesta de DeepSeek:", data);
    
    // Extraer el contenido de la respuesta
    if (data.result && data.result.choices && data.result.choices.length > 0) {
      return data.result.choices[0].message.content;
    }
    
    return "No se pudo obtener una respuesta de DeepSeek.";
  } catch (error) {
    console.error("Error llamando a DeepSeek:", error);
    return "Error al comunicarse con DeepSeek. Por favor, intenta de nuevo.";
  }
};

// Función para llamar a Gemini Firebase Function
export const callGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(GEMINI_FIREBASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini Error:", errorData);
      throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("Respuesta de Gemini:", data);
    
    // Extraer el texto de la respuesta
    if (data.result && data.result.candidates && data.result.candidates.length > 0) {
      const parts = data.result.candidates[0].content.parts;
      if (parts && parts.length > 0) {
        const text = parts[0].text;
        if (text) {
          return text;
        }
      }
    }
    
    return "No se pudo obtener una respuesta de Gemini.";
  } catch (error) {
    console.error("Error llamando a Gemini:", error);
    return "Error al comunicarse con Gemini. Por favor, intenta de nuevo.";
  }
};

// Función de conveniencia para probar ambas APIs
export const testAIServices = async (prompt: string): Promise<{ deepseek: string; gemini: string }> => {
  const [deepseekResponse, geminiResponse] = await Promise.allSettled([
    callDeepSeek(prompt),
    callGemini(prompt)
  ]);

  return {
    deepseek: deepseekResponse.status === 'fulfilled' ? deepseekResponse.value : 'Error en DeepSeek',
    gemini: geminiResponse.status === 'fulfilled' ? geminiResponse.value : 'Error en Gemini'
  };
}; 