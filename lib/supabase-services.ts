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
  // Función helper para normalizar texto (remover acentos, minúsculas)
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  },

  // Normalizar singular/plural para mejorar búsquedas
  toSingular(word: string): string {
    if (word.length <= 2) return word
    if (word.endsWith('iones')) return word.slice(0, -5) + 'ion' // lociones → locion
    if (word.endsWith('ces')) return word.slice(0, -3) + 'z' // lapices → lapiz
    if (word.endsWith('es') && word.length > 4) return word.slice(0, -2) // cremes → crem
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1) // perfumes → perfume
    return word
  },

  // Sinónimos comunes de perfumería y cosmética
  synonyms: {
    'perfume': ['fragancia', 'eau', 'toilette', 'parfum', 'colonia', 'aroma'],
    'fragancia': ['perfume', 'eau', 'toilette', 'parfum', 'colonia'],
    'crema': ['locion', 'hidratante', 'humectante', 'emulsion'],
    'locion': ['crema', 'hidratante', 'humectante', 'body'],
    'labial': ['labios', 'lipstick', 'lip', 'gloss'],
    'sombra': ['sombras', 'eyeshadow', 'ojos'],
    'base': ['foundation', 'maquillaje', 'cobertura'],
    'rimel': ['mascara', 'pestanas'],
    'mascara': ['rimel', 'pestanas'],
    'esmalte': ['unas', 'nail', 'barniz'],
    'shampoo': ['champu', 'cabello', 'pelo'],
    'champu': ['shampoo', 'cabello', 'pelo'],
    'desodorante': ['antitranspirante', 'deo'],
    'deo': ['desodorante', 'antitranspirante'],
    'serum': ['suero', 'tratamiento'],
    'protector': ['proteccion', 'solar', 'fps', 'sunscreen'],
    'solar': ['protector', 'proteccion', 'fps', 'sunscreen'],
    'colorete': ['rubor', 'blush', 'mejillas'],
    'rubor': ['colorete', 'blush', 'mejillas'],
    'polvo': ['polvos', 'compact', 'compacto'],
    'bronceador': ['bronzer', 'bronceante', 'autobronceante'],
    'kit': ['set', 'estuche', 'pack', 'cofre'],
    'set': ['kit', 'estuche', 'pack', 'cofre'],
    'regalo': ['gift', 'obsequio', 'present'],
    'hombre': ['masculino', 'man', 'men', 'caballero', 'him'],
    'mujer': ['femenino', 'woman', 'women', 'dama', 'her', 'ella'],
  } as Record<string, string[]>,

  // Expandir un término de búsqueda con sinónimos
  expandWithSynonyms(term: string): string[] {
    const normalized = this.normalizeText(term)
    const singular = this.toSingular(normalized)
    const results = new Set([normalized, singular])
    
    // Buscar sinónimos del término y de su forma singular
    for (const key of [normalized, singular]) {
      if (this.synonyms[key]) {
        for (const syn of this.synonyms[key]) {
          results.add(syn)
        }
      }
    }
    
    return Array.from(results)
  },

  // Calcular distancia de Levenshtein entre dos strings (para tolerancia a errores tipográficos)
  levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []
    for (let i = 0; i <= b.length; i++) matrix[i] = [i]
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }
    return matrix[b.length][a.length]
  },

  // Verificar si un término hace match parcial/fuzzy con una palabra
  fuzzyWordMatch(searchWord: string, targetWord: string): boolean {
    // Match exacto de substring
    if (targetWord.includes(searchWord)) return true
    // Si la palabra buscada es muy corta, solo aceptar substring match
    if (searchWord.length <= 2) return false
    // Si la palabra del target empieza con el término de búsqueda (tipeo parcial)
    if (targetWord.startsWith(searchWord)) return true
    // Tolerancia a errores tipográficos: permitir 1 error cada 4 caracteres
    const maxDistance = Math.floor(searchWord.length / 4) + (searchWord.length >= 4 ? 1 : 0)
    if (maxDistance > 0) {
      // Comparar contra substrings del target de longitud similar
      for (let i = 0; i <= targetWord.length - searchWord.length + maxDistance; i++) {
        const sub = targetWord.substring(i, i + searchWord.length + 1)
        if (this.levenshteinDistance(searchWord, sub) <= maxDistance) return true
      }
    }
    return false
  },

  // Búsqueda fuzzy mejorada aplicada client-side sobre los resultados de la DB
  applyFuzzySearch(products: Product[], searchTerm: string): Product[] {
    const stopWords = new Set([
      'de', 'del', 'la', 'el', 'en', 'con', 'para', 'por', 'sin', 'y', 'o', 'un', 'una', 'los', 'las'
    ])

    const normalizedSearch = this.normalizeText(searchTerm)
    const allTerms = normalizedSearch.split(/\s+/).filter(t => t.length > 0)
    const importantTerms = allTerms.filter(t => !stopWords.has(t))
    const searchTerms = importantTerms.length > 0 ? importantTerms : allTerms

    if (searchTerms.length === 0) return products

    // Pre-expandir cada término con sinónimos para no recalcular por producto
    const expandedTermsMap = searchTerms.map(term => ({
      original: term,
      variants: this.expandWithSynonyms(term)
    }))

    // Puntuar cada producto
    const scored = products.map(product => {
      const name = this.normalizeText(product.name || '')
      const brand = this.normalizeText(product.brand || '')
      const description = this.normalizeText(product.description || '')
      const category = this.normalizeText(product.category || '')
      const allText = `${name} ${brand} ${description} ${category}`
      const allWords = allText.split(/\s+/)

      let score = 0
      let matchedTerms = 0

      // Búsqueda del término completo original (sin dividir) — mayor peso
      if (name.includes(normalizedSearch)) {
        score += 50
        matchedTerms = searchTerms.length
      } else if (brand.includes(normalizedSearch)) {
        score += 40
        matchedTerms = searchTerms.length
      } else {
        // Búsqueda por palabras individuales con expansión de sinónimos
        for (const { original, variants } of expandedTermsMap) {
          let termMatched = false
          let bestScore = 0

          for (const variant of variants) {
            const isOriginal = variant === original
            const weight = isOriginal ? 1 : 0.6 // Sinónimos pesan menos

            // Match en nombre
            if (name.includes(variant)) {
              const s = (name.startsWith(variant) ? 20 : 10) * weight
              bestScore = Math.max(bestScore, s)
              termMatched = true
            }
            // Match en marca
            if (brand.includes(variant)) {
              const s = (brand.startsWith(variant) ? 15 : 8) * weight
              bestScore = Math.max(bestScore, s)
              termMatched = true
            }
            // Match en categoría
            if (category.includes(variant)) {
              bestScore = Math.max(bestScore, 5 * weight)
              termMatched = true
            }
            // Match en descripción
            if (description.includes(variant)) {
              bestScore = Math.max(bestScore, 2 * weight)
              termMatched = true
            }
          }

          // Si no hubo match con sinónimos, intentar fuzzy match con el término original
          if (!termMatched) {
            for (const word of allWords) {
              if (this.fuzzyWordMatch(original, word)) {
                bestScore = Math.max(bestScore, 3)
                termMatched = true
                break
              }
            }
          }

          score += bestScore
          if (termMatched) matchedTerms++
        }
      }

      // Requisito mínimo: al menos el 60% de los términos deben hacer match
      const minRequired = searchTerms.length === 1 ? 1 : Math.max(1, Math.ceil(searchTerms.length * 0.6))
      const passes = matchedTerms >= minRequired

      return { product, score, passes }
    })

    return scored
      .filter(s => s.passes && s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.product)
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
      needsFuzzySearch = true
      
      // Normalizar solo los acentos (á→a, é→e, etc.) para la query DB, sin destruir la palabra
      const normalizeForDb = (term: string) => term
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      const searchTerms = normalizeForDb(filters.search).trim().split(/\s+/).filter(term => term.length > 0)

      // Expandir cada término con sinónimos y singular/plural para la DB query
      const allDbTerms: string[] = []
      for (const term of searchTerms) {
        if (term.length < 2) continue
        const expanded = this.expandWithSynonyms(term)
        allDbTerms.push(...expanded)
      }

      // Crear condiciones OR para todos los términos expandidos
      if (allDbTerms.length > 0) {
        // Limitar a los 8 primeros para no hacer queries gigantes
        const termsForQuery = allDbTerms.slice(0, 8)
        const orConditions = termsForQuery
          .map(term => `name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`)
          .join(',')
        query = query.or(orConditions)
      }
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
