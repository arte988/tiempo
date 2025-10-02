-- Crear tabla Notas
CREATE TABLE IF NOT EXISTS public.Notas (
    id BIGSERIAL PRIMARY KEY,
    nota TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.Notas ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations on Notas" ON public.Notas
    FOR ALL USING (true) WITH CHECK (true);
