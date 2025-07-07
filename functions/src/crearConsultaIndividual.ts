import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";
import { Route } from "react-router-dom";
import PruebaConsultas from "./path/to/PruebaConsultas"; // Asegúrate de importar el componente correctamente

const paypalClientId = defineSecret("PAYPAL_CLIENT_ID");
const paypalClientSecret = defineSecret("PAYPAL_CLIENT_SECRET");
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";
const SESSION_PRICE = 15; // USD

export const crearConsultaIndividual = onRequest(
  {
    secrets: [paypalClientId, paypalClientSecret],
    cors: true,
    maxInstances: 5,
  },
  async (request, response) => {
    try {
      // CORS headers
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

      const { userId, email, nombre, tipoSesion, fecha } = request.body;
      
      // Validar datos obligatorios
      if (!userId || !email || !tipoSesion || !fecha) {
        logger.error("Faltan datos obligatorios:", { userId, email, tipoSesion, fecha });
        return response.status(400).json({ error: "Faltan datos obligatorios" });
      }

      logger.info("Creando consulta individual:", { userId, email, tipoSesion, fecha });

      // 1. Crear documento en Firestore
      const consultaRef = admin.firestore().collection("consultas").doc();
      await consultaRef.set({
        userId,
        email,
        nombre: nombre || "Usuario",
        tipoSesion,
        fecha: admin.firestore.Timestamp.fromDate(new Date(fecha)),
        estado: "pendiente",
        meetUrl: "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paypalOrderId: "",
      });

      logger.info("Documento de consulta creado:", { consultaId: consultaRef.id });

      // 2. Obtener token de PayPal
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
      logger.info("Token de PayPal obtenido exitosamente");

      // 3. Crear orden de PayPal
      const orderPayload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: SESSION_PRICE.toString(),
            },
            description: `Consulta 1:1 (${tipoSesion}) - FortiMind`,
            custom_id: consultaRef.id,
          },
        ],
        application_context: {
          brand_name: "FortiMind",
          user_action: "PAY_NOW",
          return_url: `${process.env.FUNCTIONS_EMULATOR ? 'http://localhost:3000' : 'https://fortimind.com'}/consultas/success`,
          cancel_url: `${process.env.FUNCTIONS_EMULATOR ? 'http://localhost:3000' : 'https://fortimind.com'}/consultas/cancel`,
        },
      };

      const orderResponse = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        orderPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      logger.info("Orden de PayPal creada:", { orderId: orderResponse.data.id });

      // 4. Actualizar documento con el ID de PayPal
      await consultaRef.update({ 
        paypalOrderId: orderResponse.data.id 
      });

      // 5. Retornar link de aprobación
      const approvalUrl = orderResponse.data.links.find((link: any) => link.rel === "approve")?.href;
      
      if (!approvalUrl) {
        throw new Error("No se encontró URL de aprobación de PayPal");
      }

      logger.info("Consulta creada exitosamente:", { consultaId: consultaRef.id, approvalUrl });

      response.json({ 
        success: true,
        consultaId: consultaRef.id,
        approvalUrl 
      });

    } catch (error) {
      logger.error("Error creando consulta individual:", error);
      response.status(500).json({ 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }
);

// Agrega la ruta para PruebaConsultas
<Route path="/prueba-consultas" element={<PruebaConsultas />} />