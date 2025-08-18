// Cargar variables de entorno manualmente
import * as fs from 'fs'
import * as path from 'path'

// Función para cargar .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const envFile = fs.readFileSync(envPath, 'utf8')
    
    envFile.split('\n').forEach(line => {
      line = line.trim()
      if (line && !line.startsWith('#')) {
        const [key, ...values] = line.split('=')
        if (key && values.length > 0) {
          process.env[key] = values.join('=')
        }
      }
    })
    console.log('✅ Variables de entorno cargadas desde .env.local')
  } catch (error) {
    console.error('❌ Error cargando .env.local:', error)
  }
}

// Cargar variables antes de importar supabase
loadEnvFile()

import { supabase } from '../lib/supabase'
import { products } from '../data/products'
import type { CreateProductData } from '../types/product'

/**
 * Script para migrar los productos existentes a Supabase
 * Ejecutar con: npx tsx migrate-products.ts
 */

async function migrateProducts() {
  console.log('🚀 Iniciando migración de productos a Supabase...')
  console.log(`📦 Productos a migrar: ${products.length}`)

  let successCount = 0
  let errorCount = 0
  const errors: { id: number; error: string }[] = []

  for (const product of products) {
    try {
      // Preparar datos del producto para Supabase
      const productData: CreateProductData = {
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: 0, // Valor por defecto
        featured: false // Valor por defecto
      }

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()

      if (error) {
        console.error(`❌ Error al migrar producto ID ${product.id}:`, error.message)
        errors.push({ id: product.id, error: error.message })
        errorCount++
      } else {
        console.log(`✅ Producto migrado: ${product.name} (ID: ${product.id} -> ${data[0].id})`)
        successCount++
      }

      // Pequeña pausa para no sobrecargar la base de datos
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`❌ Error inesperado al migrar producto ID ${product.id}:`, error)
      errors.push({ id: product.id, error: String(error) })
      errorCount++
    }
  }

  console.log('\n📊 Resumen de migración:')
  console.log(`✅ Productos migrados exitosamente: ${successCount}`)
  console.log(`❌ Productos con errores: ${errorCount}`)

  if (errors.length > 0) {
    console.log('\n🚨 Errores encontrados:')
    errors.forEach(({ id, error }) => {
      console.log(`- Producto ID ${id}: ${error}`)
    })
  }

  console.log('\n🎉 Migración completada!')
}

// Función para crear marcas y categorías únicas
async function createBrandsAndCategories() {
  console.log('🏷️ Creando marcas y categorías...')

  // Extraer marcas únicas
  const uniqueBrands = [...new Set(products.map(p => p.brand))].sort()
  console.log(`📋 Marcas encontradas: ${uniqueBrands.length}`)

  // Extraer categorías únicas
  const uniqueCategories = [...new Set(products.map(p => p.category))].sort()
  console.log(`📋 Categorías encontradas: ${uniqueCategories.length}`)

  // Crear marcas
  for (const brandName of uniqueBrands) {
    try {
      const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      const { error } = await supabase
        .from('brands')
        .insert({
          name: brandName,
          slug,
          description: `Productos de la marca ${brandName}`
        })

      if (error && !error.message.includes('duplicate key')) {
        console.error(`❌ Error al crear marca ${brandName}:`, error.message)
      } else {
        console.log(`✅ Marca creada: ${brandName}`)
      }
    } catch (error) {
      console.error(`❌ Error inesperado al crear marca ${brandName}:`, error)
    }
  }

  // Crear categorías
  for (const categoryName of uniqueCategories) {
    try {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name: categoryName,
          slug,
          description: `Productos de la categoría ${categoryName}`
        })

      if (error && !error.message.includes('duplicate key')) {
        console.error(`❌ Error al crear categoría ${categoryName}:`, error.message)
      } else {
        console.log(`✅ Categoría creada: ${categoryName}`)
      }
    } catch (error) {
      console.error(`❌ Error inesperado al crear categoría ${categoryName}:`, error)
    }
  }
}

// Función principal
async function main() {
  try {
    console.log('🔌 Verificando conexión con Supabase...')
    
    // Verificar conexión
    const { data, error } = await supabase.from('products').select('count').single()
    
    if (error) {
      console.error('❌ Error de conexión con Supabase:', error.message)
      console.log('📝 Asegúrate de que:')
      console.log('1. Has configurado las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
      console.log('2. Has ejecutado el script SQL de schema.sql en tu proyecto de Supabase')
      console.log('3. Las tablas existen en tu base de datos')
      return
    }

    console.log('✅ Conexión con Supabase establecida')

    // Crear marcas y categorías primero
    await createBrandsAndCategories()

    console.log('\n⏱️ Esperando 2 segundos antes de migrar productos...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Migrar productos
    await migrateProducts()

  } catch (error) {
    console.error('💥 Error fatal durante la migración:', error)
  }
}

// Ejecutar migración
if (require.main === module) {
  main().catch(console.error)
}

export { migrateProducts, createBrandsAndCategories }
