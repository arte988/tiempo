import { useState, useEffect, useRef } from 'react'
import supabase from './ultis/supabase'
import './App.css'

// Tipo para las notas
interface Nota {
  id: number
  nota: string
}

function App() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [notaEditando, setNotaEditando] = useState<Nota | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Función para leer todas las notas
  const leerNotas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Intentando leer notas...')
      
      const { data, error } = await supabase
        .from('Notas')
        .select('*')
        .order('id', { ascending: false })

      console.log('Respuesta al leer notas:', { data, error })

      if (error) {
        console.error('Error al leer notas:', error)
        throw error
      }
      
      console.log('Notas cargadas:', data)
      setNotas(data || [])
    } catch (err) {
      console.error('Error completo al leer:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las notas')
    } finally {
      setLoading(false)
    }
  }

  // Función para crear una nueva nota
  const crearNota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaNota.trim()) return

    try {
      setLoading(true)
      setError(null)

      console.log('Intentando crear nota:', nuevaNota.trim())
      
      const { data, error } = await supabase
        .from('Notas')
        .insert([{ nota: nuevaNota.trim() }])
        .select()

      console.log('Respuesta de Supabase:', { data, error })

      if (error) {
        console.error('Error de Supabase:', error)
        
        // Mensaje específico para errores comunes
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          setError('Error de permisos: La tabla necesita configurar políticas de seguridad (RLS)')
        } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
          setError('Error: La tabla "Notas" no existe en la base de datos')
        } else {
          setError(`Error de Supabase: ${error.message}`)
        }
        return
      }
      
      console.log('Nota creada exitosamente:', data)
      setNuevaNota('')
      await leerNotas() // Recargar las notas
    } catch (err) {
      console.error('Error completo:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la nota')
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar una nota
  const actualizarNota = async (id: number, nuevaTexto: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('Notas')
        .update({ nota: nuevaTexto })
        .eq('id', id)

      if (error) throw error
      
      setNotaEditando(null)
      await leerNotas() // Recargar las notas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la nota')
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar una nota
  const eliminarNota = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('Notas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await leerNotas() // Recargar las notas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la nota')
    } finally {
      setLoading(false)
    }
  }

  // Cargar notas al montar el componente
  useEffect(() => {
    leerNotas()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Notas' },
        (payload) => {
          console.log('Cambio recibido:', payload)
          leerNotas() // Recargar notas cuando hay cambios
        }
      )
      .subscribe()

    // Cleanup: desuscribirse al desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Gestor de Notas
          </h1>
          <p className="text-gray-600">
            Crea, edita y elimina tus notas con Supabase
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Formulario para crear nueva nota */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ✨ Nueva Nota
          </h2>
          <form onSubmit={crearNota} className="flex gap-4">
            <input
              type="text"
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !nuevaNota.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '⏳' : '➕'} Agregar
            </button>
          </form>
        </div>

        {/* Lista de notas */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Mis Notas ({notas.length})
            </h2>
          </div>

          {loading && notas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
              <p>Cargando notas...</p>
            </div>
          ) : notas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">📝</p>
              <p>No hay notas aún. ¡Crea tu primera nota!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notas.map((nota) => (
                <div key={nota.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {notaEditando?.id === nota.id ? (
                    // Modo edición
                    <div className="flex gap-4 items-center">
                      <input
                        ref={editInputRef}
                        type="text"
                        defaultValue={nota.nota}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            actualizarNota(nota.id, e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setNotaEditando(null)
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (editInputRef.current) {
                            actualizarNota(nota.id, editInputRef.current.value)
                          }
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => setNotaEditando(null)}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    // Modo vista
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-gray-800 text-lg">{nota.nota}</p>
                        <p className="text-sm text-gray-500 mt-1">ID: {nota.id}</p>
      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setNotaEditando(nota)}
                          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                          title="Editar nota"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarNota(nota.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Eliminar nota"
                        >
                          🗑️
        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con información */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🔄 Actualizaciones en tiempo real activadas</p>
          <p>💾 Datos almacenados en Supabase</p>
        </div>
      </div>
    </div>
  )
}

export default App
