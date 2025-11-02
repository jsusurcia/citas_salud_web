# Citas Salud Web

Sistema web para gestión de citas médicas desarrollado con Vue 3 y Vite.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn** como gestor de paquetes
- **Git** (opcional)

## 🚀 Instalación y Configuración

### Paso 1: Verificar Node.js
```bash
node --version
```
Si no tienes Node.js, descárgalo desde [nodejs.org](https://nodejs.org/).

### Paso 2: Crear Entorno Virtual
```bash
cd citas_salud_web
npm install
```

### Paso 3: Ejecutar el Proyecto
```bash
npm run dev
```
El proyecto estará disponible en `http://localhost:5173`

## ⚙️ Configuración del Backend (FastAPI)

### 📍 Dónde se Conecta el Frontend

El frontend se conecta al backend FastAPI en el archivo:

```4:4:src/api/auth.js
const API_URL = 'http://127.0.0.1:8000';
```

### 🔧 Cómo Configurarlo

1. **Edita la URL del backend** en `src/api/auth.js`:
```javascript
// Cambia esta línea con la URL de tu backend FastAPI
const API_URL = 'http://127.0.0.1:8000';  // O la URL que uses
```

2. **Configura CORS en tu FastAPI** (muy importante):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configura CORS para permitir peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend Vue
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

3. **Endpoints que el frontend espera**:
   - `POST /administrador/login` - Para login (ya está implementado)

### 📝 Agregar Más Endpoints

Para agregar más llamadas API, crea funciones en `src/api/` siguiendo el patrón de `auth.js`:

```javascript
import axios from 'axios'
const API_URL = 'http://127.0.0.1:8000';

export const tuNuevaFuncion = async (datos) => {
  const res = await axios.post(`${API_URL}/tu-endpoint`, datos)
  return res.data
}
```

Luego importa y usa la función en tus componentes Vue.

## 🔧 Comandos Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Previsualiza build de producción
```

## 🛠️ Tecnologías Utilizadas

- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Herramienta de construcción y desarrollo
- **Vue Router** - Enrutamiento para aplicaciones Vue
- **Pinia** - Gestión de estado
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework de utilidades CSS
- **Flowbite** - Componentes basados en Tailwind
- **Font Awesome** - Biblioteca de iconos
- **Vue Cal** - Componente de calendario
- **Vue Advanced Chat** - Componente de chat avanzado

## 📁 Estructura del Proyecto

```
citas_salud_web/
├── public/              # Archivos estáticos
│   └── img/            # Imágenes
├── src/
│   ├── api/            # Configuración y llamadas a la API
│   ├── assets/         # Recursos (imágenes, fuentes, etc.)
│   ├── components/  # Componentes reutilizables
│   ├── composables/    # Composables de Vue
│   ├── router/         # Configuración de rutas
│   ├── stores/         # Stores de Pinia
│   ├── views/          # Vistas/páginas
│   ├── App.vue         # Componente raíz
│   ├── main.js         # Punto de entrada
│   └── style.css       # Estilos globales
├── index.html          # HTML principal
├── package.json        # Dependencias y scripts
└── vite.config.js      # Configuración de Vite
```

## 📝 Notas

- Backend debe estar corriendo antes de usar funciones que requieran API
- Tecnologías: Vue 3, Vite, Pinia, Tailwind CSS

## 🐛 Solución de Problemas

**Proyecto no inicia**: Verifica Node.js v18+, ejecuta `npm install`, revisa puerto 5173.

**Errores de API**: Verifica que el backend esté corriendo y revisa `src/api/auth.js` para la URL correcta.

---

Desarrollado con ❤️ usando Vue 3 + Vite
