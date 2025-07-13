import { setupSpecialistSystem } from './services/initializeSpecialists.js';

// Ejecutar la configuración del sistema de especialistas
setupSpecialistSystem()
  .then(result => {
    console.log('✅ Resultado:', result);
    if (result.success) {
      console.log('🎉 Sistema de especialistas configurado correctamente');
    } else {
      console.error('❌ Error:', result.message);
    }
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error);
  })
  .finally(() => {
    console.log('🔄 Proceso terminado');
  });
