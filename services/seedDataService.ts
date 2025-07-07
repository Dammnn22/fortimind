import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Servicio para poblar la base de datos con datos de prueba para el Admin Dashboard
 */
export class SeedDataService {
  
  /**
   * Crea datos de prueba para todas las colecciones necesarias
   */
  static async seedAllTestData(): Promise<void> {
    console.log('🚀 Iniciando población de datos de prueba...');

    try {
      const userIds = await this.createTestUsers();
      await this.createTestExercisePrograms(userIds);
      await this.createTestNutritionChallenges(userIds);
      await this.createTestSubscriptions(userIds);
      await this.createTestUserActivity(userIds);

      console.log('🎉 ¡Datos de prueba creados exitosamente!');
    } catch (error) {
      console.error('❌ Error creando datos de prueba:', error);
      throw error;
    }
  }

  /**
   * Crear usuarios de prueba
   */
  private static async createTestUsers(): Promise<string[]> {
    console.log('👥 Creando usuarios de prueba...');
    
    const users = [
      { email: 'admin@fortimind.com', name: 'Admin FortiMind', role: 'admin', createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario1@test.com', name: 'Juan Pérez', role: 'user', createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario2@test.com', name: 'María García', role: 'user', createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario3@test.com', name: 'Carlos López', role: 'user', createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario4@test.com', name: 'Ana Martín', role: 'user', createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario5@test.com', name: 'Luis Ruiz', role: 'user', createdAt: Timestamp.now() },
    ];

    const userIds: string[] = [];
    
    for (const user of users) {
      const docRef = await addDoc(collection(db, 'users'), user);
      userIds.push(docRef.id);
      console.log(`✅ Usuario creado: ${user.email}`);
    }

    return userIds;
  }

  /**
   * Crear programas de ejercicio de prueba
   */
  private static async createTestExercisePrograms(userIds: string[]): Promise<void> {
    console.log('🏋️ Creando programas de ejercicio...');
    
    const programs = [
      { userId: userIds[1], name: 'Rutina Principiante', totalDays: 30, type: 'general_fitness', status: 'active' },
      { userId: userIds[2], name: 'Pérdida de Peso Intensiva', totalDays: 45, type: 'weight_loss', status: 'active' },
      { userId: userIds[3], name: 'Ganancia Muscular', totalDays: 60, type: 'muscle_gain', status: 'completed' },
      { userId: userIds[1], name: 'Fuerza Avanzada', totalDays: 90, type: 'strength', status: 'active' },
      { userId: userIds[4], name: 'Cardio y Resistencia', totalDays: 40, type: 'endurance', status: 'active' },
      { userId: userIds[5], name: 'Ejercicios en Casa', totalDays: 21, type: 'general_fitness', status: 'paused' },
    ];

    for (const program of programs) {
      await addDoc(collection(db, 'exercise_programs'), {
        ...program,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000))
      });
      console.log(`✅ Programa de ejercicio creado: ${program.name}`);
    }
  }

  /**
   * Crear retos nutricionales de prueba
   */
  private static async createTestNutritionChallenges(userIds: string[]): Promise<void> {
    console.log('🍎 Creando retos nutricionales...');
    
    const challenges = [
      { userId: userIds[2], name: 'Detox 21 días', totalDays: 21, type: 'detox', status: 'completed' },
      { userId: userIds[3], name: 'Aumento de Masa Muscular', totalDays: 30, type: 'muscle_gain', status: 'active' },
      { userId: userIds[4], name: 'Dieta Mediterránea', totalDays: 60, type: 'general_health', status: 'active' },
      { userId: userIds[1], name: 'Reto Vegano 30 días', totalDays: 30, type: 'plant_based', status: 'active' },
      { userId: userIds[5], name: 'Anti-inflamatorio', totalDays: 14, type: 'anti_inflammatory', status: 'paused' },
    ];

    for (const challenge of challenges) {
      await addDoc(collection(db, 'nutrition_challenges'), {
        ...challenge,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000))
      });
      console.log(`✅ Reto nutricional creado: ${challenge.name}`);
    }
  }

  /**
   * Crear suscripciones premium de prueba
   */
  private static async createTestSubscriptions(userIds: string[]): Promise<void> {
    console.log('💎 Creando suscripciones premium...');
    
    const subscriptions = [
      { userId: userIds[2], status: 'active', plan: 'monthly', amount: 9.99 },
      { userId: userIds[4], status: 'active', plan: 'yearly', amount: 99.99 },
      { userId: userIds[1], status: 'cancelled', plan: 'monthly', amount: 9.99 },
    ];

    for (const subscription of subscriptions) {
      await addDoc(collection(db, 'user_subscriptions'), {
        ...subscription,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)),
        lastPayment: Timestamp.fromDate(new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000))
      });
      console.log(`✅ Suscripción creada para usuario: ${subscription.userId.slice(0, 8)}...`);
    }
  }

  /**
   * Crear actividad de usuarios (incluyendo uso de IA)
   */
  private static async createTestUserActivity(userIds: string[]): Promise<void> {
    console.log('📊 Creando actividad de usuarios...');
    
    const activities = [
      'ai_chat', 'program_creation', 'challenge_creation', 'ai_advice',
      'workout_completed', 'nutrition_logged', 'progress_updated',
      'community_post', 'goal_achieved', 'streak_maintained'
    ];

    const totalActivities = 200;
    
    for (let i = 0; i < totalActivities; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      // Crear actividad más reciente para usuarios más activos
      const dayRange = randomUserId === userIds[1] || randomUserId === userIds[2] ? 7 : 30;
      const randomTime = new Date(Date.now() - Math.random() * dayRange * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, 'user_activity'), {
        userId: randomUserId,
        action: randomActivity,
        timestamp: Timestamp.fromDate(randomTime),
        metadata: {
          source: 'test_data',
          session_id: `session_${i}`,
          device: Math.random() > 0.5 ? 'mobile' : 'desktop'
        }
      });

      if (i % 25 === 0 && i > 0) {
        console.log(`📈 Actividades creadas: ${i}/${totalActivities}`);
      }
    }

    console.log(`✅ ${totalActivities} registros de actividad creados`);
  }

  /**
   * Limpiar datos de prueba (usar con cuidado)
   */
  static async clearTestData(): Promise<void> {
    console.warn('⚠️  Esta función eliminaría datos de prueba. Implementar con cuidado.');
    // Implementar eliminación segura si es necesario
  }
}

/**
 * Hook React para usar el servicio de datos de prueba
 */
export const useSeedData = () => {
  const seedData = async () => {
    try {
      await SeedDataService.seedAllTestData();
      return { success: true, message: 'Datos de prueba creados exitosamente' };
    } catch (error) {
      console.error('Error seeding data:', error);
      return { success: false, message: 'Error creando datos de prueba' };
    }
  };

  return { seedData };
};
