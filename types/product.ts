export interface Product {
  id: number
  brand: string
  category: string
  name: string
  description: string
  price: number
  image: string
  stock?: number
  active?: boolean
  featured?: boolean
  on_sale?: boolean
  created_at?: string
  updated_at?: string
}

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  active: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  active: boolean
  created_at: string
}

export interface CreateProductData {
  name: string
  brand: string
  category: string
  description?: string
  price: number
  image?: string
  stock?: number
  featured?: boolean
  on_sale?: boolean
}

export interface UpdateProductData extends Partial<CreateProductData> {
  active?: boolean
}

export interface Order {
  id: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_option: 'retiro' | 'envio'
  payment_method: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

export interface CreateOrderData {
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_option: 'retiro' | 'envio'
  payment_method: string
  notes?: string
  items: {
    product_id: number
    quantity: number
    unit_price: number
  }[]
}

// # Configuración de Supabase
// NEXT_PUBLIC_SUPABASE_URL=https://rqejopgdigifoyohmnke.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZWpvcGdkaWdpZm95b2htbmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzMzODcsImV4cCI6MjA3MTEwOTM4N30.jbGgL-UHwworOJMRDcN5E0FJ5xpJq9bBCF_-bvDNrcA

// # Configuración adicional
// NEXT_PUBLIC_WHATSAPP_NUMBER=5492613000787
// NEXT_PUBLIC_STORE_ADDRESS=San Juan 1248, M5500 Mendoza