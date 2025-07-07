import React from 'react';
import FortiMindPremiumFeature from '../FortiMindPremiumFeature';
import useFortiMindPremium from '../../hooks/useFortiMindPremium';

// Ejemplo 1: Chat con IA (Premium completo)
export const AIChatExample: React.FC = () => {
  const { incrementUsage } = useFortiMindPremium('ai_chat');

  const handleSendMessage = async (message: string) => {
    // Incrementar contador de uso antes de enviar
    await incrementUsage('ai_chat');
    
    // Lógica del chat con IA
    console.log('Enviando mensaje a IA:', message);
  };

  return (
    <FortiMindPremiumFeature featureId="ai_chat">
      <div className="ai-chat-container">
        <h3>Chat con IA</h3>
        <p>Obtén mentoría personalizada y guía de expertos</p>
        
        <div className="chat-interface">
          <textarea placeholder="Escribe tu pregunta..." />
          <button onClick={() => handleSendMessage("Hola IA")}>
            Enviar Mensaje
          </button>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 2: Retos de 30 días (Límite gratuito: 10 días)
export const ChallengeExample: React.FC = () => {
  const { featureAccess, incrementUsage } = useFortiMindPremium('challenges_30_days');

  const handleCompleteDay = async () => {
    await incrementUsage('challenges_30_days');
    console.log('Día completado del reto');
  };

  return (
    <FortiMindPremiumFeature featureId="challenges_30_days">
      <div className="challenge-container">
        <h3>Reto de 30 Días</h3>
        
        {featureAccess && !featureAccess.isPremium && (
          <div className="challenge-progress">
            <p>Progreso: {featureAccess.currentUsage} de {featureAccess.limit} días</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${featureAccess.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="challenge-content">
          <h4>Día {featureAccess?.currentUsage || 0}</h4>
          <p>Ejercicio del día: 30 minutos de cardio</p>
          <button onClick={handleCompleteDay}>
            Completar Día
          </button>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 3: Múltiples hábitos y metas (Límite gratuito: 1)
export const HabitsGoalsExample: React.FC = () => {
  const { featureAccess, incrementUsage } = useFortiMindPremium('multiple_habits_goals');

  const handleCreateHabit = async () => {
    await incrementUsage('multiple_habits_goals');
    console.log('Hábito creado');
  };

  return (
    <FortiMindPremiumFeature featureId="multiple_habits_goals">
      <div className="habits-goals-container">
        <h3>Mis Hábitos y Metas</h3>
        
        {featureAccess && !featureAccess.isPremium && (
          <div className="usage-info">
            <p>Hábitos/Metas creados: {featureAccess.currentUsage} de {featureAccess.limit}</p>
            {featureAccess.remaining && featureAccess.remaining > 0 && (
              <p>Puedes crear {featureAccess.remaining} más</p>
            )}
          </div>
        )}
        
        <div className="habits-list">
          <div className="habit-item">
            <h4>Ejercicio diario</h4>
            <p>30 minutos de actividad física</p>
          </div>
          
          {featureAccess?.canAccess && (
            <button onClick={handleCreateHabit} className="create-habit-btn">
              + Crear Nuevo Hábito
            </button>
          )}
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 4: Meditaciones (Límite gratuito: 3 sesiones)
export const MeditationExample: React.FC = () => {
  const { featureAccess, incrementUsage } = useFortiMindPremium('unlimited_meditation');

  const handleStartMeditation = async () => {
    await incrementUsage('unlimited_meditation');
    console.log('Iniciando sesión de meditación');
  };

  return (
    <FortiMindPremiumFeature featureId="unlimited_meditation">
      <div className="meditation-container">
        <h3>Audio-terapias y Meditaciones</h3>
        
        {featureAccess && !featureAccess.isPremium && (
          <div className="meditation-limit">
            <p>Sesiones disponibles: {featureAccess.remaining} de {featureAccess.limit}</p>
          </div>
        )}
        
        <div className="meditation-sessions">
          <div className="session-item">
            <h4>Meditación para el Enfoque</h4>
            <p>10 minutos de concentración</p>
            <button onClick={handleStartMeditation}>
              Iniciar Sesión
            </button>
          </div>
          
          <div className="session-item">
            <h4>Relajación Profunda</h4>
            <p>15 minutos de calma</p>
            <button onClick={handleStartMeditation}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 5: Análisis AI del diario (Premium completo)
export const DiaryAnalysisExample: React.FC = () => {
  const { incrementUsage } = useFortiMindPremium('ai_diary_analysis');

  const handleAnalyzeDay = async () => {
    await incrementUsage('ai_diary_analysis');
    console.log('Analizando día con IA');
  };

  return (
    <FortiMindPremiumFeature featureId="ai_diary_analysis">
      <div className="diary-analysis-container">
        <h3>Análisis AI de tu Día</h3>
        <p>Deja que la IA revise tu progreso y te dé insights personalizados</p>
        
        <div className="diary-content">
          <textarea 
            placeholder="Escribe sobre tu día..."
            className="diary-textarea"
          />
          
          <button onClick={handleAnalyzeDay} className="analyze-btn">
            🔍 Analizar con IA
          </button>
        </div>
        
        <div className="ai-insights">
          <h4>Insights de la IA:</h4>
          <p>Basado en tu entrada, la IA te dará recomendaciones personalizadas...</p>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 6: Estadísticas avanzadas (Premium completo)
export const AdvancedStatsExample: React.FC = () => {
  return (
    <FortiMindPremiumFeature featureId="advanced_statistics">
      <div className="advanced-stats-container">
        <h3>Estadísticas Completas</h3>
        <p>Análisis detallado por categorías</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Disciplina</h4>
            <div className="stat-value">85%</div>
            <p>Consistencia en hábitos</p>
          </div>
          
          <div className="stat-card">
            <h4>Emociones</h4>
            <div className="stat-value">+12%</div>
            <p>Mejora en bienestar</p>
          </div>
          
          <div className="stat-card">
            <h4>Hábitos</h4>
            <div className="stat-value">7/10</div>
            <p>Hábitos activos</p>
          </div>
        </div>
        
        <div className="comparison-charts">
          <h4>Comparaciones Temporales</h4>
          <p>Gráficos interactivos de progreso...</p>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 7: Resumen semanal/mensual con IA (Premium completo)
export const WeeklySummaryExample: React.FC = () => {
  const { incrementUsage } = useFortiMindPremium('weekly_monthly_ai_summary');

  const handleGenerateSummary = async () => {
    await incrementUsage('weekly_monthly_ai_summary');
    console.log('Generando resumen semanal con IA');
  };

  return (
    <FortiMindPremiumFeature featureId="weekly_monthly_ai_summary">
      <div className="weekly-summary-container">
        <h3>Resumen Semanal con IA</h3>
        <p>Análisis profundo de tu progreso y emociones</p>
        
        <div className="summary-options">
          <button onClick={handleGenerateSummary} className="summary-btn">
            📊 Generar Resumen Semanal
          </button>
          
          <button onClick={handleGenerateSummary} className="summary-btn">
            📈 Generar Resumen Mensual
          </button>
        </div>
        
        <div className="ai-summary">
          <h4>Resumen de la Semana:</h4>
          <div className="summary-content">
            <p>La IA analizará tu progreso y te dará insights personalizados...</p>
          </div>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Ejemplo 8: Acceso anticipado (Premium completo)
export const EarlyAccessExample: React.FC = () => {
  return (
    <FortiMindPremiumFeature featureId="early_access">
      <div className="early-access-container">
        <h3>🚀 Acceso Anticipado</h3>
        <p>Prueba nuevas características antes que nadie</p>
        
        <div className="beta-features">
          <div className="beta-feature">
            <h4>Nueva Función Beta</h4>
            <p>Característica experimental disponible solo para premium</p>
            <button className="beta-btn">Probar Ahora</button>
          </div>
          
          <div className="beta-feature">
            <h4>Comunidad Premium</h4>
            <p>Acceso exclusivo a grupos de usuarios premium</p>
            <button className="beta-btn">Unirse</button>
          </div>
        </div>
      </div>
    </FortiMindPremiumFeature>
  );
};

// Componente principal que muestra todos los ejemplos
export const PremiumFeaturesShowcase: React.FC = () => {
  return (
    <div className="premium-features-showcase">
      <h2>Funciones Premium de FortiMind</h2>
      
      <div className="features-grid">
        <AIChatExample />
        <ChallengeExample />
        <HabitsGoalsExample />
        <MeditationExample />
        <DiaryAnalysisExample />
        <AdvancedStatsExample />
        <WeeklySummaryExample />
        <EarlyAccessExample />
      </div>
    </div>
  );
};

export default PremiumFeaturesShowcase; 