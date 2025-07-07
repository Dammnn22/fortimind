import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface ExerciseChallengeFormProps {
  onComplete: (data: ExerciseChallengeFormData) => void;
}

export interface ExerciseChallengeFormData {
  fitnessLevel: string;
  exerciseFrequency: string;
  age: string;
  height: string;
  weight: string;
  trainingType: string;
  trainingPlace: string;
  sessionTime: string;
  mainGoals: string[];
  targetAreas: string[];
  injuries: string;
  activityHistory: string;
  stressLevel: string;
  motivationLevel: string;
  motivationText: string;
  trainingSchedule: string;
  availableDays: string;
  previousExperience: string;
}

const initialState: ExerciseChallengeFormData = {
  fitnessLevel: '',
  exerciseFrequency: '',
  age: '',
  height: '',
  weight: '',
  trainingType: '',
  trainingPlace: '',
  sessionTime: '',
  mainGoals: [],
  targetAreas: [],
  injuries: '',
  activityHistory: '',
  stressLevel: '',
  motivationLevel: '',
  motivationText: '',
  trainingSchedule: '',
  availableDays: '',
  previousExperience: '',
};

const steps = [
  'fitnessLevel',
  'trainingPreferences',
  'goals',
  'health',
  'mental',
  'schedule',
  'experience',
];

