export interface SpecialistData {
  uid: string;
  tipo: 'nutricion' | 'psicologia' | 'entrenador';
  nombre: string;
  email: string;
  diasDisponibles: string[];
  horario: {
    inicio: string;
    fin: string;
  } | string;
  tarifa: number;
  plataforma: 'Zoom' | 'Google Meet' | 'Jitsi' | 'Otra';
  clientes: string[];
  activo: boolean;
  fechaCreacion: any; // Firestore Timestamp
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

export type SpecialistType = 'nutricion' | 'psicologia' | 'entrenador';

export const SPECIALIST_ROUTES = {
  nutricion: '/dashboard-nutricion',
  psicologia: '/dashboard-psicologia',
  entrenador: '/dashboard-entrenador'
} as const;

export const SPECIALIST_TITLES = {
  nutricion: 'Dashboard Nutricionista',
  psicologia: 'Dashboard Psicólogo',
  entrenador: 'Dashboard Entrenador Personal'
} as const;
