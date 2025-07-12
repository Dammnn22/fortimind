import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Consulta, 
  CreateConsultaRequest, 
  CreateConsultaResponse, 
  TipoSesion, 
  EstadoConsulta,
  ConsultaFilters,
  ConsultaStats
} from '../types/consultas';

// Use local emulator in development, production URL in production
const FIREBASE_FUNCTION_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/fortimind-e6094/us-central1/crearConsultaIndividual'
  : 'https://us-central1-fortimind-e6094.cloudfunctions.net/crearConsultaIndividual';

export class ConsultasService {
  
  /**
   * Crear una nueva consulta con pago PayPal
   */
  static async crearConsulta(data: CreateConsultaRequest): Promise<CreateConsultaResponse> {
    try {
      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creando consulta:', error);
      return {
        success: false,
        error: 'Error de red al crear la consulta'
      };
    }
  }

  /**
   * Obtener consultas del usuario
   */
  static async getConsultasUsuario(userId: string): Promise<Consulta[]> {
    try {
      const consultasRef = collection(db, 'consultas');
      const q = query(
        consultasRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const consultas: Consulta[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        consultas.push({
          id: doc.id,
          ...data,
          fecha: data.fecha.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Consulta);
      });
      
      return consultas;
    } catch (error) {
      console.error('Error obteniendo consultas del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener una consulta específica
   */
  static async getConsulta(consultaId: string): Promise<Consulta | null> {
    try {
      const docRef = doc(db, 'consultas', consultaId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          fecha: data.fecha.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Consulta;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo consulta:', error);
      return null;
    }
  }

  /**
   * Obtener todas las consultas (para admin)
   */
  static async getAllConsultas(filters?: ConsultaFilters): Promise<Consulta[]> {
    try {
      const consultasRef = collection(db, 'consultas');
      let q = query(consultasRef, orderBy('createdAt', 'desc'));
      
      // Aplicar filtros si existen
      if (filters?.estado) {
        q = query(consultasRef, where('estado', '==', filters.estado), orderBy('createdAt', 'desc'));
      }
      
      if (filters?.tipoSesion) {
        q = query(consultasRef, where('tipoSesion', '==', filters.tipoSesion), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const consultas: Consulta[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        consultas.push({
          id: doc.id,
          ...data,
          fecha: data.fecha.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Consulta);
      });
      
      return consultas;
    } catch (error) {
      console.error('Error obteniendo todas las consultas:', error);
      return [];
    }
  }

  /**
   * Actualizar estado de consulta
   */
  static async actualizarEstadoConsulta(
    consultaId: string, 
    nuevoEstado: EstadoConsulta,
    meetUrl?: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db, 'consultas', consultaId);
      const updateData: any = {
        estado: nuevoEstado,
        updatedAt: Timestamp.now(),
      };
      
      if (meetUrl) {
        updateData.meetUrl = meetUrl;
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error('Error actualizando estado de consulta:', error);
      return false;
    }
  }

  /**
   * Asignar profesional a consulta
   */
  static async asignarProfesional(
    consultaId: string, 
    profesionalId: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db, 'consultas', consultaId);
      await updateDoc(docRef, {
        profesionalAsignado: profesionalId,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error asignando profesional:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de consultas
   */
  static async getEstadisticas(): Promise<ConsultaStats> {
    try {
      const consultasRef = collection(db, 'consultas');
      const snapshot = await getDocs(consultasRef);
      
      const stats: ConsultaStats = {
        total: 0,
        pendientes: 0,
        confirmadas: 0,
        completadas: 0,
        canceladas: 0,
        ingresosTotales: 0,
      };
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        switch (data.estado) {
          case 'pendiente':
            stats.pendientes++;
            break;
          case 'confirmado':
          case 'programado':
            stats.confirmadas++;
            break;
          case 'completado':
            stats.completadas++;
            stats.ingresosTotales += data.precio || 15;
            break;
          case 'cancelado':
          case 'no_show':
            stats.canceladas++;
            break;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        pendientes: 0,
        confirmadas: 0,
        completadas: 0,
        canceladas: 0,
        ingresosTotales: 0,
      };
    }
  }

  /**
   * Validar disponibilidad de horario
   */
  static async validarDisponibilidad(
    fecha: Date, 
    tipoSesion: TipoSesion
  ): Promise<boolean> {
    try {
      // Crear ventana de tiempo (±30 minutos)
      const inicio = new Date(fecha.getTime() - 30 * 60 * 1000);
      const fin = new Date(fecha.getTime() + 30 * 60 * 1000);
      
      const consultasRef = collection(db, 'consultas');
      const q = query(
        consultasRef,
        where('tipoSesion', '==', tipoSesion),
        where('fecha', '>=', Timestamp.fromDate(inicio)),
        where('fecha', '<=', Timestamp.fromDate(fin)),
        where('estado', 'in', ['confirmado', 'programado'])
      );
      
      const snapshot = await getDocs(q);
      return snapshot.empty; // true si no hay conflictos
    } catch (error) {
      console.error('Error validando disponibilidad:', error);
      return false;
    }
  }

  /**
   * Obtener horarios disponibles para una fecha
   */
  static async getHorariosDisponibles(
    fecha: Date, 
    tipoSesion: TipoSesion
  ): Promise<string[]> {
    const horariosBase = [
      '08:00', '09:00', '10:00', '11:00', 
      '12:00', '13:00', '14:00', '15:00', 
      '16:00', '17:00'
    ];
    
    const horariosDisponibles: string[] = [];
    
    for (const hora of horariosBase) {
      const [horas, minutos] = hora.split(':').map(Number);
      const fechaHora = new Date(fecha);
      fechaHora.setHours(horas, minutos, 0, 0);
      
      const disponible = await this.validarDisponibilidad(fechaHora, tipoSesion);
      if (disponible) {
        horariosDisponibles.push(hora);
      }
    }
    
    return horariosDisponibles;
  }

  /**
   * Calificar consulta completada
   */
  static async calificarConsulta(
    consultaId: string,
    calificacion: number,
    feedback?: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db, 'consultas', consultaId);
      await updateDoc(docRef, {
        calificacion,
        feedback: feedback || '',
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error calificando consulta:', error);
      return false;
    }
  }
}
