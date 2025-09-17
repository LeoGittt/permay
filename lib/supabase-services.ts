import { supabase } from './supabase'
import type { Product, CreateProductData, UpdateProductData, Brand, Category, Order, CreateOrderData } from '@/types/product'

// ===================== STORAGE DE IMÁGENES =====================

export const imageService = {
  async uploadImage(file: File): Promise<string> {
    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen')
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no puede superar los 5MB')
      }

      // Crear nombre único para el archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const fileName = `product_${timestamp}_${randomString}.${extension}`

      // Subir archivo al bucket 'product-images'
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        throw new Error('Error al subir la imagen')
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadImage:', error)
      throw error
    }
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Solo eliminar si es una imagen de nuestro storage
      if (!imageUrl.includes('supabase') || !imageUrl.includes('product-images')) {
        return // No es una imagen de nuestro storage, no hacer nada
      }

      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage
        .from('product-images')
        .remove([fileName])

      if (error) {
        console.error('Error deleting image:', error)
        // No lanzar error aquí, es mejor que el producto se elimine aunque la imagen no
      }
    } catch (error) {
      console.error('Error in deleteImage:', error)
      // No lanzar error, es mejor que continue con la operación principal
    }
  }
}

// ===================== PRODUCTOS =====================

export const productService = {
  // Función helper para búsqueda fuzzy
  applyFuzzySearch(products: Product[], searchTerm: string): Product[] {
    // Función para normalizar texto (remover acentos, convertir a minúsculas)
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales con espacios
        .replace(/\s+/g, ' ') // Normalizar espacios múltiples
        .trim()
    }

    // Lista de palabras de parada/conectores que no son relevantes para la búsqueda
    const stopWords = new Set([
      'de', 'del', 'la', 'el', 'en', 'con', 'para', 'por', 'sin', 'y', 'o', 'un', 'una', 'los', 'las'
    ])

    // Dividir el término de búsqueda en palabras individuales y filtrar palabras de parada
    const allSearchTerms = normalizeText(searchTerm)
      .split(/\s+/)
      .filter(term => term.length > 0)
    
    // Separar palabras importantes de las palabras de parada
    const importantTerms = allSearchTerms.filter(term => !stopWords.has(term))
    const hasStopWords = allSearchTerms.length > importantTerms.length

    // Si no hay términos importantes, usar todos los términos
    const searchTerms = importantTerms.length > 0 ? importantTerms : allSearchTerms

    if (searchTerms.length === 0) return products

    // Filtrar productos que contengan las palabras importantes
    const filteredProducts = products.filter(product => {
      // Combinar todos los campos de texto del producto y normalizarlos
      const productText = normalizeText([
        product.name || '',
        product.description || '',
        product.brand || '',
        product.category || ''
      ].join(' '))

      // Si hay palabras de parada, ser más flexible: al menos el 70% de palabras importantes deben estar
      if (hasStopWords && searchTerms.length > 1) {
        const matches = searchTerms.filter(term => productText.includes(term)).length
        const threshold = Math.max(1, Math.ceil(searchTerms.length * 0.7))
        return matches >= threshold
      }
      
      // Para búsquedas sin palabras de parada, mantener la lógica original (todas las palabras)
      return searchTerms.every(term => productText.includes(term))
    })

    // Ordenar por relevancia
    return filteredProducts.sort((a, b) => {
      const aName = normalizeText(a.name || '')
      const bName = normalizeText(b.name || '')
      const aBrand = normalizeText(a.brand || '')
      const bBrand = normalizeText(b.brand || '')
      
      // Calcular puntuación de relevancia usando solo palabras importantes
      const calculateScore = (product: Product): number => {
        const name = normalizeText(product.name || '')
        const brand = normalizeText(product.brand || '')
        const description = normalizeText(product.description || '')
        
        let score = 0
        
        // Usar solo las palabras importantes para el cálculo de relevancia
        searchTerms.forEach(term => {
          // Coincidencias en el nombre tienen mayor peso
          if (name.includes(term)) {
            score += name.startsWith(term) ? 10 : 5 // Inicio del nombre = más relevante
          }
          // Coincidencias en la marca
          if (brand.includes(term)) {
            score += brand.startsWith(term) ? 8 : 3
          }
          // Coincidencias en la descripción
          if (description.includes(term)) {
            score += 1
          }
        })
        
        return score
      }
      
      const aScore = calculateScore(a)
      const bScore = calculateScore(b)
      
      if (aScore !== bScore) {
        return bScore - aScore // Mayor puntuación = mayor prioridad
      }
      
      // Si tienen la misma puntuación, ordenar alfabéticamente por nombre
      return aName.localeCompare(bName)
    })
  },

  // Obtener todos los productos con filtros avanzados
  async getProducts(filters?: {
    search?: string
    brand?: string
    category?: string
    brands?: string[]
    categories?: string[]
    priceRange?: [number, number]
    featured?: boolean
    on_sale?: boolean
    active?: boolean
    minStock?: number
    maxStock?: number
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: Product[], count: number }> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    // Filtro de activo (por defecto solo activos, pero ahora es configurable)
    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active)
    } else {
      query = query.eq('active', true)
    }

    // Filtro por marca individual
    if (filters?.brand) {
      query = query.eq('brand', filters.brand)
    }

    // Filtro por categoría individual  
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    // Filtros por múltiples marcas (para compatibilidad)
    if (filters?.brands && filters.brands.length > 0) {
      query = query.in('brand', filters.brands)
    }

    // Filtros por múltiples categorías (para compatibilidad)
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories)
    }

    if (filters?.priceRange) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1])
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.on_sale !== undefined) {
      query = query.eq('on_sale', filters.on_sale)
    }

    // Filtros de stock
    if (filters?.minStock !== undefined) {
      query = query.gte('stock', filters.minStock)
    }

    if (filters?.maxStock !== undefined) {
      query = query.lte('stock', filters.maxStock)
    }

    // Ordenamiento
    if (filters?.sortBy) {
      const order = filters.sortOrder || 'asc'
      query = query.order(filters.sortBy, { ascending: order === 'asc' })
    } else {
      query = query.order('name', { ascending: true })
    }

    // Manejar la búsqueda
    let needsFuzzySearch = false
    if (filters?.search) {
      const searchTerms = filters.search.toLowerCase().split(/\s+/).filter(term => term.length > 0)
      needsFuzzySearch = searchTerms.length > 1

      // Construir condiciones OR con AND implícito entre términos
      searchTerms.forEach(term => {
        query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`)
      })
    }

    // Paginación - Solo aplicar si no necesitamos búsqueda fuzzy
    if (filters?.limit && !needsFuzzySearch) {
      query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1)
    }

    // Si necesitamos búsqueda fuzzy, obtenemos más resultados sin límite de paginación
    if (needsFuzzySearch) {
      // Obtenemos hasta 1000 productos para hacer el filtrado fuzzy
      // Esto es un balance entre performance y funcionalidad
      query = query.limit(1000)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error('Error al obtener productos')
    }

    let products = data || []
    let totalCount = count || 0

    // Solo aplicar búsqueda fuzzy si realmente es necesario (múltiples palabras)
    if (needsFuzzySearch && filters?.search && products.length > 0) {
      products = this.applyFuzzySearch(products, filters.search)
      totalCount = products.length
      
      // Aplicar paginación después del filtrado fuzzy
      if (filters?.limit && filters?.offset !== undefined) {
        products = products.slice(filters.offset, filters.offset + filters.limit)
      }
    }

    return { data: products, count: totalCount }
  },

  // Obtener un producto por ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }

    return data
  },

  // Obtener productos en oferta
  async getProductsOnSale(limit?: number): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .eq('on_sale', true)
      .order('updated_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products on sale:', error)
      return []
    }

    return data || []
  },

  // Crear un nuevo producto
  async createProduct(productData: CreateProductData): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw new Error('Error al crear producto')
    }

    return data
  },

  // Actualizar un producto
  async updateProduct(id: number, productData: UpdateProductData): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw new Error('Error al actualizar producto')
    }

    return data
  },

  // Eliminar un producto (soft delete)
  async deleteProduct(id: number | string): Promise<void> {
    try {
      const productId = typeof id === 'string' ? parseInt(id) : id
      
      if (isNaN(productId)) {
        throw new Error('ID de producto inválido')
      }

      console.log('Attempting to delete product with ID:', productId)

      const { data, error } = await supabase
        .from('products')
        .update({ active: false })
        .eq('id', productId)
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error deleting product:', error)
        throw new Error(`Error de base de datos: ${error.message} (${error.code})`)
      }

      if (!data || data.length === 0) {
        throw new Error('Producto no encontrado o no se pudo actualizar')
      }

      console.log('Product successfully marked as inactive:', data[0])
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error instanceof Error ? error : new Error('Error desconocido al eliminar producto')
    }
  },

  // Eliminar un producto permanentemente (hard delete)
  async deleteProductPermanently(id: number | string): Promise<void> {
    try {
      const productId = typeof id === 'string' ? parseInt(id) : id
      
      if (isNaN(productId)) {
        throw new Error('ID de producto inválido')
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Supabase error permanently deleting product:', error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }
    } catch (error) {
      console.error('Error permanently deleting product:', error)
      throw error instanceof Error ? error : new Error('Error desconocido al eliminar producto permanentemente')
    }
  },

  // Obtener marcas únicas
  async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .eq('active', true)

    if (error) {
      console.error('Error fetching brands:', error)
      return []
    }

    const uniqueBrands = [...new Set(data.map(item => item.brand))].sort()
    return uniqueBrands
  },

  // Obtener categorías únicas
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('active', true)

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    const uniqueCategories = [...new Set(data.map(item => item.category))].sort()
    return uniqueCategories
  },

  // Actualizar stock de un producto
  async updateStock(id: number, stock: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id)

    if (error) {
      console.error('Error updating stock:', error)
      throw new Error('Error al actualizar stock')
    }
  }
}

// ===================== ÓRDENES =====================

export const orderService = {
  // Crear una nueva orden
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    // Calcular el total
    const total = orderData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_option: orderData.delivery_option,
        payment_method: orderData.payment_method,
        total_amount: total,
        notes: orderData.notes
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error('Error al crear la orden')
    }

    // Crear los items de la orden
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      throw new Error('Error al crear los items de la orden')
    }

    return order
  },

  // Obtener todas las órdenes
  async getOrders(filters?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ data: Order[], count: number }> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      throw new Error('Error al obtener órdenes')
    }

    return { data: data || [], count: count || 0 }
  },

  // Actualizar estado de una orden
  async updateOrderStatus(id: number, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating order status:', error)
      throw new Error('Error al actualizar estado de la orden')
    }
  }
}

// ===================== MARCAS Y CATEGORÍAS =====================

export const brandService = {
  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error fetching brands:', error)
      return []
    }

    return data || []
  },

  async getAllBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching all brands:', error)
      return []
    }

    return data || []
  },

  async getActiveBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error fetching active brands:', error)
      return []
    }

    return data || []
  },

  async getBrandById(id: number): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching brand:', error)
      return null
    }

    return data
  },

  async createBrand(brand: { name: string; description?: string }): Promise<Brand> {
    const slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const { data, error } = await supabase
      .from('brands')
      .insert({ ...brand, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating brand:', error)
      throw new Error('Error al crear marca')
    }

    return data
  },

  async updateBrand(id: number, updates: { name?: string; description?: string; active?: boolean }): Promise<Brand> {
    const updateData: any = { ...updates }
    
    // Si se actualiza el nombre, actualizar también el slug
    if (updates.name) {
      updateData.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const { data, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating brand:', error)
      throw new Error('Error al actualizar marca')
    }

    return data
  },

  async deleteBrand(id: number): Promise<void> {
    // Primero obtener el nombre de la marca para la verificación
    const brand = await this.getBrandById(id)
    if (!brand) {
      throw new Error('Marca no encontrada')
    }

    // Verificar si hay productos usando esta marca (buscar por nombre)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('brand', brand.name)
      .limit(1)

    if (checkError) {
      console.error('Error checking products:', checkError)
      throw new Error('Error al verificar productos')
    }

    console.log(`Verificando productos para marca "${brand.name}":`, products?.length || 0)

    if (products && products.length > 0) {
      throw new Error('No se puede eliminar la marca porque tiene productos asociados')
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting brand:', error)
      throw new Error('Error al eliminar marca')
    }
  },

  async toggleBrandStatus(id: number): Promise<Brand> {
    // Obtener el estado actual
    const brand = await this.getBrandById(id)
    if (!brand) {
      throw new Error('Marca no encontrada')
    }

    // Cambiar el estado
    return await this.updateBrand(id, { active: !brand.active })
  }
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  },

  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching all categories:', error)
      return []
    }

    return data || []
  },

  async getActiveCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('Error fetching active categories:', error)
      return []
    }

    return data || []
  },

  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return null
    }

    return data
  },

  async createCategory(category: { name: string; description?: string }): Promise<Category> {
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, slug })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      throw new Error('Error al crear categoría')
    }

    return data
  },

  async updateCategory(id: number, updates: { name?: string; description?: string; active?: boolean }): Promise<Category> {
    const updateData: any = { ...updates }
    
    // Si se actualiza el nombre, actualizar también el slug
    if (updates.name) {
      updateData.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      throw new Error('Error al actualizar categoría')
    }

    return data
  },

  async deleteCategory(id: number): Promise<void> {
    // Primero obtener el nombre de la categoría para la verificación
    const category = await this.getCategoryById(id)
    if (!category) {
      throw new Error('Categoría no encontrada')
    }

    // Verificar si hay productos usando esta categoría (buscar por nombre)
    // Agregamos una pequeña espera para asegurar consistencia de datos
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('category', category.name)
      .limit(1)

    if (checkError) {
      console.error('Error checking products:', checkError)
      throw new Error('Error al verificar productos')
    }

    console.log(`Verificando productos para categoría "${category.name}":`, products?.length || 0)

    if (products && products.length > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados')
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      throw new Error('Error al eliminar categoría')
    }
  },

  async toggleCategoryStatus(id: number): Promise<Category> {
    // Obtener el estado actual
    const category = await this.getCategoryById(id)
    if (!category) {
      throw new Error('Categoría no encontrada')
    }

    // Cambiar el estado
    return await this.updateCategory(id, { active: !category.active })
  }
}
