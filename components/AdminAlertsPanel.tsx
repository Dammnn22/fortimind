import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle, X, Eye, AlertCircle } from 'lucide-react';
import AbuseAlertService, { AdminAlert } from '../services/abuseAlertService';
import { useAuth } from '../hooks/useAuth';

interface AlertCardProps {
  alert: AdminAlert;
  onResolve: (alertId: string, notes?: string) => Promise<void>;
  onDismiss: (alertId: string) => Promise<void>;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onResolve, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Shield className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAbuseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'rate_limit_exceeded': 'Límite de tasa excedido',
      'suspicious_activity': 'Actividad sospechosa',
      'resource_abuse': 'Abuso de recursos',
      'api_abuse': 'Abuso de API',
      'content_violation': 'Violación de contenido'
    };
    return labels[type] || type;
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(alert.id!, notes);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 mb-4 ${getSeverityColor(alert.severidad)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getSeverityIcon(alert.severidad)}
          <div>
            <h3 className="font-semibold text-lg">{getAbuseTypeLabel(alert.tipoAbuso)}</h3>
            <p className="text-sm opacity-75">
              Usuario: {alert.email || `ID: ${alert.uid.slice(0, 8)}...`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            alert.estado === 'pending' ? 'bg-red-200 text-red-800' :
            alert.estado === 'resolved' ? 'bg-green-200 text-green-800' :
            'bg-gray-200 text-gray-800'
          }`}>
            {alert.estado === 'pending' ? 'Pendiente' :
             alert.estado === 'resolved' ? 'Resuelto' : 'Revisado'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-black hover:bg-opacity-10"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Motivo */}
      <div className="mb-3">
        <p className="text-sm font-medium mb-1">Motivo:</p>
        <p className="text-sm">{alert.motivo}</p>
      </div>

      {/* Detalles expandibles */}
      {isExpanded && (
        <div className="space-y-3 mb-4 bg-white bg-opacity-50 rounded p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Acción:</span> {alert.detalles.accion}
            </div>
            <div>
              <span className="font-medium">Período:</span> {alert.detalles.periodo}
            </div>
            <div>
              <span className="font-medium">Límite:</span> {alert.detalles.limite}
            </div>
            <div>
              <span className="font-medium">Detectado:</span> {alert.detalles.cantidadDetectada}
            </div>
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Fecha:</span> {alert.fecha.toDate().toLocaleString()}
          </div>

          {alert.detalles.metadata && (
            <div className="text-xs bg-gray-100 p-2 rounded">
              <span className="font-medium">Metadata:</span>
              <pre>{JSON.stringify(alert.detalles.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Acciones (solo si está pendiente) */}
      {alert.estado === 'pending' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Notas de resolución (opcional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              rows={2}
              placeholder="Agregar notas sobre la resolución..."
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {resolving ? 'Resolviendo...' : 'Marcar como Resuelto'}
            </button>
            
            <button
              onClick={() => onDismiss(alert.id!)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [stats, setStats] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      let alertsData: AdminAlert[];
      
      if (filter === 'pending') {
        alertsData = await AbuseAlertService.getPendingAlerts();
      } else {
        // Para 'all' y 'resolved', necesitaríamos métodos adicionales
        alertsData = await AbuseAlertService.getPendingAlerts();
      }
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await AbuseAlertService.getAlertStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading alert stats:', error);
    }
  };

  const handleResolveAlert = async (alertId: string, notes?: string) => {
    try {
      await AbuseAlertService.resolveAlert(alertId, user?.uid || 'admin', notes);
      await loadAlerts();
      await loadStats();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Error al resolver la alerta');
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      // Implementar lógica de descarte
      console.log('Dismissing alert:', alertId);
      await loadAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Cargando alertas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Alertas de Abuso</h2>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2">
            {(['all', 'pending', 'resolved'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  filter === filterOption
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' ? 'Todas' :
                 filterOption === 'pending' ? 'Pendientes' : 'Resueltas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.pendingAlerts}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.criticalAlerts}</div>
              <div className="text-sm text-gray-600">Críticas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedAlerts}</div>
              <div className="text-sm text-gray-600">Resueltas</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Alertas */}
      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay alertas {filter === 'pending' ? 'pendientes' : ''}
            </h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'Todas las alertas han sido revisadas.' 
                : 'No se han detectado problemas de seguridad.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={handleResolveAlert}
                onDismiss={handleDismissAlert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlertsPanel;
