import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import axios from "axios";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define secrets for API keys
const deepseekApiKey = defineSecret("DEEPSEEK_API_KEY");
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const paypalClientId = defineSecret("PAYPAL_CLIENT_ID");
const paypalClientSecret = defineSecret("PAYPAL_CLIENT_SECRET");

// PayPal API configuration (FORZAR SANDBOX PARA PRUEBAS)
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// DeepSeek AI Function
export const callDeepSeek = onRequest(
  {
    secrets: [deepseekApiKey],
    cors: true,
  },
  async (request, response) => {
    // ... (código de la función callDeepSeek)
  }
);

// Gemini AI Function
export const callGemini = onRequest(
  {
    secrets: [geminiApiKey],
    cors: true,
  },
  async (request, response) => {
    // ... (código de la función callGemini)
  }
);

// PayPal Subscription Functions
// Define PayPal plan IDs (ACTUALIZADOS - SANDBOX)
const PAYPAL_PLAN_IDS = {
  premium_monthly: "P-6LG6825998894721SNBU3NVQ",
  premium_yearly: "P-0LT85457VK498443GNBU3OGI",
};

export const createPayPalSubscription = onRequest(
  {
    secrets: [paypalClientId, paypalClientSecret],
    cors: true,
  },
  async (request, response) => {
    try {
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }
      if (request.method !== "POST") {
        response.status(405).json({ error: "Method not allowed" });
        return;
      }

      const { userId, planType = "monthly" } = request.body;
      if (!userId) {
        response.status(400).json({ error: "userId is required" });
        return;
      }

      const planKey = planType === "yearly" ? "premium_yearly" : "premium_monthly";
      const planId = PAYPAL_PLAN_IDS[planKey];

      const authResponse = await axios.post(
        `${PAYPAL_BASE_URL}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(`${paypalClientId.value()}:${paypalClientSecret.value()}`).toString("base64")}`,
          },
        }
      );
      const accessToken = authResponse.data.access_token;

      const subscriptionPayload = {
        plan_id: planId,
        application_context: {
          return_url: "https://fortimind.com/subscription/success",
          cancel_url: "https://fortimind.com/subscription/cancel",
        },
      };

      const subscriptionResponse = await axios.post(
        `${PAYPAL_BASE_URL}/v1/billing/subscriptions`,
        subscriptionPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      response.json({ approvalUrl: subscriptionResponse.data.links[0].href });
    } catch (error) {
      logger.error("Error creating PayPal subscription:", error);
      response.status(500).json({ error: "Failed to create subscription" });
    }
  }
);

// Función para actualizar el estado de suscripción
export const updateSubscriptionStatus = onRequest(
  {
    cors: true,
  },
  async (request, response) => {
    try {
      response.set("Access-Control-Allow-Origin", "*");
      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }
      if (request.method !== "POST") {
        response.status(405).json({ error: "Method not allowed" });
        return;
      }

      const { userId, subscriptionId, status, planType } = request.body;
      if (!userId || !subscriptionId || !status) {
        response.status(400).json({ error: "Missing required fields" });
        return;
      }

      await admin.firestore().collection("subscriptions").doc(subscriptionId).set({
        userId,
        status,
        planType,
      }, { merge: true });

      if (status === "approved") {
        await admin.firestore().collection("users").doc(userId).update({
          isPremium: true,
          subscriptionId,
        });
      }
      response.json({ success: true });
    } catch (error) {
      logger.error("Error updating subscription status:", error);
      response.status(500).json({ error: "Failed to update subscription status" });
    }
  }
);

export * from './crearConsultaIndividual';
