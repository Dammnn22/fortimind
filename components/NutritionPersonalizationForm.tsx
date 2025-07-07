import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface NutritionPersonalizationFormProps {
  onComplete: (data: NutritionPersonalizationData) => void;
}

export interface NutritionPersonalizationData {
  objetivo_nutricional: string;
  tipo_dieta: string;
  habitos_alimenticios: string;
  nivel_actividad: string;
  nivel_actividad_detalle: string;
  biometricos: {
    edad: string;
    sexo: string;
    altura: string;
    peso: string;
    grasa_corporal?: string;
  };
  condiciones_medicas: string;
  alergias_intolerancias: string;
  restricciones_culturales: string;
}

const initialState: NutritionPersonalizationData = {
  objetivo_nutricional: '',
  tipo_dieta: '',
  habitos_alimenticios: '',
  nivel_actividad: '',
  nivel_actividad_detalle: '',
  biometricos: { edad: '', sexo: '', altura: '', peso: '', grasa_corporal: '' },
  condiciones_medicas: '',
  alergias_intolerancias: '',
  restricciones_culturales: '',
};

const steps = [
  'objetivo_nutricional',
  'tipo_dieta',
  'habitos_alimenticios',
  'nivel_actividad',
  'biometricos',
  'condiciones_medicas',
  'alergias_intolerancias',
  'restricciones_culturales',
];

