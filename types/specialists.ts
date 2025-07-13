export interface SpecialistData {
  uid: string;
  tipo: 'nutricionista' | 'psicologo' | 'coach';
  nombre: string;
  email: string;
  diasDisponibles: string[]; // ["Lunes", "Miércoles", "Viernes"]
  horario: {
    inicio: string; // "14:00"
    fin: string;    // "18:00"
  };
  tarifa: number; // 15000
  plataforma: 'Zoom' | 'Google Meet' | 'Jitsi' | 'Presencial' | 'Otros';
  clientes: string[]; // Array de UIDs de clientes
  activo: boolean;
  fechaCreacion: any; // Firestore Timestamp
  fechaActualizacion?: any; // Firestore Timestamp
}

export interface ClientSession {
  id?: string;
  especialista: {
    uid: string;
    nombre: string;
    tipo: string;
  };
  clienteUid: string;
  clienteNombre: string;
  fecha: any; // Firestore Timestamp
  notas: string;
  progreso: string;
  evaluacion: number; // 1-5
  duracion: number; // en minutos
  fechaCreacion: any; // Firestore Timestamp
}

export interface ClientInfo {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  ultimaSesion?: any; // Firestore Timestamp
  totalSesiones: number;
  estado: 'activo' | 'inactivo' | 'pausado';
}

export type SpecialistType = 'nutricionista' | 'psicologo' | 'coach';

export const SPECIALIST_ROUTES = {
  nutricionista: '/dashboard-nutricion',
  psicologo: '/dashboard-psicologia',
  coach: '/dashboard-entrenador'
} as const;

export const SPECIALIST_TITLES = {
  nutricionista: 'Dashboard Nutricionista',
  psicologo: 'Dashboard Psicólogo',
  coach: 'Dashboard Entrenador Personal'
} as const;
