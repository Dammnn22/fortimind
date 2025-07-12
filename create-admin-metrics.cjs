// Script simple para crear métricas iniciales del dashboard admin
const admin = require('firebase-admin');

// Inicializar Firebase Admin con las credenciales del proyecto
admin.initializeApp();
const db = admin.firestore();

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
  lastUpdated: admin.firestore.Timestamp.now(),
  generatedAt: admin.firestore.Timestamp.now()
};

async function createInitialMetrics() {
  try {
    console.log('🚀 Creando métricas iniciales del dashboard admin...');
    
    const metricsRef = db.collection('admin_metrics').doc('summary');
    await metricsRef.set(sampleAdminMetrics);
    
    console.log('✅ Métricas iniciales creadas exitosamente!');
    console.log('📊 Dashboard de administrador ahora disponible.');
    
  } catch (error) {
    console.error('❌ Error creando métricas iniciales:', error);
  }
}

// Ejecutar el script
createInitialMetrics().then(() => {
  console.log('🏁 Script completado exitosamente.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error en el script:', error);
  process.exit(1);
});
