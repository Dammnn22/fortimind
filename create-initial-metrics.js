// Script para crear datos iniciales de métricas del dashboard admin
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Configuración de Firebase (usa la misma configuración que tu app)
const firebaseConfig = {
  // Agrega tu configuración aquí o usa variables de entorno
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de ejemplo para las métricas del dashboard
const sampleAdminMetrics = {
  userMetrics: {
    totalUsers: 150,
    activeUsers: 89,
    newUsersThisWeek: 12,
    premiumUsers: 23
  },
  contentMetrics: {
    exercisePrograms: 45,
    nutritionChallenges: 32,
    totalDaysGenerated: 890,
    averageProgramLength: 14.5
  },
  aiMetrics: {
    totalAIRequests: 1250,
    aiRequestsLast7Days: 89,
    aiRequestsLast24Hours: 15,
    averageAIUsagePerUser: 8.3
  },
  activityMetrics: {
    topActiveUsers: [
      {
        userId: "user123",
        email: "usuario1@example.com",
        activityCount: 45,
        lastActive: new Date(),
        favoriteFeatures: ["exercise", "nutrition", "ai-chat"]
      },
      {
        userId: "user456",
        email: "usuario2@example.com", 
        activityCount: 38,
        lastActive: new Date(),
        favoriteFeatures: ["nutrition", "challenges"]
      }
    ],
    dailyActiveUsers: [12, 15, 18, 22, 19, 16, 14],
    popularFeatures: [
      {
        feature: "AI Chat",
        usageCount: 456,
        uniqueUsers: 89,
        growthRate: 12.5
      },
      {
        feature: "Exercise Programs",
        usageCount: 234,
        uniqueUsers: 67,
        growthRate: 8.2
      }
    ]
  },
  alertMetrics: {
    totalAlerts: 15,
    pendingAlerts: 3,
    criticalAlerts: 1,
    alertsByType: {
      "abuse": 2,
      "technical": 1,
      "subscription": 12
    }
  },
  lastUpdated: Timestamp.now(),
  generatedAt: Timestamp.now()
};

async function createInitialMetrics() {
  try {
    console.log('Creando métricas iniciales del dashboard admin...');
    
    const metricsRef = doc(db, 'admin_metrics', 'summary');
    await setDoc(metricsRef, sampleAdminMetrics);
    
    console.log('✅ Métricas iniciales creadas exitosamente!');
    console.log('Ahora puedes acceder al dashboard de administrador.');
    
  } catch (error) {
    console.error('❌ Error creando métricas iniciales:', error);
  }
}

// Ejecutar el script
createInitialMetrics().then(() => {
  console.log('Script completado.');
  process.exit(0);
}).catch((error) => {
  console.error('Error en el script:', error);
  process.exit(1);
});
