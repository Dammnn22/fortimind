# 🚀 Firebase Functions - Guía de Uso

## 📋 URLs de las Funciones

- **DeepSeek:** `https://us-central1-fortimind.cloudfunctions.net/callDeepSeek`
- **Gemini:** `https://us-central1-fortimind.cloudfunctions.net/callGemini`

## 🛠️ Cómo usar las funciones en React

### 1. Importar las funciones

```typescript
import { callDeepSeek, callGemini, testAIServices } from './services/aiService';
```

### 2. Ejemplo básico con DeepSeek

```typescript
import React, { useState } from 'react';
import { callDeepSeek } from './services/aiService';

const MyComponent = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskDeepSeek = async () => {
    setIsLoading(true);
    try {
      const result = await callDeepSeek("¿Cuál es el propósito del hombre sigma?");
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAskDeepSeek} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Preguntar a DeepSeek'}
      </button>
      <div>{response}</div>
    </div>
  );
};
```

### 3. Ejemplo con Gemini

```typescript
import React, { useState } from 'react';
import { callGemini } from './services/aiService';

const MyComponent = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskGemini = async () => {
    setIsLoading(true);
    try {
      const result = await callGemini("Dame consejos para mejorar mi disciplina");
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAskGemini} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Preguntar a Gemini'}
      </button>
      <div>{response}</div>
    </div>
  );
};
```

### 4. Probar ambas APIs al mismo tiempo

```typescript
import React, { useState } from 'react';
import { testAIServices } from './services/aiService';

const MyComponent = () => {
  const [results, setResults] = useState({ deepseek: '', gemini: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleTestBoth = async () => {
    setIsLoading(true);
    try {
      const result = await testAIServices("¿Cómo puedo superar la procrastinación?");
      setResults(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleTestBoth} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Probar ambas APIs'}
      </button>
      <div>
        <h3>DeepSeek:</h3>
        <p>{results.deepseek}</p>
        <h3>Gemini:</h3>
        <p>{results.gemini}</p>
      </div>
    </div>
  );
};
```

## 🧪 Probar sin React (Consola del navegador)

### DeepSeek
```javascript
fetch("https://us-central1-fortimind.cloudfunctions.net/callDeepSeek", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "¿Cuál es el propósito del hombre sigma?" }),
})
  .then(res => res.json())
  .then(data => console.log("Respuesta:", data))
  .catch(error => console.error("Error:", error));
```

### Gemini
```javascript
fetch("https://us-central1-fortimind.cloudfunctions.net/callGemini", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Dame consejos para mejorar mi disciplina" }),
})
  .then(res => res.json())
  .then(data => console.log("Respuesta:", data))
  .catch(error => console.error("Error:", error));
```

## 📱 Uso en useEffect

```typescript
import React, { useEffect, useState } from 'react';
import { callDeepSeek } from './services/aiService';

const MyComponent = () => {
  const [advice, setAdvice] = useState('');

  useEffect(() => {
    const getAdvice = async () => {
      try {
        const response = await callDeepSeek("Dame un consejo motivacional para hoy");
        setAdvice(response);
      } catch (error) {
        console.error('Error obteniendo consejo:', error);
      }
    };

    getAdvice();
  }, []);

  return (
    <div>
      <h2>Consejo del día:</h2>
      <p>{advice}</p>
    </div>
  );
};
```

## 🎯 Casos de uso específicos para FortiMind

### 1. Chat de emergencia
```typescript
const handleEmergencyChat = async (userMessage: string) => {
  const prompt = `El usuario está en crisis: "${userMessage}". 
  Dale una respuesta intensa y motivacional usando frases estoicas, 
  visualización del futuro y técnicas de respiración.`;
  
  const response = await callDeepSeek(prompt);
  return response;
};
```

### 2. Análisis de diario
```typescript
const analyzeJournalEntry = async (journalText: string) => {
  const prompt = `Analiza este extracto del diario del usuario: "${journalText}". 
  Identifica emociones dominantes, posibles gatillos y progreso personal. 
  Genera un resumen breve y da 1 consejo práctico.`;
  
  const analysis = await callGemini(prompt);
  return analysis;
};
```

### 3. Generador de rutinas de ejercicio
```typescript
const generateWorkout = async (day: number, level: string, location: string) => {
  const prompt = `Genera una rutina de ejercicio para:
  - Día: ${day}
  - Nivel: ${level}
  - Ubicación: ${location}
  
  Responde SOLO con un JSON válido.`;
  
  const workout = await callDeepSeek(prompt);
  return JSON.parse(workout);
};
```

## ⚠️ Manejo de errores

```typescript
const handleAICall = async (prompt: string) => {
  try {
    const response = await callDeepSeek(prompt);
    return response;
  } catch (error) {
    console.error('Error en la llamada a la IA:', error);
    
    // Manejar diferentes tipos de errores
    if (error.message.includes('429')) {
      return 'Error: Demasiadas solicitudes. Intenta de nuevo en unos minutos.';
    }
    
    if (error.message.includes('500')) {
      return 'Error: Problema en el servidor. Intenta de nuevo más tarde.';
    }
    
    return 'Error: No se pudo obtener una respuesta. Intenta de nuevo.';
  }
};
```

## 🔧 Configuración adicional

### Variables de entorno (opcional)
Si quieres usar las APIs directas en lugar de Firebase Functions, puedes configurar:

```env
DEEPSEEK_API_KEY=tu_api_key_aqui
GEMINI_API_KEY=tu_api_key_aqui
```

### Personalización de prompts
```typescript
const createPersonalizedPrompt = (userMessage: string, persona: string) => {
  return `Actúa como un mentor masculino especializado en ayudar a hombres a superar la adicción a la pornografía. 
  El usuario dice: "${userMessage}". 
  Responde con estilo directo, empático y motivacional.`;
};
```

## 📊 Monitoreo y logs

Las funciones incluyen logs automáticos para debugging:

```typescript
// Los logs aparecerán en la consola del navegador
console.log("Respuesta de DeepSeek:", data);
console.log("Respuesta de Gemini:", data);
console.error("Error llamando a DeepSeek:", error);
```

## 🚀 Próximos pasos

1. **Integrar en componentes existentes** de FortiMind
2. **Agregar manejo de estado** para respuestas múltiples
3. **Implementar caché** para respuestas frecuentes
4. **Agregar métricas** de uso y rendimiento
5. **Configurar rate limiting** en el frontend 