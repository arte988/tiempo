import React, { useMemo, useState } from 'react';
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
import { router } from 'expo-router';

import { useAppStore, Actividad } from './store/useAppStore';

const DURACION_PRESETS = [5, 15, 25, 45];

type CategoriaLista = {
  titulo: string;
  actividades: Actividad[];
};

export default function ActividadesPriorizadasScreen() {
  const actividades = useAppStore((state) => state.actividades);
  const { quickWins, tareasLargas } = useMemo(() => {
    const quick: Actividad[] = [];
    const largas: Actividad[] = [];

    actividades.forEach((actividad) => {
      if (actividad.estado !== 'pendiente') {
        return;
      }

      if (actividad.esQuickWin) {
        quick.push(actividad);
      } else {
        largas.push(actividad);
      }
    });

    quick.sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());
    largas.sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());

    return { quickWins: quick, tareasLargas: largas };
  }, [actividades]);

  const completarActividad = useAppStore((state) => state.completarActividad);
  const cancelarActividad = useAppStore((state) => state.cancelarActividad);
  const eliminarActividad = useAppStore((state) => state.eliminarActividad);
  const actualizarActividad = useAppStore((state) => state.actualizarActividad);

  const [actividadMenu, setActividadMenu] = useState<Actividad | null>(null);
  const [actividadEdicion, setActividadEdicion] = useState<Actividad | null>(null);
  const [tituloEdicion, setTituloEdicion] = useState('');
  const [duracionEdicion, setDuracionEdicion] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');

  const secciones = useMemo<CategoriaLista[]>(() => [
    { titulo: '5 minutos o menos', actividades: quickWins },
    { titulo: 'Mas de 5 minutos', actividades: tareasLargas },
  ], [quickWins, tareasLargas]);

  const abrirEdicion = (actividad: Actividad) => {
    setActividadMenu(null);
    setActividadEdicion(actividad);
    setTituloEdicion(actividad.titulo);
    setDuracionEdicion(String(actividad.duracion));
    setErrorEdicion('');
  };

  const handleGuardarEdicion = () => {
    if (!actividadEdicion) {
      return;
    }

    const duracionNumero = Number.parseInt(duracionEdicion, 10);

    if (!tituloEdicion.trim()) {
      setErrorEdicion('El titulo no puede estar vacio.');
      return;
    }

    if (!Number.isFinite(duracionNumero) || duracionNumero <= 0) {
      setErrorEdicion('Ingresa una duracion valida en minutos.');
      return;
    }

    actualizarActividad(actividadEdicion.id, {
      titulo: tituloEdicion.trim(),
      descripcion: actividadEdicion.descripcion,
      duracion: duracionNumero,
    });

    setActividadEdicion(null);
  };

  const handleFinalizar = (actividadId: string) => {
    completarActividad(actividadId);
    setActividadMenu(null);
  };

  const handleCancelar = (actividadId: string) => {
    cancelarActividad(actividadId);
    setActividadMenu(null);
  };

  const handleEliminar = (actividadId: string) => {
    eliminarActividad(actividadId);
    setActividadMenu(null);
  };

  const handleIrADetalle = (actividad: Actividad) => {
    router.push({ pathname: '/detalle-actividad', params: { id: actividad.id } });
  };

  const contenidoVacio = quickWins.length === 0 && tareasLargas.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Actividades</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="add-circle" size={32} color="#137fec" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        {contenidoVacio ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No hay pendientes</Text>
            <Text style={styles.emptyDescription}>
              Agrega una nueva actividad desde la pantalla principal para empezar.
            </Text>
          </View>
        ) : (
          secciones.map((seccion) => (
            <View key={seccion.titulo} style={styles.section}>
              <Text style={styles.sectionTitle}>{seccion.titulo}</Text>
              <View style={styles.actividadesList}>
                {seccion.actividades.map((actividad) => (
                  <View key={actividad.id} style={styles.actividadCard}>
                    <TouchableOpacity
                      style={styles.actividadContent}
                      onPress={() => handleIrADetalle(actividad)}
                    >
                      <View style={styles.actividadInfo}>
                        <Text style={styles.actividadTitulo}>{actividad.titulo}</Text>
                        <Text style={styles.actividadDuracion}>
                          {actividad.duracion} min
                        </Text>
                        {actividad.esQuickWin ? (
                          <View style={styles.quickTag}>
                            <Text style={styles.quickTagText}>Quick win</Text>
                          </View>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setActividadMenu(actividad)}
                      >
                        <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleIrADetalle(actividad)}
                      >
                        <Ionicons name="timer-outline" size={16} color="#137fec" />
                        <Text style={styles.actionText}>Pomodoro</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => handleFinalizar(actividad.id)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                        <Text style={[styles.actionText, styles.completeButtonText]}>Finalizar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        transparent
        visible={Boolean(actividadMenu)}
        animationType="fade"
        onRequestClose={() => setActividadMenu(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActividadMenu(null)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => actividadMenu && abrirEdicion(actividadMenu)}
            >
              <Ionicons name="create-outline" size={16} color="#374151" />
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => actividadMenu && handleCancelar(actividadMenu.id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#F97316" />
              <Text style={styles.menuItemText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => actividadMenu && handleFinalizar(actividadMenu.id)}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#10B981" />
              <Text style={styles.menuItemText}>Marcar como hecha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => actividadMenu && handleEliminar(actividadMenu.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        visible={Boolean(actividadEdicion)}
        animationType="fade"
        onRequestClose={() => setActividadEdicion(null)}
      >
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Editar actividad</Text>
            <TextInput
              style={styles.editInput}
              value={tituloEdicion}
              onChangeText={setTituloEdicion}
              placeholder="Titulo"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={styles.editInput}
              value={duracionEdicion}
              onChangeText={setDuracionEdicion}
              placeholder="Duracion (min)"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
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
                onPress={() => setActividadEdicion(null)}
              >
                <Text style={styles.editActionText}>Cerrar</Text>
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
    backgroundColor: 'rgba(246, 247, 248, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0F172A',
  },
  addButton: {
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
    gap: 24,
    paddingBottom: 96,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  actividadesList: {
    gap: 16,
  },
  actividadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  actividadContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  actividadInfo: {
    flex: 1,
    gap: 4,
  },
  actividadTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  actividadDuracion: {
    fontSize: 14,
    color: '#64748B',
  },
  quickTag: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  quickTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
  },
  menuButton: {
    padding: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#137fec',
  },
  completeButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  completeButtonText: {
    color: '#047857',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    gap: 12,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  editInput: {
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 8,
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
});

