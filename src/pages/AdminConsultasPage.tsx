import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ConsultasService } from '../services/consultasService';
import { Consulta, EstadoConsulta, TipoSesion, ConsultaStats } from '../types/consultas';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Filter,
  Brain,
  Apple,
  Dumbbell,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  Settings
} from 'lucide-react';

export default function AdminConsultasPage() {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [stats, setStats] = useState<ConsultaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoConsulta | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoSesion | ''>('');
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<Consulta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user, filtroEstado, filtroTipo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [consultasData, statsData] = await Promise.all([
        ConsultasService.getAllConsultas({
          estado: filtroEstado || undefined,
          tipoSesion: filtroTipo || undefined
        }),
        ConsultasService.getEstadisticas()
      ]);
      
      setConsultas(consultasData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (consultaId: string, nuevoEstado: EstadoConsulta, meetUrl?: string) => {
    try {
      const exito = await ConsultasService.actualizarEstadoConsulta(consultaId, nuevoEstado, meetUrl);
      if (exito) {
        await cargarDatos(); // Recargar datos
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
      case 'programado':
        return 'text-green-600 bg-green-100';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'completado':
        return 'text-blue-600 bg-blue-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Esperando pago';
      case 'confirmado': return 'Pago confirmado';
      case 'programado': return 'Programado';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const getTipoIcon = (tipo: TipoSesion) => {
    switch (tipo) {
      case 'psicologo': return <Brain className="w-5 h-5 text-blue-500" />;
      case 'nutricionista': return <Apple className="w-5 h-5 text-green-500" />;
      case 'coach': return <Dumbbell className="w-5 h-5 text-orange-500" />;
    }
  };

  // Verificar si el usuario es admin (esto debería conectarse con tu sistema de roles)
  const isAdmin = user?.email === 'admin@fortimind.com' || user?.uid === 'admin'; // Ajusta según tu lógica

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          Administración de Consultas
        </h1>
        <p className="text-gray-600">Gestiona todas las consultas 1:1 de la plataforma</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pendientes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold">{stats.confirmadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">{stats.completadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold">${stats.ingresosTotales}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Filtros:</span>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoConsulta | '')}
            className="border rounded px-3 py-1"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmado">Confirmadas</option>
            <option value="programado">Programadas</option>
            <option value="completado">Completadas</option>
            <option value="cancelado">Canceladas</option>
          </select>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoSesion | '')}
            className="border rounded px-3 py-1"
          >
            <option value="">Todos los tipos</option>
            <option value="psicologo">Psicólogo</option>
            <option value="nutricionista">Nutricionista</option>
            <option value="coach">Coach</option>
          </select>
        </div>
      </div>

      {/* Lista de consultas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Consultas ({consultas.length})</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando consultas...</p>
          </div>
        ) : consultas.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay consultas que mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => (
                  <tr key={consulta.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{consulta.nombre}</div>
                        <div className="text-sm text-gray-500">{consulta.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getTipoIcon(consulta.tipoSesion)}
                        <span className="ml-2 capitalize">{consulta.tipoSesion}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {consulta.fecha.toLocaleString('es-ES', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(consulta.estado)}`}>
                        {getEstadoTexto(consulta.estado)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setConsultaSeleccionada(consulta);
                            setModalVisible(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>
                        
                        {consulta.meetUrl && (
                          <a
                            href={consulta.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Reunión
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {modalVisible && consultaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Detalles de la Consulta</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <p className="text-sm">{consultaSeleccionada.nombre} ({consultaSeleccionada.email})</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de sesión</label>
                  <div className="flex items-center">
                    {getTipoIcon(consultaSeleccionada.tipoSesion)}
                    <span className="ml-2 capitalize">{consultaSeleccionada.tipoSesion}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha y hora</label>
                  <p className="text-sm">{consultaSeleccionada.fecha.toLocaleString('es-ES')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado actual</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(consultaSeleccionada.estado)}`}>
                    {getEstadoTexto(consultaSeleccionada.estado)}
                  </span>
                </div>
                
                {consultaSeleccionada.estado === 'confirmado' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Programar reunión</label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        id="meetUrl"
                      />
                      <button
                        onClick={() => {
                          const meetUrl = (document.getElementById('meetUrl') as HTMLInputElement).value;
                          if (meetUrl) {
                            actualizarEstado(consultaSeleccionada.id, 'programado', meetUrl);
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Programar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
              
              <div className="space-x-2">
                {consultaSeleccionada.estado === 'programado' && (
                  <button
                    onClick={() => actualizarEstado(consultaSeleccionada.id, 'completado')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Marcar Completado
                  </button>
                )}
                
                {['pendiente', 'confirmado', 'programado'].includes(consultaSeleccionada.estado) && (
                  <button
                    onClick={() => actualizarEstado(consultaSeleccionada.id, 'cancelado')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
