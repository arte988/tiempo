import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Slot, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  const pathname = usePathname();

  const getNavStyle = (path: string) => ({
    iconColor: pathname === path ? '#137fec' : '#64748B',
    textColor: pathname === path ? styles.navTextActive : styles.navText,
  });

  return (
    <SafeAreaView style={styles.container}>
      <Slot />
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="add" size={24} color={getNavStyle('/').iconColor} />
          <Text style={getNavStyle('/').textColor}>Nuevo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/actividades-priorizadas')}>
          <Ionicons name="list" size={24} color={getNavStyle('/actividades-priorizadas').iconColor} />
          <Text style={getNavStyle('/actividades-priorizadas').textColor}>Actividades</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/actividades-completadas')}>
          <Ionicons name="checkbox" size={24} color={getNavStyle('/actividades-completadas').iconColor} />
          <Text style={getNavStyle('/actividades-completadas').textColor}>Hechas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/ajustes')}>
          <Ionicons name="settings" size={24} color={getNavStyle('/ajustes').iconColor} />
          <Text style={getNavStyle('/ajustes').textColor}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8' },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(246, 247, 248, 0.95)',
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 8 },
  navText: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  navTextActive: { fontSize: 12, fontWeight: '500', color: '#137fec' },
});