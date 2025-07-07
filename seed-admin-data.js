// Script para poblar Firestore con datos de prueba para el Admin Dashboard
// Ejecutar desde la consola del navegador en http://localhost:5173

(async () => {
  // Importar Firebase (asumiendo que está disponible globalmente)
  const { db } = window.firebase || await import('./firebase.js');
  const { collection, addDoc, Timestamp } = window.firestore || await import('firebase/firestore');

  console.log('🚀 Iniciando población de datos de prueba...');

  try {
    // 1. Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    const users = [
      { email: 'usuario1@test.com', name: 'Juan Pérez', createdAt: Timestamp.now() },
      { email: 'usuario2@test.com', name: 'María García', createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario3@test.com', name: 'Carlos López', createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario4@test.com', name: 'Ana Martín', createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
      { email: 'usuario5@test.com', name: 'Luis Ruiz', createdAt: Timestamp.now() },
    ];

    const userIds = [];
    for (const user of users) {
      const docRef = await addDoc(collection(db, 'users'), user);
      userIds.push(docRef.id);
      console.log(`✅ Usuario creado: ${user.email}`);
    }

    // 2. Crear programas de ejercicio
    console.log('🏋️ Creando programas de ejercicio...');
    const exercisePrograms = [
      { userId: userIds[0], name: 'Rutina Principiante', totalDays: 30, type: 'general_fitness' },
      { userId: userIds[1], name: 'Pérdida de Peso', totalDays: 45, type: 'weight_loss' },
      { userId: userIds[2], name: 'Ganancia Muscular', totalDays: 60, type: 'muscle_gain' },
      { userId: userIds[0], name: 'Fuerza Avanzada', totalDays: 90, type: 'strength' },
    ];

    for (const program of exercisePrograms) {
      await addDoc(collection(db, 'exercise_programs'), {
        ...program,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
      });
      console.log(`✅ Programa de ejercicio creado: ${program.name}`);
    }

    // 3. Crear retos nutricionales
    console.log('🍎 Creando retos nutricionales...');
    const nutritionChallenges = [
      { userId: userIds[1], name: 'Detox 21 días', totalDays: 21, type: 'detox' },
      { userId: userIds[2], name: 'Aumento de Masa', totalDays: 30, type: 'muscle_gain' },
      { userId: userIds[3], name: 'Dieta Mediterránea', totalDays: 60, type: 'general_health' },
    ];

    for (const challenge of nutritionChallenges) {
      await addDoc(collection(db, 'nutrition_challenges'), {
        ...challenge,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000))
      });
      console.log(`✅ Reto nutricional creado: ${challenge.name}`);
    }

    // 4. Crear suscripciones premium
    console.log('💎 Creando suscripciones premium...');
    const subscriptions = [
      { userId: userIds[1], status: 'active', plan: 'monthly' },
      { userId: userIds[3], status: 'active', plan: 'yearly' },
    ];

    for (const subscription of subscriptions) {
      await addDoc(collection(db, 'user_subscriptions'), {
        ...subscription,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000))
      });
      console.log(`✅ Suscripción creada para usuario: ${subscription.userId}`);
    }

    // 5. Crear actividad de usuarios (incluyendo uso de IA)
    console.log('📊 Creando actividad de usuarios...');
    const activities = [
      'ai_chat', 'program_creation', 'challenge_creation', 'ai_advice', 
      'workout_completed', 'nutrition_logged', 'progress_updated'
    ];

    for (let i = 0; i < 100; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const randomTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, 'user_activity'), {
        userId: randomUserId,
        action: randomActivity,
        timestamp: Timestamp.fromDate(randomTime),
        metadata: {
          source: 'test_data',
          session_id: `session_${i}`
        }
      });

      if (i % 10 === 0) {
        console.log(`📈 Actividades creadas: ${i + 1}/100`);
      }
    }

    console.log('🎉 ¡Datos de prueba creados exitosamente!');
    console.log('📋 Resumen:');
    console.log(`- ${users.length} usuarios`);
    console.log(`- ${exercisePrograms.length} programas de ejercicio`);
    console.log(`- ${nutritionChallenges.length} retos nutricionales`);
    console.log(`- ${subscriptions.length} suscripciones premium`);
    console.log('- 100 registros de actividad');
    console.log('');
    console.log('🔗 Ahora puedes visitar /admin-dashboard para ver las métricas');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
})();
