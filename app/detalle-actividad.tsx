import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAppStore, Actividad } from './store/useAppStore';

const DURACION_PRESETS = [5, 15, 25, 45];

export default function DetalleActividadScreen() {
  const { id } = useLocalSearchParams();
  const actividadId = Array.isArray(id) ? id[0] : id;

  const actividad = useAppStore((state) =>
    actividadId ? state.findActividadById(actividadId) : undefined
  );
  const actualizarActividad = useAppStore((state) => state.actualizarActividad);
  const completarActividad = useAppStore((state) => state.completarActividad);
  const cancelarActividad = useAppStore((state) => state.cancelarActividad);
  const eliminarActividad = useAppStore((state) => state.eliminarActividad);

  const [tiempoRestante, setTiempoRestante] = useState(() => {
    const minutos = actividad?.duracion ?? 25;
    return minutos * 60;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalEdicionVisible, setModalEdicionVisible] = useState(false);
  const [tituloEdicion, setTituloEdicion] = useState('');
  const [duracionEdicion, setDuracionEdicion] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');

  useEffect(() => {
    if (actividad) {
      setTituloEdicion(actividad.titulo);
      setDuracionEdicion(String(actividad.duracion));
    }
  }, [actividad]);

  useEffect(() => {
    if (actividad) {
      setTiempoRestante(actividad.duracion * 60);
    }
  }, [actividad?.duracion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, tiempoRestante]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: remainingSeconds.toString().padStart(2, '0'),
    };
  };

  const handleIniciar = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePausar = () => {
    setIsPaused(!isPaused);
  };

  const handleRepetir = () => {
    setTiempoRestante((actividad?.duracion ?? 25) * 60);
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleDescanso = () => {
    setTiempoRestante(5 * 60);
    setIsRunning(true);
    setIsPaused(false);
  };

  const cerrarDetalle = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/actividades-priorizadas');
    }
  };

  const handleFinalizar = () => {
    if (!actividad) {
      return;
    }
    completarActividad(actividad.id);
    cerrarDetalle();
  };

  const handleEditar = () => {
    setMenuVisible(false);
    setModalEdicionVisible(true);
    setErrorEdicion('');
  };

  const handleCancelar = () => {
    if (!actividad) {
      return;
    }
    cancelarActividad(actividad.id);
    setMenuVisible(false);
    cerrarDetalle();
  };

  const handleEliminar = () => {
    if (!actividad) {
      return;
    }
    eliminarActividad(actividad.id);
    setMenuVisible(false);
    cerrarDetalle();
  };

  const handleGuardarEdicion = () => {
    if (!actividad) {
      return;
    }

    if (!tituloEdicion.trim()) {
      setErrorEdicion('El titulo no puede estar vacio.');
      return;
    }

    const duracionNumero = Number.parseInt(duracionEdicion, 10);
    if (!Number.isFinite(duracionNumero) || duracionNumero <= 0) {
      setErrorEdicion('Ingresa una duracion valida en minutos.');
      return;
    }

    actualizarActividad(actividad.id, {
      titulo: tituloEdicion.trim(),
      duracion: duracionNumero,
    });

    setModalEdicionVisible(false);
    setTiempoRestante(duracionNumero * 60);
  };

  const subtareas = useMemo(() => {
    if (actividad?.subtareas && actividad.subtareas.length > 0) {
      return actividad.subtareas;
    }
    return [
      { id: '1', titulo: 'Describir pasos principales', completada: false },
      { id: '2', titulo: 'Preparar recursos necesarios', completada: false },
      { id: '3', titulo: 'Reservar espacio en agenda', completada: false },
    ];
  }, [actividad?.subtareas]);

  const { minutes, seconds } = formatTime(Math.max(tiempoRestante, 0));

  if (!actividadId || !actividad) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Actividad no disponible</Text>
          <Text style={styles.emptyDescription}>
            No encontramos la informacion solicitada. Regresa y selecciona una actividad valida.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={cerrarDetalle}>
            <Text style={styles.emptyButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={cerrarDetalle}
        >
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actividad</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        <View style={styles.actividadInfo}>
          <Text style={styles.actividadTitulo}>{actividad.titulo}</Text>
          <Text style={styles.actividadDescripcion}>
            Duracion estimada: {actividad.duracion} min
          </Text>
        </View>

        <View style={styles.pomodoroSection}>
          <Text style={styles.sectionTitle}>Pomodoro</Text>

          <View style={styles.timerContainer}>
            <View style={styles.timeDisplay}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{minutes}</Text>
                <Text style={styles.timeLabel}>Minutos</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{seconds}</Text>
                <Text style={styles.timeLabel}>Segundos</Text>
              </View>
            </View>

            <View style={styles.controlsGrid}>
              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={handleIniciar}
                disabled={isRunning && !isPaused}
              >
                <Text style={styles.primaryButtonText}>Iniciar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={handlePausar}
                disabled={!isRunning}
              >
                <Text style={styles.secondaryButtonText}>
                  {isPaused ? 'Reanudar' : 'Pausar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={handleRepetir}
              >
                <Text style={styles.secondaryButtonText}>Repetir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={handleDescanso}
              >
                <Text style={styles.secondaryButtonText}>Descanso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.subtareasSection}>
          <Text style={styles.sectionTitle}>Subtareas</Text>
          <View style={styles.subtareasList}>
            {subtareas.map((subtarea) => (
              <TouchableOpacity key={subtarea.id} style={styles.subtareaItem}>
                <Text style={styles.subtareaText}>{subtarea.titulo}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.finalizarContainer}>
        <TouchableOpacity style={styles.finalizarButton} onPress={handleFinalizar}>
          <Text style={styles.finalizarButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditar}>
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.menuItemText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleCancelar}>
              <Text style={styles.menuItemText}>Cancelar actividad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleEliminar}>
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        visible={modalEdicionVisible}
        animationType="fade"
        onRequestClose={() => setModalEdicionVisible(false)}
      >
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Editar actividad</Text>
            <TouchableOpacity
              style={styles.editClose}
              onPress={() => setModalEdicionVisible(false)}
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.editLabel}>Titulo</Text>
            <View style={styles.editInputWrapper}>
              <TextInput
                style={styles.editInput}
                value={tituloEdicion}
                onChangeText={setTituloEdicion}
                placeholder="Titulo"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text style={styles.editLabel}>Duracion (minutos)</Text>
            <View style={styles.editInputWrapper}>
              <TextInput
                style={styles.editInput}
                value={duracionEdicion}
                onChangeText={setDuracionEdicion}
                placeholder="25"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.editPresetRow}>
              {DURACION_PRESETS.map((valor) => (
                <TouchableOpacity
                  key={valor}
                  style={styles.editPresetButton}
                  onPress={() => setDuracionEdicion(String(valor))}
                >
                  <Text style={styles.editPresetText}>{valor} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errorEdicion ? <Text style={styles.editError}>{errorEdicion}</Text> : null}
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={() => setModalEdicionVisible(false)}
              >
                <Text style={styles.editActionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionButton, styles.editActionPrimary]}
                onPress={handleGuardarEdicion}
              >
                <Text style={[styles.editActionText, styles.editActionPrimaryText]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(246, 247, 248, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0F172A',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 24,
  },
  actividadInfo: {
    gap: 8,
  },
  actividadTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  actividadDescripcion: {
    fontSize: 16,
    color: '#64748B',
  },
  pomodoroSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  timerContainer: {
    gap: 24,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timeBox: {
    flex: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  controlButton: {
    flex: 1,
    minWidth: '45%',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#137fec',
  },
  secondaryButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtareasSection: {
    gap: 12,
  },
  subtareasList: {
    gap: 8,
  },
  subtareaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  subtareaText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  finalizarContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  finalizarButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finalizarButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 220,
    gap: 4,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
  },
  menuItemTextDanger: {
    color: '#EF4444',
  },
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    paddingTop: 32,
    gap: 12,
    position: 'relative',
  },
  editClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  editInputWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  editInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  editPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editPresetButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  editPresetText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
  },
  editError: {
    fontSize: 12,
    color: '#DC2626',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  editActionPrimary: {
    backgroundColor: '#137fec',
  },
  editActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  editActionPrimaryText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#137fec',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});





