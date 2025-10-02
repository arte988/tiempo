
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Configuración de Supabase:');
console.log('URL:', supabaseUrl ? 'Configurada ✅' : 'NO CONFIGURADA ❌');
console.log('Key:', supabaseKey ? 'Configurada ✅' : 'NO CONFIGURADA ❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ FALTAN VARIABLES DE ENTORNO DE SUPABASE');
  console.error('Asegúrate de que .env contenga:');
  console.error('VITE_SUPABASE_URL=tu_url_aqui');
  console.error('VITE_SUPABASE_ANON_KEY=tu_clave_aqui');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
