import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Función para obtener contexto IA mejorado con reportes de especialistas
export const getContextoIA = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { userId, pregunta } = data;
    
    if (!userId || !pregunta) {
      throw new functions.https.HttpsError('invalid-argument', 'userId y pregunta son requeridos');
    }

    // Obtener el último reporte de un especialista
    const reportesSnapshot = await admin.firestore()
      .collection(`usuarios/${userId}/contexto_ia`)
      .where('privacidad', '==', 'contextual')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let contextoEspecialista = '';
    
    if (!reportesSnapshot.empty) {
      const ultimoReporte = reportesSnapshot.docs[0].data();
      contextoEspecialista = `
Contexto profesional previo:
- Profesional: ${ultimoReporte.autor} (${ultimoReporte.tipo})
- Fecha: ${ultimoReporte.fecha.toDate().toLocaleDateString()}
- Resumen: ${ultimoReporte.resumen}
${ultimoReporte.recomendaciones ? `- Recomendaciones: ${ultimoReporte.recomendaciones}` : ''}

`;
    }

    // Obtener datos básicos del usuario (opcional)
    const userDoc = await admin.firestore()
      .collection('usuarios')
      .doc(userId)
      .get();

    let contextoUsuario = '';
    if (userDoc.exists) {
      const userData = userDoc.data();
      contextoUsuario = `
Información del usuario:
- Nombre: ${userData?.nombre || 'No especificado'}
- Edad: ${userData?.edad || 'No especificada'}
- Objetivos: ${userData?.objetivos?.join(', ') || 'No especificados'}

`;
    }

    // Construir prompt final con contexto
    const promptFinal = `${contextoEspecialista}${contextoUsuario}Consulta del usuario: ${pregunta}

Por favor, responde de manera personalizada considerando el contexto profesional y la información del usuario.`;

    return {
      success: true,
      promptConContexto: promptFinal,
      tieneContextoEspecialista: contextoEspecialista.length > 0,
      tieneContextoUsuario: contextoUsuario.length > 0
    };

  } catch (error) {
    console.error('Error getting contexto IA:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo contexto IA');
  }
});

// Función para marcar un reporte como leído por la IA
export const marcarReporteLeido = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { userId, reporteId } = data;
    
    if (!userId || !reporteId) {
      throw new functions.https.HttpsError('invalid-argument', 'userId y reporteId son requeridos');
    }

    await admin.firestore()
      .collection('reportes_ia')
      .doc(reporteId)
      .update({
        visto_por_ia: true,
        fecha_vista: admin.firestore.FieldValue.serverTimestamp()
      });

    return { success: true };

  } catch (error) {
    console.error('Error marking reporte as read:', error);
    throw new functions.https.HttpsError('internal', 'Error marcando reporte como leído');
  }
});

// Función para obtener estadísticas de especialistas
export const getEspecialistasStats = functions.https.onCall(async (data: any, context: any) => {
  try {
    // Verificar permisos de admin (opcional)
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
    }

    // Obtener estadísticas de especialistas
    const especialistasSnapshot = await admin.firestore()
      .collection('usuarios_especialistas')
      .get();

    const stats = {
      total: especialistasSnapshot.size,
      activos: 0,
      porTipo: {
        psicologo: 0,
        nutricionista: 0,
        coach: 0
      } as Record<string, number>
    };

    especialistasSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.activo) {
        stats.activos++;
      }
      if (data.tipo && stats.porTipo[data.tipo] !== undefined) {
        stats.porTipo[data.tipo]++;
      }
    });

    // Obtener estadísticas de consultas
    const consultasSnapshot = await admin.firestore()
      .collection('consultas_globales')
      .where('estado', '==', 'completado')
      .get();

    const statsConsultas = {
      totalCompletadas: consultasSnapshot.size,
      conReporte: 0,
      porTipo: {
        psicologo: 0,
        nutricionista: 0,
        coach: 0
      } as Record<string, number>
    };

    consultasSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.reporteEspecialista) {
        statsConsultas.conReporte++;
      }
      if (data.tipoSesion && statsConsultas.porTipo[data.tipoSesion] !== undefined) {
        statsConsultas.porTipo[data.tipoSesion]++;
      }
    });

    return {
      success: true,
      especialistas: stats,
      consultas: statsConsultas
    };

  } catch (error) {
    console.error('Error getting especialistas stats:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo estadísticas');
  }
});
