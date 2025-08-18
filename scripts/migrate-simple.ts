/**
 * Script simple para migrar productos a Supabase
 * Define las credenciales directamente para evitar problemas con variables de entorno
 */

// Definir credenciales directamente
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://rqejopgdigifoyohmnke.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZWpvcGdkaWdpZm95b2htbmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzMzODcsImV4cCI6MjA3MTEwOTM4N30.jbGgL-UHwworOJMRDcN5E0FJ5xpJq9bBCF_-bvDNrcA'

import { createClient } from '@supabase/supabase-js'
import { products } from '../data/products'

// Crear cliente de Supabase
const supabase = createClient(
  'https://rqejopgdigifoyohmnke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZWpvcGdkaWdpZm95b2htbmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzMzODcsImV4cCI6MjA3MTEwOTM4N30.jbGgL-UHwworOJMRDcN5E0FJ5xpJq9bBCF_-bvDNrcA'
)

async function migrateProducts() {
  console.log('🚀 Iniciando migración de productos a Supabase...')
  console.log(`📦 Productos a migrar: ${products.length}`)

  // Verificar conexión primero
  console.log('🔌 Verificando conexión con Supabase...')
  
  try {
    const { count, error: testError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (testError) {
      console.error('❌ Error de conexión:', testError.message)
      if (testError.message.includes('relation "products" does not exist')) {
        console.log('📝 ¡IMPORTANTE! Primero debes ejecutar el schema SQL en Supabase:')
        console.log('1. Ve a https://rqejopgdigifoyohmnke.supabase.co')
        console.log('2. Abre el SQL Editor')
        console.log('3. Ejecuta el contenido completo del archivo supabase/schema.sql')
        return
      }
      return
    }

    console.log(`✅ Conexión exitosa. Productos existentes en BD: ${count}`)
  } catch (error) {
    console.error('💥 Error fatal de conexión:', error)
    return
  }

  let successCount = 0
  let errorCount = 0
  const errors: { id: number; error: string }[] = []

  // Crear marcas y categorías únicas primero
  await createBrandsAndCategories()

  console.log('\n📦 Migrando productos...')

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    
    try {
      // Preparar datos del producto
      const productData = {
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: 0,
        featured: false
      }

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()

      if (error) {
        console.error(`❌ Error producto ${i + 1}/${products.length} (ID ${product.id}):`, error.message)
        errors.push({ id: product.id, error: error.message })
        errorCount++
      } else {
        console.log(`✅ ${i + 1}/${products.length} - ${product.name} (ID: ${product.id} -> ${data[0].id})`)
        successCount++
      }

      // Pausa para no sobrecargar
      if (i % 10 === 0 && i > 0) {
        console.log(`⏸️ Pausa... (${i}/${products.length} procesados)`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

    } catch (error) {
      console.error(`❌ Error inesperado producto ${i + 1} (ID ${product.id}):`, error)
      errors.push({ id: product.id, error: String(error) })
      errorCount++
    }
  }

  console.log('\n📊 Resumen de migración:')
  console.log(`✅ Productos migrados exitosamente: ${successCount}`)
  console.log(`❌ Productos con errores: ${errorCount}`)

  if (errors.length > 0) {
    console.log('\n🚨 Errores encontrados:')
    errors.slice(0, 10).forEach(({ id, error }) => {
      console.log(`- Producto ID ${id}: ${error}`)
    })
    if (errors.length > 10) {
      console.log(`... y ${errors.length - 10} errores más`)
    }
  }

  console.log('\n🎉 Migración completada!')
}

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
        console.error(`❌ Error marca ${brandName}:`, error.message)
      } else if (!error) {
        console.log(`✅ Marca: ${brandName}`)
      }
    } catch (error) {
      console.error(`❌ Error inesperado marca ${brandName}:`, error)
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
        console.error(`❌ Error categoría ${categoryName}:`, error.message)
      } else if (!error) {
        console.log(`✅ Categoría: ${categoryName}`)
      }
    } catch (error) {
      console.error(`❌ Error inesperado categoría ${categoryName}:`, error)
    }
  }
}

// Ejecutar migración
migrateProducts().catch(console.error)
