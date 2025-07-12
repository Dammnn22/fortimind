import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Eye, 
  Calendar, 
  Clock, 
  DollarSign, 
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface UsuarioPendiente {
  uid: string;
  email: string;
  displayName?: string;
  tipoInteresado?: 'psicologo' | 'nutricionista' | 'coach' | 'fisioterapeuta';
  experiencia?: string;
  especialidades?: string[];
  createdAt?: any;
  pendingReview?: boolean;
  rol?: string;
}

interface EspecialistaInfo {
  nombre: string;
  tipo: 'psicologo' | 'nutricionista' | 'coach' | 'fisioterapeuta';
  especialidades: string[];
  diasDisponibles: string[];
  horario: string;
  tarifa: number;
  experiencia: string;
  telefono?: string;
  cedula?: string;
  titulo?: string;
}

interface Props {
  firebaseUser: User;
}

const GestionEspecialistas: React.FC<Props> = ({ firebaseUser }) => {
  const [usuariosPendientes, setUsuariosPendientes] = useState<UsuarioPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ultimoDoc, setUltimoDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hayMasPaginas, setHayMasPaginas] = useState(false);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioPendiente | null>(null);
  const [especialistaInfo, setEspecialistaInfo] = useState<EspecialistaInfo>({
    nombre: '',
    tipo: 'psicologo',
    especialidades: [],
    diasDisponibles: [],
    horario: '',
    tarifa: 0,
    experiencia: '',
    telefono: '',
    cedula: '',
    titulo: ''
  });

  const USUARIOS_POR_PAGINA = 10;

  const tiposEspecialista = [
    { value: 'psicologo', label: 'Psicólogo' },
    { value: 'nutricionista', label: 'Nutricionista' },
    { value: 'coach', label: 'Coach' },
    { value: 'fisioterapeuta', label: 'Fisioterapeuta' }
  ];

  const diasSemana = [
    'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
  ];

  const especialidadesPorTipo = {
    psicologo: ['ansiedad', 'depresion', 'terapia_cognitiva', 'terapia_familiar', 'adolescentes', 'adultos'],
    nutricionista: ['perdida_peso', 'ganancia_masa', 'nutricion_deportiva', 'trastornos_alimentarios', 'diabetes'],
    coach: ['vida_personal', 'carrera_profesional', 'liderazgo', 'productividad', 'bienestar'],
    fisioterapeuta: ['lesiones_deportivas', 'rehabilitacion', 'dolor_cronico', 'postura', 'movilidad']
  };

  useEffect(() => {
    cargarUsuariosPendientes();
  }, []);

  const cargarUsuariosPendientes = async (pagina = 1) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, 'users'),
        where('pendingReview', '==', true),
        orderBy('createdAt', 'desc'),
        limit(USUARIOS_POR_PAGINA)
      );

      if (pagina > 1 && ultimoDoc) {
        q = query(
          collection(db, 'users'),
          where('pendingReview', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(ultimoDoc),
          limit(USUARIOS_POR_PAGINA)
        );
      }

      const snapshot = await getDocs(q);
      const usuarios = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UsuarioPendiente[];

      if (pagina === 1) {
        setUsuariosPendientes(usuarios);
      } else {
        setUsuariosPendientes(prev => [...prev, ...usuarios]);
      }

      // Verificar si hay más páginas
      const nextQuery = query(
        collection(db, 'users'),
        where('pendingReview', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(snapshot.docs[snapshot.docs.length - 1]),
        limit(1)
      );
      const nextSnapshot = await getDocs(nextQuery);
      setHayMasPaginas(nextSnapshot.docs.length > 0);
      
      if (snapshot.docs.length > 0) {
        setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

    } catch (error) {
      console.error('Error cargando usuarios pendientes:', error);
      setError('Error cargando usuarios pendientes');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAprobacion = (usuario: UsuarioPendiente) => {
    setUsuarioSeleccionado(usuario);
    setEspecialistaInfo({
      nombre: usuario.displayName || '',
      tipo: usuario.tipoInteresado || 'psicologo',
      especialidades: usuario.especialidades || [],
      diasDisponibles: [],
      horario: '',
      tarifa: 0,
      experiencia: usuario.experiencia || '',
      telefono: '',
      cedula: '',
      titulo: ''
    });
    setModalAbierto(true);
  };

  const aprobarComoEspecialista = async () => {
    if (!usuarioSeleccionado) return;

    try {
      setProcesando(usuarioSeleccionado.uid);
      setError(null);

      // 1. Crear documento en usuarios_especialistas
      await setDoc(doc(db, 'usuarios_especialistas', usuarioSeleccionado.uid), {
        uid: usuarioSeleccionado.uid,
        displayId: `ESP-${Date.now()}`, // ID único para especialista
        nombre: especialistaInfo.nombre,
        email: usuarioSeleccionado.email,
        tipo: especialistaInfo.tipo,
        especialidades: especialistaInfo.especialidades,
        diasDisponibles: especialistaInfo.diasDisponibles,
        horario: especialistaInfo.horario,
        tarifa: especialistaInfo.tarifa,
        experiencia: especialistaInfo.experiencia,
        telefono: especialistaInfo.telefono,
        cedula: especialistaInfo.cedula,
        titulo: especialistaInfo.titulo,
        createdAt: serverTimestamp(),
        activo: true,
        aprobadoPor: firebaseUser.uid,
        fechaAprobacion: serverTimestamp()
      });

      // 2. Actualizar usuario con rol de especialista
      await updateDoc(doc(db, 'users', usuarioSeleccionado.uid), {
        rol: 'especialista',
        pendingReview: false,
        tipoEspecialista: especialistaInfo.tipo,
        fechaAprobacion: serverTimestamp()
      });

      // 3. Actualizar la lista local
      setUsuariosPendientes(prev => 
        prev.filter(u => u.uid !== usuarioSeleccionado.uid)
      );

      setModalAbierto(false);
      setUsuarioSeleccionado(null);

    } catch (error) {
      console.error('Error aprobando especialista:', error);
      setError('Error al aprobar especialista');
    } finally {
      setProcesando(null);
    }
  };

  const rechazarSolicitud = async (uid: string) => {
    try {
      setProcesando(uid);
      setError(null);

      await updateDoc(doc(db, 'users', uid), {
        pendingReview: false,
        solicitudRechazada: true,
        fechaRechazo: serverTimestamp(),
        rechazadoPor: firebaseUser.uid
      });

      setUsuariosPendientes(prev => prev.filter(u => u.uid !== uid));

    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      setError('Error al rechazar solicitud');
    } finally {
      setProcesando(null);
    }
  };

  const toggleEspecialidad = (especialidad: string) => {
    setEspecialistaInfo(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidad)
        ? prev.especialidades.filter(e => e !== especialidad)
        : [...prev.especialidades, especialidad]
    }));
  };

  const toggleDia = (dia: string) => {
    setEspecialistaInfo(prev => ({
      ...prev,
      diasDisponibles: prev.diasDisponibles.includes(dia)
        ? prev.diasDisponibles.filter(d => d !== dia)
        : [...prev.diasDisponibles, dia]
    }));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Especialistas
              </h1>
              <p className="text-gray-600">
                Aprueba y gestiona solicitudes de especialistas
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Lista de Usuarios Pendientes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Solicitudes Pendientes ({usuariosPendientes.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : usuariosPendientes.length === 0 ? (
            <div className="text-center p-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-gray-600">
                No hay usuarios esperando aprobación como especialistas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Tipo Solicitado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Experiencia
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Fecha Solicitud
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosPendientes.map((usuario) => (
                    <tr key={usuario.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {usuario.displayName || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {usuario.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tiposEspecialista.find(t => t.value === usuario.tipoInteresado)?.label || 'No especificado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {usuario.experiencia || 'No especificada'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {usuario.createdAt?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirModalAprobacion(usuario)}
                            disabled={procesando === usuario.uid}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {procesando === usuario.uid ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                            Aprobar
                          </button>
                          <button
                            onClick={() => rechazarSolicitud(usuario.uid)}
                            disabled={procesando === usuario.uid}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            <UserX className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {hayMasPaginas && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setPaginaActual(prev => prev + 1);
                  cargarUsuariosPendientes(paginaActual + 1);
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cargar más usuarios
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Aprobación */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Aprobar como Especialista
              </h3>
              <p className="text-gray-600 mt-1">
                {usuarioSeleccionado.displayName} ({usuarioSeleccionado.email})
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={especialistaInfo.nombre}
                    onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Especialista *
                  </label>
                  <select
                    value={especialistaInfo.tipo}
                    onChange={(e) => setEspecialistaInfo(prev => ({ 
                      ...prev, 
                      tipo: e.target.value as any,
                      especialidades: [] // Reset especialidades al cambiar tipo
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {tiposEspecialista.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {especialidadesPorTipo[especialistaInfo.tipo].map(especialidad => (
                    <label key={especialidad} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={especialistaInfo.especialidades.includes(especialidad)}
                        onChange={() => toggleEspecialidad(especialidad)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {especialidad.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Días Disponibles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días Disponibles *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {diasSemana.map(dia => (
                    <label key={dia} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={especialistaInfo.diasDisponibles.includes(dia)}
                        onChange={() => toggleDia(dia)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {dia}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Información Profesional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario de Atención *
                  </label>
                  <input
                    type="text"
                    value={especialistaInfo.horario}
                    onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, horario: e.target.value }))}
                    placeholder="ej: 08:00-17:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa por Sesión (COP) *
                  </label>
                  <input
                    type="number"
                    value={especialistaInfo.tarifa}
                    onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, tarifa: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Información Adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiencia y Descripción *
                </label>
                <textarea
                  value={especialistaInfo.experiencia}
                  onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, experiencia: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe la experiencia profesional del especialista"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={especialistaInfo.telefono}
                    onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula/ID
                  </label>
                  <input
                    type="text"
                    value={especialistaInfo.cedula}
                    onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, cedula: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título/Certificación
                  </label>
                  <input
                    type="text"
                    value={especialistaInfo.titulo}
                    onChange={(e) => setEspecialistaInfo(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={aprobarComoEspecialista}
                disabled={
                  !especialistaInfo.nombre || 
                  !especialistaInfo.horario || 
                  especialistaInfo.especialidades.length === 0 ||
                  especialistaInfo.diasDisponibles.length === 0 ||
                  !especialistaInfo.experiencia ||
                  especialistaInfo.tarifa <= 0 ||
                  procesando === usuarioSeleccionado.uid
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {procesando === usuarioSeleccionado.uid ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Aprobar Especialista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEspecialistas;
