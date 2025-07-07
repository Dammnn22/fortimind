import { AIPersona } from '../types';
import { getGeminiAdvice } from './geminiService';
// Assuming translations are accessible or passed if needed for error messages directly from here.
// For simplicity, error messages from moderationService can be generic, and UI can use t() for user-facing text.

export interface ModerationResult {
  isSafe: boolean;
  reasons?: string[]; // Categories of violation if not safe
  error?: string; // If moderation itself failed
}

/**
 * Checks the safety of a given text message using Gemini API.
 * @param text The text message to check.
 * @param currentLanguage The current language for potential error messages or if Gemini needs it.
 * @returns A Promise resolving to a ModerationResult.
 */
export const checkMessageSafety = async (text: string, currentLanguage: string): Promise<ModerationResult> => {
  if (!text.trim()) {
    return { isSafe: true }; // Empty messages are considered safe
  }

  const rawResponse = await getGeminiAdvice(text, AIPersona.CONTENT_MODERATOR, currentLanguage);

  if (!rawResponse) {
    return { isSafe: false, error: "Moderation service unavailable." };
  }
  
  // Handle cases where Gemini might return an error string instead of JSON
  if (rawResponse.startsWith("Error de Gemini:") || rawResponse.startsWith("Ocurrió un error inesperado")) {
      console.error("Moderation API error:", rawResponse);
      return { isSafe: false, error: "Moderation system error: Could not evaluate content."};
  }
  
  try {
    let cleanJsonString = rawResponse.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
        cleanJsonString = match[2].trim();
    }
    
    const result = JSON.parse(cleanJsonString);
    if (typeof result.isSafe === 'boolean') {
      return {
        isSafe: result.isSafe,
        reasons: result.reasons || [],
      };
    } else {
      // Malformed JSON from Gemini
      console.error("Moderation response malformed JSON:", cleanJsonString);
      return { isSafe: false, error: "Moderation system error: Invalid response format.", reasons: ["Invalid Format"] };
    }
  } catch (e) {
    console.error("Failed to parse moderation JSON:", e, "Raw response:", rawResponse);
    return { isSafe: false, error: "Moderation system error: Could not parse response.", reasons: ["Parsing Error"] };
  }
};
