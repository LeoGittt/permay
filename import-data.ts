// import-data.ts

import { supabase } from './lib/supabase'; // Asegúrate de que la ruta sea correcta
import { products } from './data/products'; // Importa el array de productos

async function importarProductos() {
  console.log('Iniciando la importación de productos...');

  // El método .insert() recibe un array de objetos
  const { data, error } = await supabase
    .from('productos')
    .insert(products);

  if (error) {
    console.error('Error al insertar los productos:', error);
  } else {
    console.log('¡Productos insertados con éxito!');
    console.log('Total de productos importados:', products.length);
    console.log(data); // Muestra los datos insertados
  }
}

importarProductos();