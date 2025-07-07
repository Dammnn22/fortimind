// Test del sistema de memoria contextual para rutinas de ejercicio
// Estructura Firestore: users/{userId}/fitness_challenges/{challengeId}/days/{dayId}
import { generateNextDayWorkoutRoutine } from './services/exerciseService';

async function testContextualWorkoutGeneration() {
  console.log('🧪 Testeando el sistema de memoria contextual para rutinas de ejercicio...');
  console.log('📁 Estructura Firestore: users/{userId}/fitness_challenges/{challengeId}/days/{dayId}');
  
  try {
    // Simular generación del día 2 (debería considerar el día 1 como contexto)
    const routine = await generateNextDayWorkoutRoutine(
      'test_user_id',
      'exercise_challenge_2024',
      'beginner',
      'home',
      undefined, // Sin datos personalizados para este test
      'es'
    );
    
    if (routine) {
      console.log('✅ Rutina generada exitosamente:');
      console.log(`   - Día: ${routine.day}`);
      console.log(`   - Grupo muscular: ${routine.muscleGroup}`);
      console.log(`   - Ejercicios: ${routine.exercises.length}`);
      console.log(`   - Duración estimada: ${routine.estimatedTime}`);
      console.log(`   - Ruta Firestore: users/test_user_id/fitness_challenges/exercise_challenge_2024/days/day_${routine.day}`);
      
      // Verificar estructura
      if (routine.exercises && routine.exercises.length > 0) {
        console.log('✅ La rutina tiene ejercicios válidos');
        console.log(`   - Primer ejercicio: ${routine.exercises[0].name}`);
      } else {
        console.log('❌ La rutina no tiene ejercicios válidos');
      }
    } else {
      console.log('❌ No se pudo generar la rutina');
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Exportar para uso opcional
export { testContextualWorkoutGeneration };

console.log('📝 Archivo de prueba creado. Para ejecutar el test:');
console.log('   1. Abre la consola del navegador en la aplicación');
console.log('   2. Importa y ejecuta testContextualWorkoutGeneration()');
