import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Asegurarse de que Firebase Admin esté inicializado
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// Definimos las interfaces aquí para que la función sea autocontenida
interface UserActivity {
  userId: string;
  email?: string;
  activityCount: number;
  lastActive: Date;
  favoriteFeatures: string[];
}

interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  growthRate: number;
}

interface AdminMetrics {
  userMetrics: { totalUsers: number; activeUsers: number; newUsersThisWeek: number; premiumUsers: number; };
  contentMetrics: { exercisePrograms: number; nutritionChallenges: number; totalDaysGenerated: number; averageProgramLength: number; };
  aiMetrics: { totalAIRequests: number; aiRequestsLast7Days: number; aiRequestsLast24Hours: number; averageAIUsagePerUser: number; };
  activityMetrics: { topActiveUsers: UserActivity[]; dailyActiveUsers: number[]; popularFeatures: FeatureUsage[]; };
  alertMetrics: { totalAlerts: number; pendingAlerts: number; criticalAlerts: number; alertsByType: Record<string, number>; };
}

// La lógica de getComprehensiveMetrics ahora vive dentro de este archivo,
// adaptada para el SDK de Admin.
async function getComprehensiveMetricsForServer(): Promise<AdminMetrics> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Métricas de Usuario
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    const newUsersSnapshot = await db.collection('users').where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo)).get();
    const newUsersThisWeek = newUsersSnapshot.size;
    const premiumUsersSnapshot = await db.collection('user_subscriptions').where('status', '==', 'active').get();
    const premiumUsers = premiumUsersSnapshot.size;

    const activeUsersSnapshot = await db.collection('user_activity').where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)).get();
    const uniqueActiveUsers = new Set(activeUsersSnapshot.docs.map(doc => doc.data().userId));
    const activeUsers = uniqueActiveUsers.size;

    // Métricas de Contenido
    const exerciseProgramsSnapshot = await db.collection('exercise_programs').get();
    const nutritionChallengesSnapshot = await db.collection('nutrition_challenges').get();
    const exercisePrograms = exerciseProgramsSnapshot.size;
    const nutritionChallenges = nutritionChallengesSnapshot.size;
    let totalDays = 0;
    let programCount = 0;
    exerciseProgramsSnapshot.docs.forEach(doc => {
        if (doc.data().totalDays) {
            totalDays += doc.data().totalDays;
            programCount++;
        }
    });
    nutritionChallengesSnapshot.docs.forEach(doc => {
        if (doc.data().totalDays) {
            totalDays += doc.data().totalDays;
            programCount++;
        }
    });
    const averageProgramLength = programCount > 0 ? Math.round(totalDays / programCount) : 0;

    // Métricas de IA
    const aiActions = ['ai_chat', 'program_creation', 'challenge_creation', 'ai_advice'];
    const allAIQuery = await db.collection('user_activity').where('action', 'in', aiActions).get();
    const totalAIRequests = allAIQuery.size;
    const aiLast7DaysQuery = await db.collection('user_activity').where('action', 'in', aiActions).where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo)).get();
    const aiRequestsLast7Days = aiLast7DaysQuery.size;
    const aiLast24HoursQuery = await db.collection('user_activity').where('action', 'in', aiActions).where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)).get();
    const aiRequestsLast24Hours = aiLast24HoursQuery.size;
    const uniqueAIUsers = new Set(allAIQuery.docs.map(doc => doc.data().userId));
    const averageAIUsagePerUser = uniqueAIUsers.size > 0 ? Math.round(totalAIRequests / uniqueAIUsers.size) : 0;

    // Métricas de Actividad (simplificado para el servidor)
    const recentActivitySnapshot = await db.collection('user_activity').where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)).get();
    const activityMetrics = { topActiveUsers: [], dailyActiveUsers: [], popularFeatures: [] }; // Dejamos esto simplificado por ahora

    // Métricas de Alertas (asumiendo que no dependen del cliente)
    const alertMetrics = { totalAlerts: 0, pendingAlerts: 0, criticalAlerts: 0, alertsByType: {} }; // Dejamos esto simplificado

    return {
        userMetrics: { totalUsers, activeUsers, newUsersThisWeek, premiumUsers },
        contentMetrics: { exercisePrograms, nutritionChallenges, totalDaysGenerated: totalDays, averageProgramLength },
        aiMetrics: { totalAIRequests, aiRequestsLast7Days, aiRequestsLast24Hours, averageAIUsagePerUser },
        activityMetrics,
        alertMetrics,
    };
}

import { onSchedule } from 'firebase-functions/v2/scheduler';

export const aggregateAdminMetrics = onSchedule('every 1 hour', async (event) => {
  console.log('Iniciando la agregación de métricas del dashboard administrativo...');
  try {
    const metrics = await getComprehensiveMetricsForServer();
    const metricsRef = db.collection('admin_metrics').doc('summary');
    await metricsRef.set(metrics);
    console.log('Métricas del dashboard administrativo agregadas y guardadas exitosamente.');
  } catch (error) {
    console.error('Error al agregar las métricas del dashboard administrativo:', error);
  }
});