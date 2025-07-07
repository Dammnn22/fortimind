import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import axios from "axios";

// Definir secretos
const DEEPSEEK_API_KEY = defineSecret("DEEPSEEK_API_KEY");
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// Función: callDeepSeek
export const callDeepSeek = onRequest(
  { secrets: [DEEPSEEK_API_KEY] },
  async (req, res) => {
    try {
      const prompt = req.body.prompt;
      const response = await axios.post(
        "https://api.deepseek.com/chat/completions",
        {
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env["DEEPSEEK_API_KEY"]}`,
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error: any) {
      logger.error("Error en callDeepSeek:", error.message);
      res.status(500).json({ error: "Error al llamar a DeepSeek" });
    }
  }
);

// Función: callGemini
export const callGemini = onRequest(
  { secrets: [GEMINI_API_KEY] },
  async (req, res) => {
    try {
      const prompt = req.body.prompt;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta3/models/gemini-pro:generateContent?key=${process.env["GEMINI_API_KEY"]}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      res.status(200).json(response.data);
    } catch (error: any) {
      logger.error("Error en callGemini:", error.message);
      res.status(500).json({ error: "Error al llamar a Gemini" });
    }
  }
); 