-- Insertar datos de ejemplo para desarrollo
INSERT INTO public.actividades (titulo, descripcion, duracion, es_quick_win, completada) VALUES
('Revisar correos electrónicos', 'Revisar y responder correos importantes', 5, true, false),
('Responder mensajes', 'Responder mensajes pendientes en WhatsApp y Slack', 5, true, false),
('Preparar presentación', 'Crear presentación para la reunión del viernes', 25, false, false),
('Investigar competidores', 'Analizar las estrategias de la competencia', 25, false, false),
('Planificar próximo sprint', 'Organizar tareas y prioridades para el siguiente sprint', 25, false, false),
('Revisar el informe de ventas', 'Revisar el informe de ventas del equipo de marketing', 25, true, true),
('Llamada de seguimiento con el cliente', 'Llamar al cliente para seguimiento del proyecto', 15, true, true),
('Preparar la presentación', 'Finalizar la presentación para la reunión', 30, false, true);

-- Actualizar fechas de actividades completadas
UPDATE public.actividades 
SET fecha_completada = NOW() - INTERVAL '2 hours'
WHERE completada = true AND id = 6;

UPDATE public.actividades 
SET fecha_completada = NOW() - INTERVAL '1 hour'
WHERE completada = true AND id = 7;

UPDATE public.actividades 
SET fecha_completada = NOW() - INTERVAL '30 minutes'
WHERE completada = true AND id = 8;
