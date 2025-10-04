# Tiempo - App de Productividad

Una aplicación de productividad que permite ingresar actividades en un recuadro de texto. La IA procesa las actividades, prioriza las que pueden hacerse en menos de 5 minutos (Quick Wins) y organiza el resto con temporizadores Pomodoro.

## 🚀 Características

- **Entrada rápida de actividades**: Ingresa una o varias actividades en un recuadro de texto
- **Priorización automática por IA**: Clasifica las actividades en Quick Wins (≤5 min) y tareas con Pomodoro (>5 min)
- **Temporizador Pomodoro**: Controles completos (iniciar, pausar, descanso, alarma)
- **Gestión de subtareas**: Desglose automático de actividades complejas
- **Historial de actividades**: Sección de actividades completadas con opción de repetir
- **Interfaz moderna**: Diseño limpio y responsive con modo oscuro

## 📱 Pantallas

1. **Pantalla Principal**: Entrada de actividades
2. **Actividades Priorizadas**: Lista de Quick Wins y tareas largas
3. **Detalle de Actividad**: Temporizador Pomodoro y subtareas
4. **Actividades Completadas**: Historial con opción de repetir

## 🛠️ Stack Tecnológico

- **Frontend**: React Native + Expo 51
- **Navegación**: Expo Router
- **Estado**: Zustand
- **Base de Datos**: Supabase
- **Estilo**: StyleSheet nativo
- **Iconos**: Expo Vector Icons

## 📦 Instalación

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI: `npm install -g @expo/cli`
- Cuenta de Expo (opcional, para desarrollo)

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd tiempo
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   
   Edita el archivo `app.json` y reemplaza las variables de entorno:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "TU_URL_DE_SUPABASE",
         "supabaseKey": "TU_CLAVE_ANONIMA_DE_SUPABASE"
       }
     }
   }
   ```

4. **Iniciar el servidor de desarrollo**
   Para iniciar la aplicación en tu red local:
   ```bash
   npm start
   ```
   Si necesitas conectarte desde un dispositivo en otra red (usando Expo Go), puedes usar un túnel:
   ```bash
   npx expo start --tunnel
   ```

5. **Ejecutar en dispositivo**
   - **iOS**: `npm run ios`
   - **Android**: `npm run android`
   - **Web**: `npm run web`

## 🗄️ Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia la URL y la clave anónima

### 2. Configurar la base de datos

Ejecuta la migración SQL en el editor de Supabase:

```sql
-- Crear tabla Actividades
CREATE TABLE IF NOT EXISTS public.actividades (
    id BIGSERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    duracion INTEGER NOT NULL, -- en minutos
    es_quick_win BOOLEAN DEFAULT false,
    completada BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completada TIMESTAMP WITH TIME ZONE,
    subtareas JSONB DEFAULT '[]'::jsonb
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations on actividades" ON public.actividades
    FOR ALL USING (true) WITH CHECK (true);
```

### 3. Configurar variables de entorno

Actualiza `app.json` con tus credenciales de Supabase:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://tu-proyecto.supabase.co",
      "supabaseKey": "tu-clave-anonima-aqui"
    }
  }
}
```

## 🎨 Personalización

### Colores

Los colores principales están definidos en los archivos de estilo:

- **Primary**: `#137fec` (azul)
- **Background Light**: `#f6f7f8` (gris claro)
- **Background Dark**: `#101922` (gris oscuro)

### Iconos

La aplicación usa Expo Vector Icons. Puedes cambiar los iconos editando las propiedades `name` en los componentes.

## 📱 Funcionalidades

### Quick Wins (≤5 minutos)
- Se muestran en la parte superior
- Botón "Finalizar" directo
- No requieren temporizador Pomodoro

### Tareas Largas (>5 minutos)
- Requieren temporizador Pomodoro
- Se pueden desglosar en subtareas
- Controles completos del temporizador

### Temporizador Pomodoro
- **Iniciar**: Comienza el temporizador
- **Pausar/Reanudar**: Pausa o reanuda el temporizador
- **Repetir**: Reinicia el temporizador
- **Descanso**: Cambia a 5 minutos de descanso

## 🚀 Despliegue

### Para desarrollo
```bash
npm start
```

### Para producción
```bash
expo build:android
expo build:ios
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de [Expo](https://docs.expo.dev/)
2. Revisa la documentación de [Supabase](https://supabase.com/docs)
3. Abre un issue en el repositorio

## 🎯 Roadmap

- [ ] Integración con IA para procesamiento de actividades
- [ ] Notificaciones push
- [ ] Sincronización en tiempo real
- [ ] Estadísticas de productividad
- [ ] Temas personalizables
- [ ] Exportación de datos
- [ ] Modo offline