const NutritionPersonalizationForm: React.FC<NutritionPersonalizationFormProps> = ({ onComplete }) => {
  const [form, setForm] = useState<NutritionPersonalizationData>(initialState);
  const [step, setStep] = useState(0);
  const { t, currentLanguage } = useLocalization();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    if (field in form.biometricos) {
      setForm({ ...form, biometricos: { ...form.biometricos, [field]: value } });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));
  const handleFinish = () => onComplete(form);

  const isStepValid = () => {
    if (step === 4) {
      return (
        !!form.biometricos.edad &&
        !!form.biometricos.sexo &&
        !!form.biometricos.altura &&
        !!form.biometricos.peso
      );
    }
    if (step === 3) {
      return !!form.nivel_actividad && !!form.nivel_actividad_detalle;
    }
    return !!form[steps[step] as keyof NutritionPersonalizationData];
  };

  const validateBiometric = (field: string, value: string | null) => {
    const safeValue = value ?? '';
    if (field === 'edad') {
      const age = parseInt(safeValue);
      if (age < 13 || age > 99) {
        return 'La edad debe estar entre 13 y 99 años';
      }
    } else if (field === 'altura') {
      const height = parseInt(safeValue);
      if (height < 120 || height > 250) {
        return 'La altura debe estar entre 120 y 250 cm';
      }
    } else if (field === 'peso') {
      const weight = parseInt(safeValue);
      if (weight < 30 || weight > 250) {
        return 'El peso debe estar entre 30 y 250 kg';
      }
    } else if (field === 'grasa_corporal') {
      const grasa = parseFloat(safeValue);
      if (grasa < 5 || grasa > 50) {
        return 'El porcentaje de grasa corporal debe estar entre 5% y 50%';
      }
    }
    return null;
  };

  const handleValidationError = (field: string, error: string) => {
    setErrors({ ...errors, [field]: error });
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">{t('personalize_your_nutrition_plan')}</h2>
      {step === 0 && (
        <div>
          <label className="block mb-2 font-semibold">{t('what_is_your_nutritional_or_health_goal')}</label>
          <select className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.objetivo_nutricional} onChange={e => handleChange('objetivo_nutricional', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="pérdida de peso">{t('weight_loss')}</option>
            <option value="mantenimiento">{t('maintenance')}</option>
            <option value="ganancia muscular">{t('muscle_gain')}</option>
            <option value="mejorar energía">{t('improve_energy')}</option>
            <option value="control de glucemia">{t('blood_sugar_control')}</option>
            <option value="mejorar salud metabólica">{t('improve_metabolic_health')}</option>
            <option value="otro">{t('other')}</option>
          </select>
        </div>
      )}
      {step === 1 && (
        <div>
          <label className="block mb-2 font-semibold">{t('do_you_follow_any_specific_diet')}</label>
          <select className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.tipo_dieta} onChange={e => handleChange('tipo_dieta', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="omnivoro">{t('omnivore')}</option>
            <option value="vegetariano">{t('vegetarian')}</option>
            <option value="vegano">{t('vegan')}</option>
            <option value="cetogénico">{t('ketogenic')}</option>
            <option value="paleo">{t('paleo')}</option>
            <option value="ayuno intermitente">{t('intermittent_fasting')}</option>
            <option value="carnívoro">{t('carnivore')}</option>
            <option value="otro">{t('other')}</option>
          </select>
        </div>
      )}
      {step === 2 && (
        <div>
          <label className="block mb-2 font-semibold">{t('describe_your_current_eating_habits')}</label>
          <textarea className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={4} value={form.habitos_alimenticios} onChange={e => handleChange('habitos_alimenticios', e.target.value)} placeholder={t('number_of_meals_schedules_snacks_hydration_favorite_or_avoided_foods')} />
        </div>
      )}
      {step === 3 && (
        <div>
          <label className="block mb-2 font-semibold">{t('how_would_you_describe_your_weekly_exercise_routine')}</label>
          <select className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.nivel_actividad} onChange={e => handleChange('nivel_actividad', e.target.value)}>
            <option value="">{t('select_an_option')}</option>
            <option value="sedentario">{t('sedentary')}</option>
            <option value="ligero">{t('light')}</option>
            <option value="moderado">{t('moderate')}</option>
            <option value="activo/intenso">{t('active_intense')}</option>
          </select>
          <textarea className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={2} value={form.nivel_actividad_detalle} onChange={e => handleChange('nivel_actividad_detalle', e.target.value)} placeholder={t('type_of_exercise_frequency_sports')} />
        </div>
      )}
      {step === 4 && (
        <div>
          <label className="block mb-2 font-semibold">{t('biometric_data')}</label>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <input className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('age')} value={form.biometricos.edad} onChange={e => handleChange('edad', e.target.value)} min={13} inputMode="numeric" onBlur={e => handleValidationError('edad', (validateBiometric('edad', e.target.value) ?? '') as string)} />
            {errors.edad && <p className="text-red-500 text-sm">{errors.edad}</p>}
            <select className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={form.biometricos.sexo} onChange={e => handleChange('sexo', e.target.value)}>
              <option value="">{t('sex')}</option>
              <option value="masculino">{t('male')}</option>
              <option value="femenino">{t('female')}</option>
              <option value="otro">{t('other')}</option>
            </select>
            <input className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('height_cm')} value={form.biometricos.altura} onChange={e => handleChange('altura', e.target.value)} min={120} max={250} inputMode="numeric" onBlur={e => handleValidationError('altura', (validateBiometric('altura', e.target.value) ?? '') as string)} />
            {errors.altura && <p className="text-red-500 text-sm">{errors.altura}</p>}
            <input className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('weight_kg')} value={form.biometricos.peso} onChange={e => handleChange('peso', e.target.value)} min={30} max={250} inputMode="numeric" onBlur={e => handleValidationError('peso', (validateBiometric('peso', e.target.value) ?? '') as string)} />
            {errors.peso && <p className="text-red-500 text-sm">{errors.peso}</p>}
          </div>
          <input className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" type="number" placeholder={t('body_fat_percentage_optional')} value={form.biometricos.grasa_corporal} onChange={e => handleChange('grasa_corporal', e.target.value)} inputMode="numeric" onBlur={e => handleValidationError('grasa_corporal', (validateBiometric('grasa_corporal', e.target.value) ?? '') as string)} />
          {errors.grasa_corporal && <p className="text-red-500 text-sm">{errors.grasa_corporal}</p>}
        </div>
      )}
      {step === 5 && (
        <div>
          <label className="block mb-2 font-semibold">{t('do_you_have_any_relevant_medical_condition')}</label>
          <textarea className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={3} value={form.condiciones_medicas} onChange={e => handleChange('condiciones_medicas', e.target.value)} placeholder={t('diabetes_hypertension_cholesterol_digestive_thyroid')} />
        </div>
      )}
      {step === 6 && (
        <div>
          <label className="block mb-2 font-semibold">{t('are_you_allergic_or_intolerant_to_any_food')}</label>
          <textarea className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={2} value={form.alergias_intolerancias} onChange={e => handleChange('alergias_intolerancias', e.target.value)} placeholder={t('gluten_lactose_nuts_seafood')} />
        </div>
      )}
      {step === 7 && (
        <div>
          <label className="block mb-2 font-semibold">{t('do_you_have_cultural_or_religious_restrictions')}</label>
          <textarea className="w-full p-2 rounded border mb-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={2} value={form.restricciones_culturales} onChange={e => handleChange('restricciones_culturales', e.target.value)} placeholder={t('kosher_halal_fasts_religious_vegetarianism')} />
        </div>
      )}
      <div className="flex justify-between mt-8">
        <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold" onClick={handleBack} disabled={step === 0}>{t('back')}</button>
        {step < steps.length - 1 ? (
          <button className="px-4 py-2 rounded bg-primary text-white font-bold" onClick={handleNext} disabled={!isStepValid()}>{t('next')}</button>
        ) : (
          <button className="px-4 py-2 rounded bg-primary text-white font-bold" onClick={handleFinish}>{t('finish')}</button>
        )}
      </div>
    </div>
  );
};

export default NutritionPersonalizationForm; 