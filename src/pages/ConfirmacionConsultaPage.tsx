import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Video, FileText, ArrowLeft, Share2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Consulta } from '../types/consultas';

const ConfirmacionConsultaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const consultaId = searchParams.get('id');

  useEffect(() => {
    if (!consultaId) {
      setError('ID de consulta no proporcionado');
      setLoading(false);
      return;
    }

    cargarConsulta();
  }, [consultaId]);

  const cargarConsulta = async () => {
    try {
      if (!consultaId) return;

      const consultaDoc = await getDoc(doc(db, 'consultas', consultaId));
      
      if (!consultaDoc.exists()) {
        setError('Consulta no encontrada');
        return;
      }

      const data = consultaDoc.data();
      const consultaData: Consulta = {
        id: consultaDoc.id,
        userId: data.userId,
        email: data.email,
        nombre: data.nombre,
        tipoSesion: data.tipoSesion,
        fecha: data.fecha.toDate(),
        estado: data.estado,
        meetUrl: data.meetUrl || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        paypalOrderId: data.paypalOrderId || '',
        paypalCaptureId: data.paypalCaptureId || '',
        profesionalAsignado: data.profesionalAsignado || '',
        notas: data.notas || '',
        precio: data.precio || 15,
        moneda: data.moneda || 'USD',
        duracionMinutos: data.duracionMinutos || 60,
        tipoReunion: data.tipoReunion || 'online',
        telefonoContacto: data.telefonoContacto || '',
        zonaHoraria: data.zonaHoraria || 'America/Argentina/Buenos_Aires'
      };

      setConsulta(consultaData);
    } catch (error) {
      console.error('Error cargando consulta:', error);
      setError('Error al cargar los detalles de la consulta');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  };

  const copiarEnlace = async () => {
    if (consulta?.meetUrl) {
      try {
        await navigator.clipboard.writeText(consulta.meetUrl);
        // Aquí podrías mostrar una notificación de éxito
      } catch (error) {
        console.error('Error copiando enlace:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la consulta...</p>
        </div>
      </div>
    );
  }

  if (error || !consulta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/consultas')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Consultas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header de confirmación */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Consulta Confirmada!
          </h1>
          <p className="text-gray-600">
            Tu pago ha sido procesado exitosamente y tu consulta ha sido reservada.
          </p>
        </div>

        {/* Detalles de la consulta */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles de tu Consulta</h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Fecha y Hora</p>
                <p className="text-gray-600">{formatearFecha(consulta.fecha)}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Tipo de Sesión</p>
                <p className="text-gray-600">{consulta.tipoSesion}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Estado</p>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {consulta.estado}
                </span>
              </div>
            </div>

            {consulta.meetUrl && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-blue-500 mr-2" />
                    <p className="font-semibold text-gray-900">Enlace de Videollamada</p>
                  </div>
                  <button
                    onClick={copiarEnlace}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Copiar enlace"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={consulta.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline break-all"
                >
                  {consulta.meetUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Información Importante</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• Te recomendamos unirte a la videollamada 5 minutos antes de la hora programada.</li>
            <li>• Asegúrate de tener una conexión a internet estable.</li>
            <li>• Prepara cualquier pregunta o información que quieras compartir con el profesional.</li>
            <li>• Recibirás un recordatorio por email 24 horas antes de tu consulta.</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/consultas')}
            className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver Mis Consultas
          </button>
          
          {consulta.meetUrl && (
            <a
              href={consulta.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Video className="w-4 h-4 mr-2" />
              Unirse a la Reunión
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionConsultaPage;
