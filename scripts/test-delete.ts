import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Cargar variables de entorno desde .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Environment check:')
console.log('URL exists:', !!supabaseUrl)
console.log('Key exists:', !!supabaseKey)
console.log('URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'EXISTS' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDelete() {
  try {
    console.log('Testing connection to Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseKey)
    
    // Primero, obtener un producto para probar
    const { data: products, error: selectError } = await supabase
      .from('products')
      .select('id, name, active')
      .limit(1)
    
    if (selectError) {
      console.error('Error selecting products:', selectError)
      return
    }
    
    if (!products || products.length === 0) {
      console.log('No products found to test with')
      return
    }
    
    const testProduct = products[0]
    console.log('Found test product:', testProduct)
    
    // Intentar actualizar el producto (soft delete)
    const { data, error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', testProduct.id)
      .select()
    
    if (error) {
      console.error('Error updating product:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('Success! Product updated:', data)
      
      // Revertir el cambio
      await supabase
        .from('products')
        .update({ active: true })
        .eq('id', testProduct.id)
      
      console.log('Product status reverted to active')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testDelete()
