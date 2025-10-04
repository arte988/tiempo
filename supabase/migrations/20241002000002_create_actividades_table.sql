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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_actividades_completada ON public.actividades(completada);
CREATE INDEX IF NOT EXISTS idx_actividades_es_quick_win ON public.actividades(es_quick_win);
CREATE INDEX IF NOT EXISTS idx_actividades_fecha_creacion ON public.actividades(fecha_creacion);
