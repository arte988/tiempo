# App de Productividad — AGENTS.md

## Resumen
Aplicación de productividad que permite ingresar actividades en un recuadro de texto.  
La IA procesa las actividades, prioriza las que pueden hacerse en menos de 5 minutos (Quick Wins) y organiza el resto con temporizadores Pomodoro.  
Las actividades completadas pasan a un historial con opción de repetirlas o crear subtareas.

## Funcionalidades principales
- Entrada rápida de actividades (una o varias).
- Priorización automática por IA (Quick Wins arriba).
- Desglose en subtareas si la actividad lo indica.
- Temporizador Pomodoro con controles (iniciar, pausar, descanso, alarma).
- Sección de pendientes y sección de completadas.

## Flujo de usuario
1. El usuario ingresa actividades en el recuadro.
2. Se procesan con IA y se clasifican: Quick Wins o Tareas con Pomodoro.
3. El usuario puede ejecutar pomodoros con alarmas y descansos.
4. Al completar una tarea, esta se mueve al apartado de “Hechas”.

## Stack 
- **Frontend:** React Native + Vite + TypeScript
- **Estado:** Zustand o Redux Toolkit
- **DB Local:** Supabase
- **Estilo:** Tailwind CSS

## Componentes básicos
- `TaskInputCard`: entrada de actividades y botón procesar.
- `TaskList`: muestra Quick Wins y tareas pendientes.
- `PomodoroControls`: controles básicos de pomodoro.
- `DoneList`: historial de actividades completadas.

## Instrucciones Dev
- Crear proyecto con `pnpm create vite@latest app-productividad -- --template react-ts`.
- Instalar dependencias y configurar Tailwind.
- Implementar componentes básicos y lógica de IA (mock al inicio).

---
