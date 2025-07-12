import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Star,
  Calendar,
  DollarSign,
  Brain,
  Apple,
  Dumbbell,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  getEspecialistasByTipo,
  createEspecialista,
  updateEspecialista,
  generateDiscordStyleId
} from '../services/especialistasService';
import { 
  Especialista, 
  TipoSesion, 
  DIAS_SEMANA, 
  HORARIOS_COMUNES 
} from '../types/consultas';
import LoadingSpinner from '../../components/LoadingSpinner';

interface SpecialistManagementProps {
  firebaseUser: User;
}

const SpecialistManagement: React.FC<SpecialistManagementProps> = ({ firebaseUser }) => {
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<TipoSesion | 'todos'>('todos');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadEspecialistas();
  }, []);

  const loadEspecialistas = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los tipos
      const psicologos = await getEspecialistasByTipo('psicologo');
      const nutricionistas = await getEspecialistasByTipo('nutricionista');
      const coaches = await getEspecialistasByTipo('coach');
      
      setEspecialistas([...psicologos, ...nutricionistas, ...coaches]);
    } catch (error) {
      console.error('Error loading especialistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (tipo: TipoSesion) => {
    switch (tipo) {
      case 'psicologo': return <Brain className="w-5 h-5" />;
      case 'nutricionista': return <Apple className="w-5 h-5" />;
      case 'coach': return <Dumbbell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (tipo: TipoSesion) => {
    switch (tipo) {
      case 'psicologo': return 'text-blue-600 bg-blue-100';
      case 'nutricionista': return 'text-green-600 bg-green-100';
      case 'coach': return 'text-orange-600 bg-orange-100';
    }
  };

  const filteredEspecialistas = especialistas.filter(esp => {
    const matchesSearch = esp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         esp.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         esp.displayId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = selectedTipo === 'todos' || esp.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  const handleToggleActivo = async (especialista: Especialista) => {
    try {
      await updateEspecialista(especialista.uid, { activo: !especialista.activo });
      setEspecialistas(especialistas.map(esp => 
        esp.uid === especialista.uid 
          ? { ...esp, activo: !esp.activo }
          : esp
      ));
    } catch (error) {
      console.error('Error toggling especialista estado:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Especialistas
              </h1>
              <p className="text-gray-600 mt-1">
                Administra psicólogos, nutricionistas y coaches
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Nuevo Especialista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o ID..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value as TipoSesion | 'todos')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="psicologo">Psicólogos</option>
              <option value="nutricionista">Nutricionistas</option>
              <option value="coach">Coaches</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {especialistas.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {especialistas.filter(e => e.activo).length}
                </div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {especialistas.filter(e => e.tipo === 'psicologo').length}
                </div>
                <div className="text-sm text-gray-600">Psicólogos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Apple className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {especialistas.filter(e => e.tipo === 'nutricionista').length}
                </div>
                <div className="text-sm text-gray-600">Nutricionistas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Especialistas List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Especialistas ({filteredEspecialistas.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredEspecialistas.map(especialista => (
              <div key={especialista.uid} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(especialista.tipo)}`}>
                      {getTypeIcon(especialista.tipo)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          {especialista.nombre} {especialista.apellido}
                        </h3>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {especialista.displayId}
                        </span>
                        {especialista.activo ? (
                          <span className="flex items-center space-x-1 text-green-600 text-sm">
                            <CheckCircle size={14} />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-600 text-sm">
                            <XCircle size={14} />
                            <span>Inactivo</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize">{especialista.tipo}</span>
                        <span className="flex items-center">
                          <DollarSign size={12} className="mr-1" />
                          ${especialista.tarifa}/sesión
                        </span>
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {especialista.diasDisponibles.length} días disponibles
                        </span>
                      </div>
                      
                      {especialista.especialidades.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {especialista.especialidades.slice(0, 3).map(esp => (
                            <span key={esp} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {esp}
                            </span>
                          ))}
                          {especialista.especialidades.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{especialista.especialidades.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActivo(especialista)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        especialista.activo
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {especialista.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEspecialistas.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron especialistas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSpecialistModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadEspecialistas();
          }}
        />
      )}
    </div>
  );
};

// Modal para crear especialista
const CreateSpecialistModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    tipo: 'psicologo' as TipoSesion,
    tarifa: 25,
    experiencia: '',
    especialidades: '',
    biografia: '',
    diasDisponibles: [] as string[],
    horario: {} as { [dia: string]: string[] }
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      return;
    }

    try {
      setLoading(true);
      
      const especialistaData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        tipo: formData.tipo,
        diasDisponibles: formData.diasDisponibles,
        horario: formData.horario,
        tarifa: formData.tarifa,
        experiencia: formData.experiencia.trim(),
        especialidades: formData.especialidades ? formData.especialidades.split(',').map(s => s.trim()) : [],
        biografia: formData.biografia.trim(),
        certificaciones: [],
        idiomas: ['español']
      };

      await createEspecialista(especialistaData);
      onSuccess();
    } catch (error) {
      console.error('Error creating especialista:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDia = (dia: string) => {
    setFormData(prev => ({
      ...prev,
      diasDisponibles: prev.diasDisponibles.includes(dia)
        ? prev.diasDisponibles.filter(d => d !== dia)
        : [...prev.diasDisponibles, dia]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Nuevo Especialista
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Especialista *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoSesion }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="psicologo">Psicólogo</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por sesión (USD) *
                </label>
                <input
                  type="number"
                  value={formData.tarifa}
                  onChange={(e) => setFormData(prev => ({ ...prev, tarifa: Number(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días disponibles
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DIAS_SEMANA.map(dia => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    className={`p-2 text-sm rounded border transition-colors capitalize ${
                      formData.diasDisponibles.includes(dia)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidades (separadas por comas)
              </label>
              <input
                type="text"
                value={formData.especialidades}
                onChange={(e) => setFormData(prev => ({ ...prev, especialidades: e.target.value }))}
                placeholder="ansiedad, depresión, terapia cognitiva"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiencia
              </label>
              <textarea
                value={formData.experiencia}
                onChange={(e) => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe la experiencia profesional..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size={16} /> : 'Crear Especialista'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpecialistManagement;
