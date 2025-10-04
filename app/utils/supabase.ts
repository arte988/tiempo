import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Configuración de Supabase:');
console.log('URL:', supabaseUrl ? 'Configurada ✅' : 'NO CONFIGURADA ❌');
console.log('Key:', supabaseKey ? 'Configurada ✅' : 'NO CONFIGURADA ❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ FALTAN VARIABLES DE ENTORNO DE SUPABASE');
  console.error('Asegúrate de que app.json contenga:');
  console.error('"extra": {');
  console.error('  "supabaseUrl": "tu_url_aqui",');
  console.error('  "supabaseKey": "tu_clave_aqui"');
  console.error('}');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
