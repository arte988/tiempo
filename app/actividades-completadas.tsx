import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAppStore, Actividad } from './store/useAppStore';

type ActividadCompletada = Actividad;

type SeccionHistorial = {
  title: string;
  data: ActividadCompletada[];
};

const formateaTituloSeccion = (fecha?: Date) => {
  if (!fecha) {
    return 'Sin fecha';
  }

  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const inicioFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const diferencia = (inicioHoy.getTime() - inicioFecha.getTime()) / (1000 * 60 * 60 * 24);

  if (diferencia === 0) {
    return 'Hoy';
  }

  if (diferencia === 1) {
    return 'Ayer';
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
};

const agrupaPorFecha = (actividades: ActividadCompletada[]): SeccionHistorial[] => {
  const mapa = new Map<string, ActividadCompletada[]>();

  actividades.forEach((actividad) => {
    const titulo = formateaTituloSeccion(actividad.fechaCompletada);
    const grupo = mapa.get(titulo) ?? [];
    grupo.push(actividad);
    mapa.set(titulo, grupo);
  });

  return Array.from(mapa.entries()).map(([title, data]) => ({
    title,
    data,
  }));
};

export default function ActividadesCompletadasScreen() {
  const actividadesCompletadas = useAppStore((state) => state.getActividadesCompletadas());
  const reactivarActividad = useAppStore((state) => state.reactivarActividad);

  const secciones = useMemo(() => agrupaPorFecha(actividadesCompletadas), [actividadesCompletadas]);
  const estaVacio = actividadesCompletadas.length === 0;

  const handleReactivar = (actividadId: string) => {
    reactivarActividad(actividadId);
    router.push('/actividades-priorizadas');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hechas</Text>
        <View style={styles.headerSpacer} />
      </View>

      {estaVacio ? (
        <View style={styles.emptyState}>
          <Ionicons name="archive-outline" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Aun no completas tareas</Text>
          <Text style={styles.emptyDescription}>
            Cuando marques actividades como hechas, apareceran aqui para que puedas reactivarlas rapido.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.actividadItem}>
              <View style={styles.actividadInfo}>
                <Text style={styles.actividadTitulo}>{item.titulo}</Text>
                <Text style={styles.actividadHora}>
                  {item.fechaCompletada?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reactivarButton}
                onPress={() => handleReactivar(item.id)}
              >
                <Ionicons name="refresh" size={16} color="#137fec" />
                <Text style={styles.reactivarText}>Reactivar</Text>
              </TouchableOpacity>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.seccionTitulo}>{title}</Text>
          )}
          contentContainerStyle={styles.mainContent}
        />
      )}
    </View>
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
    backgroundColor: 'rgba(246, 247, 248, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 24,
  },
  mainContent: {
    paddingBottom: 16,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  actividadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: 'white',
  },
  actividadInfo: {
    flex: 1,
  },
  actividadTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  actividadHora: {
    fontSize: 13,
    color: '#6B7280',
  },
  reactivarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  reactivarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#137fec',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
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
});
