import { supabase } from './supabase'
import type { Product, CreateProductData, UpdateProductData, Brand, Category, Order, CreateOrderData } from '@/types/product'

// ===================== PRODUCTOS =====================

export const productService = {
  // Obtener todos los productos con filtros avanzados
  async getProducts(filters?: {
    search?: string
    brand?: string
    category?: string
    brands?: string[]
    categories?: string[]
    priceRange?: [number, number]
    featured?: boolean
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

    // Aplicar filtros
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`)
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

    // Paginación
    if (filters?.limit) {
      query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error('Error al obtener productos')
    }

    return { data: data || [], count: count || 0 }
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

  async createBrand(brand: { name: string; description?: string; logo?: string }): Promise<Brand> {
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
