"use client"

import { useState, useEffect } from "react"
import { AdminProductsPanel } from "@/components/AdminProductsPanel"
import { OrdersPanel } from "@/components/OrdersPanel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ShoppingCart, Users, TrendingUp, Store } from "lucide-react"
import { productService } from "@/lib/supabase-services"

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    loading: true
  })

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allProducts, activeProducts, featuredProducts] = await Promise.all([
          productService.getProducts({ limit: 1 }), // Solo para obtener el count
          productService.getProducts({ limit: 1 }), // Productos activos
          productService.getProducts({ featured: true, limit: 1 }) // Productos destacados
        ])

        setStats({
          totalProducts: allProducts.count,
          activeProducts: activeProducts.count,
          featuredProducts: featuredProducts.count,
          loading: false
        })
      } catch (error) {
        console.error('Error loading stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header mejorado */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-gray-600 text-lg">Gestiona tu tienda Permay</p>
            </div>
          </div>
        </div>

        {/* Stats Cards mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Productos Totales"
            value={stats.loading ? "..." : stats.totalProducts.toString()}
            icon={<Package className="h-6 w-6" />}
            description="Total en catálogo"
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Productos Activos"
            value={stats.loading ? "..." : stats.activeProducts.toString()}
            icon={<ShoppingCart className="h-6 w-6" />}
            description="Disponibles en tienda"
            color="from-green-500 to-green-600"
          />
          <StatsCard
            title="Productos Destacados"
            value={stats.loading ? "..." : stats.featuredProducts.toString()}
            icon={<TrendingUp className="h-6 w-6" />}
            description="En sección especial"
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Main Content con mejor diseño */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <Tabs defaultValue="products" className="w-full">
            <div className="border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <TabsList className="grid w-full grid-cols-2 bg-transparent p-2">
                <TabsTrigger 
                  value="products" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl font-semibold"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Productos
                </TabsTrigger>
                <TabsTrigger 
                  value="orders"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl font-semibold"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Órdenes
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="products" className="mt-0">
                <AdminProductsPanel />
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <OrdersPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  description,
  color 
}: { 
  title: string
  value: string
  icon: React.ReactNode
  description: string
  color: string
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color} text-white shadow-md`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}
