import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";

const paypalClientId = defineSecret("PAYPAL_CLIENT_ID");
const paypalClientSecret = defineSecret("PAYPAL_CLIENT_SECRET");
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Handle PayPal success return
export const paypalConsultationSuccess = onRequest(
  {
    secrets: [paypalClientId, paypalClientSecret],
    cors: true,
    timeoutSeconds: 60,
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

      const { token: paypalOrderId, PayerID: payerId } = request.query;
      
      if (!paypalOrderId || !payerId) {
        logger.warn('Missing PayPal parameters in success return', { paypalOrderId, payerId });
        response.redirect(`${getBaseUrl(request)}/consultas?error=parametros_faltantes`);
        return;
      }

      logger.info('Processing PayPal consultation payment', { paypalOrderId, payerId });

      // Get PayPal access token
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

      // Capture the PayPal order
      const captureResponse = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      const captureData = captureResponse.data;
      logger.info('PayPal order captured successfully', { 
        orderId: paypalOrderId, 
        captureId: captureData.id,
        status: captureData.status 
      });

      // Find the consultation by PayPal order ID
      const consultasQuery = await db.collection('consultas')
        .where('paypalOrderId', '==', paypalOrderId)
        .limit(1)
        .get();

      if (consultasQuery.empty) {
        logger.warn(`No consultation found for PayPal order: ${paypalOrderId}`);
        response.redirect(`${getBaseUrl(request)}/consultas?error=consulta_no_encontrada`);
        return;
      }

      const consultaDoc = consultasQuery.docs[0];
      const consultaData = consultaDoc.data();
      const consultaId = consultaDoc.id;

      // Generate video call link
      const meetUrl = generateVideoCallLink(consultaId, consultaData.tipoSesion);

      // Update consultation with payment confirmation
      await consultaDoc.ref.update({
        estado: 'confirmado',
        meetUrl,
        paypalCaptureId: captureData.id,
        paypalPayerId: payerId,
        pagoCompletadoAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send notification to admin
      await notifyAdminNewConsultation(consultaId, consultaData);

      // Redirect to success page
      response.redirect(`${getBaseUrl(request)}/consultas/confirmacion?id=${consultaId}`);

    } catch (error) {
      logger.error('Error processing PayPal consultation success:', error);
      const baseUrl = getBaseUrl(request);
      response.redirect(`${baseUrl}/consultas?error=error_procesamiento`);
    }
  }
);

// Handle PayPal cancel return
export const paypalConsultationCancel = onRequest(
  {
    cors: true,
  },
  async (request, response) => {
    try {
      const { token: paypalOrderId } = request.query;
      
      logger.info('PayPal consultation payment cancelled', { paypalOrderId });

      if (paypalOrderId) {
        // Find and update the consultation status
        const consultasQuery = await db.collection('consultas')
          .where('paypalOrderId', '==', paypalOrderId)
          .limit(1)
          .get();

        if (!consultasQuery.empty) {
          const consultaDoc = consultasQuery.docs[0];
          await consultaDoc.ref.update({
            estado: 'cancelado',
            canceladoAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          logger.info(`Consultation marked as cancelled: ${consultaDoc.id}`);
        }
      }

      // Redirect to consultations page with cancellation message
      const baseUrl = getBaseUrl(request);
      response.redirect(`${baseUrl}/consultas?cancelled=true`);

    } catch (error) {
      logger.error('Error processing PayPal consultation cancellation:', error);
      const baseUrl = getBaseUrl(request);
      response.redirect(`${baseUrl}/consultas?error=error_cancelacion`);
    }
  }
);

// Helper functions
function getBaseUrl(request: any): string {
  const isDevelopment = process.env.FUNCTIONS_EMULATOR === 'true';
  return isDevelopment ? 'http://localhost:3000' : 'https://fortimind.com';
}

function generateVideoCallLink(consultaId: string, tipoSesion: string): string {
  // In production, this would integrate with Google Meet, Zoom, or similar
  // For now, we'll generate a mock link that could be replaced with real integration
  const meetingId = consultaId.substring(0, 8);
  const sessionType = tipoSesion.toLowerCase().replace(/\s+/g, '-');
  return `https://meet.google.com/${meetingId}-consultation-${sessionType}`;
}

async function notifyAdminNewConsultation(consultaId: string, consultaData: any) {
  try {
    const adminNotificationRef = db.collection('admin_notifications').doc();
    
    await adminNotificationRef.set({
      tipo: 'nueva_consulta',
      consultaId,
      userId: consultaData.userId,
      tipoSesion: consultaData.tipoSesion,
      fecha: consultaData.fecha,
      clienteNombre: consultaData.nombre,
      clienteEmail: consultaData.email,
      precio: consultaData.precio || 15,
      estado: 'sin_leer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      mensaje: `Nueva consulta de ${consultaData.tipoSesion} confirmada para ${consultaData.nombre}`
    });

    // Update admin metrics
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];
    const metricsRef = db.collection('admin_metrics').doc(dateKey);
    
    await metricsRef.set({
      fecha: admin.firestore.Timestamp.fromDate(today),
      consultasNuevas: admin.firestore.FieldValue.increment(1),
      ingresoConsultas: admin.firestore.FieldValue.increment(consultaData.precio || 15),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    logger.info(`Admin notification sent for consultation: ${consultaId}`);
  } catch (error) {
    logger.error('Error sending admin notification:', error);
  }
}
