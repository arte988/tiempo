export interface Actividad {
  id: string;
  titulo: string;
  descripcion?: string;
  duracion: number; // en minutos
  esQuickWin: boolean;
  completada: boolean;
  fechaCreacion: Date;
  fechaCompletada?: Date;
  subtareas?: Subtarea[];
}

export interface Subtarea {
  id: string;
  titulo: string;
  completada: boolean;
}

export interface PomodoroState {
  tiempoRestante: number;
  isRunning: boolean;
  isPaused: boolean;
  minutos: string;
  segundos: string;
}

export type RootStackParamList = {
  index: undefined;
  'actividades-priorizadas': undefined;
  'detalle-actividad': {
    id: string;
    titulo: string;
    duracion: string;
    esQuickWin: string;
  };
  'actividades-completadas': undefined;
};
