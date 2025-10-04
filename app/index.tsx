import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAppStore } from './store/useAppStore';

const DURACION_PRESETS = [5, 15, 25, 45];

export default function HomeScreen() {
  const agregarActividad = useAppStore((state) => state.agregarActividad);

  const [nuevaActividad, setNuevaActividad] = useState('');
  const [duracionModalVisible, setDuracionModalVisible] = useState(false);
  const [duracionInput, setDuracionInput] = useState('25');
  const [duracionError, setDuracionError] = useState('');
  const [titulosPendientes, setTitulosPendientes] = useState<string[]>([]);

  const abrirModalDuracion = (titulos: string[]) => {
    setTitulosPendientes(titulos);
    setDuracionModalVisible(true);
    setDuracionError('');
  };

  const handleEnviar = () => {
    const titulos = nuevaActividad
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean);

    if (titulos.length === 0) {
      return;
    }

    abrirModalDuracion(titulos);
  };

  const handleConfirmarDuracion = () => {
    const minutos = Number.parseInt(duracionInput, 10);

    if (!Number.isFinite(minutos) || minutos <= 0) {
      setDuracionError('Ingresa la duración en minutos (valor numérico mayor a 0).');
      return;
    }

    titulosPendientes.forEach((titulo) => {
      agregarActividad({
        titulo,
        descripcion: titulo,
        duracion: minutos,
      });
    });

    setDuracionModalVisible(false);
    setDuracionInput(String(minutos));
    setNuevaActividad('');
    setTitulosPendientes([]);
    router.push('/actividades-priorizadas');
  };

  const handleCancelarModal = () => {
    setDuracionModalVisible(false);
    setTitulosPendientes([]);
    setDuracionError('');
  };

  const handleSeleccionRapida = (minutos: number) => {
    setDuracionInput(String(minutos));
    setDuracionError('');
  };

  const botonEnviarDeshabilitado = !nuevaActividad.trim();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Actividades</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color="#137fec" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
          <Text style={styles.dateTitle}>Hoy</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Que quieres hacer hoy? (usa saltos de linea para varias tareas)"
              placeholderTextColor="#9CA3AF"
              value={nuevaActividad}
              onChangeText={setNuevaActividad}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendButton, botonEnviarDeshabilitado && styles.sendButtonDisabled]}
            onPress={handleEnviar}
            disabled={botonEnviarDeshabilitado}
          >
            <Text style={styles.sendButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent
        visible={duracionModalVisible}
        onRequestClose={handleCancelarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cuanto tiempo tomara?</Text>
            <Text style={styles.modalSubtitle}>
              Usa minutos para estimar la duración de la actividad.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={duracionInput}
              onChangeText={setDuracionInput}
              keyboardType="number-pad"
              placeholder="25"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalPresets}>
              {DURACION_PRESETS.map((valor) => (
                <TouchableOpacity
                  key={valor}
                  style={styles.presetButton}
                  onPress={() => handleSeleccionRapida(valor)}
                >
                  <Text style={styles.presetButtonText}>{valor} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            {duracionError ? <Text style={styles.modalError}>{duracionError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalAction} onPress={handleCancelarModal}>
                <Text style={styles.modalActionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalAction, styles.modalActionPrimary]} onPress={handleConfirmarDuracion}>
                <Text style={[styles.modalActionText, styles.modalActionPrimaryText]}>Guardar</Text>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#f6f7f8',
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
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
  },
  addButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputContainer: {
    flex: 1,
  },
  textArea: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
  },
  footer: {
    backgroundColor: '#f6f7f8',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  sendButton: {
    margin: 16,
    backgroundColor: '#137fec',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0F172A',
  },
  modalPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(19, 127, 236, 0.12)',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#137fec',
  },
  modalError: {
    color: '#DC2626',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalAction: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  modalActionPrimary: {
    backgroundColor: '#137fec',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalActionPrimaryText: {
    color: '#FFFFFF',
  },
});

