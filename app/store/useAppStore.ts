import { create } from 'zustand';

export type ActividadEstado = 'pendiente' | 'completada' | 'cancelada';

export interface Subtarea {
  id: string;
  titulo: string;
  completada: boolean;
}

export interface Actividad {
  id: string;
  titulo: string;
  descripcion?: string;
  duracion: number; // minutos
  esQuickWin: boolean;
  estado: ActividadEstado;
  completada: boolean;
  fechaCreacion: Date;
  fechaCompletada?: Date;
  subtareas?: Subtarea[];
}

type NuevaActividad = {
  titulo: string;
  descripcion?: string;
  duracion: number;
  subtareas?: Subtarea[];
};

interface AppState {
  actividades: Actividad[];
  actividadActual: Actividad | null;
  tiempoPomodoro: number;
  isRunning: boolean;
  isPaused: boolean;

  agregarActividad: (payload: NuevaActividad) => void;
  actualizarActividad: (id: string, updates: Partial<Omit<Actividad, 'id' | 'fechaCreacion'>>) => void;
  eliminarActividad: (id: string) => void;
  completarActividad: (id: string) => void;
  cancelarActividad: (id: string) => void;
  reactivarActividad: (id: string) => void;
  setActividadActual: (actividad: Actividad | null) => void;

  setTiempoPomodoro: (tiempo: number) => void;
  iniciarPomodoro: () => void;
  pausarPomodoro: () => void;
  reanudarPomodoro: () => void;
  resetearPomodoro: () => void;

  getQuickWins: () => Actividad[];
  getTareasLargas: () => Actividad[];
  getActividadesCompletadas: () => Actividad[];
  findActividadById: (id: string) => Actividad | undefined;
}

const calculaQuickWin = (duracion: number) => duracion <= 5;

export const useAppStore = create<AppState>((set, get) => ({
  actividades: [],
  actividadActual: null,
  tiempoPomodoro: 25 * 60,
  isRunning: false,
  isPaused: false,

  agregarActividad: ({ titulo, descripcion, duracion, subtareas }) => {
    const esQuickWin = calculaQuickWin(duracion);
    const nuevaActividad: Actividad = {
      id: Date.now().toString(),
      titulo,
      descripcion,
      duracion,
      esQuickWin,
      estado: 'pendiente',
      completada: false,
      fechaCreacion: new Date(),
      subtareas,
    };

    set((state) => ({ actividades: [...state.actividades, nuevaActividad] }));
  },

  actualizarActividad: (id, updates) => {
    set((state) => ({
      actividades: state.actividades.map((actividad) => {
        if (actividad.id !== id) {
          return actividad;
        }

        const merged: Actividad = {
          ...actividad,
          ...updates,
        };

        if (updates.duracion !== undefined) {
          merged.duracion = updates.duracion;
          merged.esQuickWin = calculaQuickWin(updates.duracion);
        }

        if (updates.estado) {
          merged.estado = updates.estado;
          merged.completada = updates.estado === 'completada';
          merged.fechaCompletada = updates.estado === 'completada'
            ? new Date()
            : undefined;
        }

        return merged;
      }),
    }));
  },

  eliminarActividad: (id) => {
    set((state) => ({
      actividades: state.actividades.filter((actividad) => actividad.id !== id),
    }));
  },

  completarActividad: (id) => {
    set((state) => ({
      actividades: state.actividades.map((actividad) =>
        actividad.id === id
          ? {
              ...actividad,
              estado: 'completada',
              completada: true,
              fechaCompletada: new Date(),
            }
          : actividad
      ),
    }));
  },

  cancelarActividad: (id) => {
    set((state) => ({
      actividades: state.actividades.map((actividad) =>
        actividad.id === id
          ? {
              ...actividad,
              estado: 'cancelada',
              completada: false,
              fechaCompletada: undefined,
            }
          : actividad
      ),
    }));
  },

  reactivarActividad: (id) => {
    set((state) => ({
      actividades: state.actividades.map((actividad) =>
        actividad.id === id
          ? {
              ...actividad,
              estado: 'pendiente',
              completada: false,
              fechaCompletada: undefined,
            }
          : actividad
      ),
    }));
  },

  setActividadActual: (actividad) => {
    set({ actividadActual: actividad });
  },

  setTiempoPomodoro: (tiempo) => {
    set({ tiempoPomodoro: tiempo });
  },

  iniciarPomodoro: () => {
    set({ isRunning: true, isPaused: false });
  },

  pausarPomodoro: () => {
    set({ isPaused: true });
  },

  reanudarPomodoro: () => {
    set({ isPaused: false });
  },

  resetearPomodoro: () => {
    set({ tiempoPomodoro: 25 * 60, isRunning: false, isPaused: false });
  },

  getQuickWins: () => {
    return get()
      .actividades
      .filter((actividad) => actividad.estado === 'pendiente' && actividad.esQuickWin)
      .sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());
  },

  getTareasLargas: () => {
    return get()
      .actividades
      .filter((actividad) => actividad.estado === 'pendiente' && !actividad.esQuickWin)
      .sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());
  },

  getActividadesCompletadas: () => {
    return get()
      .actividades
      .filter((actividad) => actividad.estado === 'completada')
      .sort((a, b) => {
        const fechaA = a.fechaCompletada?.getTime() ?? 0;
        const fechaB = b.fechaCompletada?.getTime() ?? 0;
        return fechaB - fechaA;
      });
  },

  findActividadById: (id) => get().actividades.find((actividad) => actividad.id === id),
}));

