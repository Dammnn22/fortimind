export interface Consulta {
  id: string;
  userId: string;
  email: string;
  nombre: string;
  tipoSesion: TipoSesion;
  fecha: Date;
  estado: EstadoConsulta;
  meetUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  profesionalAsignado?: string;
  notas?: string;
  calificacion?: number;
  feedback?: string;
  // Metadatos adicionales
  precio?: number;
  moneda?: string;
  duracionMinutos?: number;
  tipoReunion?: string;
  telefonoContacto?: string;
  zonaHoraria?: string;
}

export type TipoSesion = 'psicologo' | 'nutricionista' | 'coach';

export type EstadoConsulta = 
  | 'pendiente'      // Esperando pago
  | 'confirmado'     // Pago confirmado, esperando fecha
  | 'programado'     // Link de reunión enviado
  | 'en_progreso'    // Sesión activa
  | 'completado'     // Sesión finalizada
  | 'cancelado'      // Cancelado por usuario/admin
  | 'no_show';       // Usuario no se presentó

export interface CreateConsultaRequest {
  userId: string;
  email: string;
  nombre: string;
  tipoSesion: TipoSesion;
  fecha: string; // ISO string
}

export interface CreateConsultaResponse {
  success: boolean;
  consultaId?: string;
  approvalUrl?: string;
  error?: string;
}

export interface ConsultaFilters {
  estado?: EstadoConsulta;
  tipoSesion?: TipoSesion;
  fechaDesde?: Date;
  fechaHasta?: Date;
  profesional?: string;
}

export interface ConsultaStats {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  ingresosTotales: number;
}

export interface HorarioDisponible {
  fecha: string; // YYYY-MM-DD
  horas: string[]; // ['09:00', '10:00', ...]
}

export interface ProfesionalInfo {
  id: string;
  nombre: string;
  especialidad: TipoSesion;
  descripcion: string;
  experiencia: string;
  calificacionPromedio: number;
  totalConsultas: number;
  disponibilidad: HorarioDisponible[];
}

export interface Especialista {
  uid: string;                   // Firebase Auth UID
  displayId: string;            // ID visible tipo Discord (PsicoMaria#9471)
  nombre: string;
  apellido: string;
  email: string;
  tipo: TipoSesion;
  diasDisponibles: string[];    // ["lunes", "miercoles", "viernes"]
  horario: { [dia: string]: string[] }; // { "lunes": ["14:00", "16:00"] }
  tarifa: number;               // Precio en USD
  experiencia: string;          // Descripción de experiencia
  especialidades: string[];     // ["ansiedad", "depresión", "terapia cognitiva"]
  biografia?: string;           // Descripción personal
  certificaciones?: string[];   // ["Maestría en Psicología", "Certificado CBT"]
  idiomas?: string[];          // ["español", "inglés"]
  activo: boolean;             // Si está disponible para nuevas citas
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReporteIA {
  id: string;
  consultaId: string;
  userId: string;
  specialistId: string;
  resumen: string;             // Contexto clínico o emocional útil para la IA
  recomendaciones?: string;    // Recomendaciones específicas
  proximasSesiones?: string;   // Sugerencias para futuras sesiones
  autor: string;               // Nombre del profesional
  tipo: TipoSesion;           // psicólogo / nutricionista / coach
  fecha: Date;
  privacidad: 'privado' | 'contextual'; // privado = solo especialista, contextual = disponible para IA
  createdAt: Date;
}

export interface CitaEspecialista extends Consulta {
  specialistId: string;
  motivo?: string;             // Razón de la consulta según el usuario
  reporteEspecialista?: string; // ID del reporte si existe
  duracionReal?: number;       // Duración real de la sesión
  siguienteCita?: Date;        // Si se programa cita de seguimiento
}

export interface DisponibilidadEspecialista {
  especialistaId: string;
  fecha: Date;
  horasDisponibles: string[];  // ["14:00", "15:00", "16:00"]
  horasOcupadas: string[];     // ["14:00"] - ya tiene cita
}

// Enums para días de la semana
export const DIAS_SEMANA = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
] as const;

export type DiaSemana = typeof DIAS_SEMANA[number];

// Horarios comunes para especialistas
export const HORARIOS_COMUNES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
] as const;