const ExerciseChallengeForm: React.FC<ExerciseChallengeFormProps> = ({ onComplete }) => {
  const [form, setForm] = useState<ExerciseChallengeFormData>(initialState);
  const [step, setStep] = useState(0);
  const { t } = useLocalization();

  // Handlers para cambios de campos
  const handleChange = (field: keyof ExerciseChallengeFormData, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleMultiChange = (field: keyof ExerciseChallengeFormData, value: string) => {
    const arr = form[field] as string[];
    if (arr.includes(value)) {
      setForm({ ...form, [field]: arr.filter((v) => v !== value) });
    } else {
      setForm({ ...form, [field]: [...arr, value] });
    }
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));
  const handleFinish = () => onComplete(form);

  // Esqueleto visual de los pasos
  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        {t('exerciseChallengeTitle')}
      </h2>
      {/* Paso 1: Datos y nivel físico */}
      {step === 0 && (
        <div>
          <label className="block mb-2 font-semibold">1. Nivel de condición física actual</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.fitnessLevel} onChange={e => handleChange('fitnessLevel', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="beginner">{t('beginner')}</option>
            <option value="intermediate">{t('intermediate')}</option>
            <option value="advanced">{t('professional')}</option>
          </select>
          <label className="block mb-2 font-semibold">Frecuencia actual de ejercicio (días por semana)</label>
          <input className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" min="0" max="7" value={form.exerciseFrequency} onChange={e => handleChange('exerciseFrequency', e.target.value)} placeholder="Días por semana" />
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input className="p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('age')} value={form.age} onChange={e => handleChange('age', e.target.value)} min={13} />
            <input className="p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('height_cm')} value={form.height} onChange={e => handleChange('height', e.target.value)} />
            <input className="p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('weight_kg')} value={form.weight} onChange={e => handleChange('weight', e.target.value)} min={45} />
          </div>
        </div>
      )}
      {/* Paso 2: Preferencias de entrenamiento */}
      {step === 1 && (
        <div>
          <label className="block mb-2 font-semibold">2. Tipo de entrenamiento preferido</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.trainingType} onChange={e => handleChange('trainingType', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="fuerza">Fuerza</option>
            <option value="cardio">Cardio</option>
            <option value="funcional">Funcional</option>
            <option value="yoga">Yoga</option>
            <option value="hiit">HIIT</option>
            <option value="otro">{t('other')}</option>
          </select>
          <label className="block mb-2 font-semibold">Lugar habitual de entrenamiento</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.trainingPlace} onChange={e => handleChange('trainingPlace', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="casa">{t('home')}</option>
            <option value="gimnasio">{t('gym')}</option>
            <option value="ambos">Ambos</option>
          </select>
          <label className="block mb-2 font-semibold">Tiempo disponible por sesión</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.sessionTime} onChange={e => handleChange('sessionTime', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="15-30">15-30 min</option>
            <option value="30-45">30-45 min</option>
            <option value="45-60">45-60 min</option>
          </select>
        </div>
      )}
      {/* Paso 3: Objetivos y metas */}
      {step === 2 && (
        <div>
          <label className="block mb-2 font-semibold">3. Objetivos principales</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {['pérdida de peso', 'ganar músculo', 'tonificar', 'mejorar resistencia', 'aumentar energía', 'reforzar salud mental'].map(goal => (
              <button key={goal} type="button" className={`px-3 py-1 rounded border ${form.mainGoals.includes(goal) ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'}`} onClick={() => handleMultiChange('mainGoals', goal)}>{goal}</button>
            ))}
          </div>
          <label className="block mb-2 font-semibold">Zonas del cuerpo a mejorar</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {['piernas', 'glúteos', 'abdomen', 'espalda', 'brazos', 'pecho'].map(area => (
              <button key={area} type="button" className={`px-3 py-1 rounded border ${form.targetAreas.includes(area) ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'}`} onClick={() => handleMultiChange('targetAreas', area)}>{area}</button>
            ))}
          </div>
        </div>
      )}
      {/* Paso 4: Salud y restricciones */}
      {step === 3 && (
        <div>
          <label className="block mb-2 font-semibold">4. Lesiones o condiciones físicas</label>
          <textarea className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={2} value={form.injuries} onChange={e => handleChange('injuries', e.target.value)} placeholder="¿Tienes lesiones, dolores o limitaciones físicas actuales?" />
          <label className="block mb-2 font-semibold">Historial de actividad</label>
          <textarea className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={2} value={form.activityHistory} onChange={e => handleChange('activityHistory', e.target.value)} placeholder="¿Qué tipo de actividad física has hecho anteriormente?" />
        </div>
      )}
      {/* Paso 5: Estado emocional y mental */}
      {step === 4 && (
        <div>
          <label className="block mb-2 font-semibold">5. Nivel de estrés / ansiedad / motivación</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.stressLevel} onChange={e => handleChange('stressLevel', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="1">1 - Nada</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5 - Mucho</option>
          </select>
          <label className="block mb-2 font-semibold">Autoestima y motivación</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.motivationLevel} onChange={e => handleChange('motivationLevel', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <textarea className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={2} value={form.motivationText} onChange={e => handleChange('motivationText', e.target.value)} placeholder="¿Qué te motiva más de este reto?" />
        </div>
      )}
      {/* Paso 6: Horario y disponibilidad */}
      {step === 5 && (
        <div>
          <label className="block mb-2 font-semibold">6. Horario preferido de entrenamiento</label>
          <select className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.trainingSchedule} onChange={e => handleChange('trainingSchedule', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="mañana">Mañana</option>
            <option value="mediodía">Mediodía</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche</option>
            <option value="variables">Variables</option>
          </select>
          <label className="block mb-2 font-semibold">Días disponibles para entrenar</label>
          <input className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="text" value={form.availableDays} onChange={e => handleChange('availableDays', e.target.value)} placeholder="Ej: Lunes, Miércoles, Viernes" />
        </div>
      )}
      {/* Paso 7: Experiencia previa */}
      {step === 6 && (
        <div>
          <label className="block mb-2 font-semibold">7. Entrenamientos anteriores</label>
          <textarea className="w-full p-2 rounded border bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={3} value={form.previousExperience} onChange={e => handleChange('previousExperience', e.target.value)} placeholder="Describe brevemente qué rutinas o apps has usado antes y qué resultados obtuviste." />
        </div>
      )}
      {/* Navegación */}
      <div className="flex justify-between mt-8">
        <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold" onClick={handleBack} disabled={step === 0}>{t('back')}</button>
        {step < steps.length - 1 ? (
          <button className="px-4 py-2 rounded bg-primary text-white font-bold" onClick={handleNext}>{t('next')}</button>
        ) : (
          <button className="px-4 py-2 rounded bg-primary text-white font-bold" onClick={handleFinish}>Generar plan</button>
        )}
      </div>
    </div>
  );
};

export default ExerciseChallengeForm; 