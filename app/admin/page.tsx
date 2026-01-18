"use client"

import { useState, useEffect } from "react"
import { AdminProductsPanel } from "@/components/AdminProductsPanel"
import { CategoriesPanel } from "@/components/CategoriesPanel"
import { BrandsPanel } from "@/components/BrandsPanel"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, TrendingUp, LogOut, User } from "lucide-react"
import { productService } from "@/lib/supabase-services"

export default function AdminPage() {
  const { user, signOut } = useAuth()
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
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
        

        {/* Header minimalista */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img 
                src="/logonuevo.png" 
                alt="Permay Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-contain shadow-sm"
              />
              <h1 className="text-lg font-semibold text-permay-primary">
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
          <p className="text-gray-500 text-xs text-center">
            Gestiona tu tienda y productos
          </p>
        </div>

        {/* Stats Cards minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total de productos"
            value={stats.loading ? "..." : stats.totalProducts.toString()}
            icon={<Package className="h-4 w-4 text-gray-400" />}
          />
          <StatsCard
            title="Productos activos"
            value={stats.loading ? "..." : stats.activeProducts.toString()}
            icon={<ShoppingCart className="h-4 w-4 text-gray-400" />}
          />
          <StatsCard
            title="Productos destacados"
            value={stats.loading ? "..." : stats.featuredProducts.toString()}
            icon={<TrendingUp className="h-4 w-4 text-gray-400" />}
          />
        </div>

        {/* Main Content minimalista */}
        <div className="border border-gray-200 rounded-lg bg-white">
          <Tabs defaultValue="products" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                <TabsTrigger 
                  value="products" 
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none"
                >
                  Productos
                </TabsTrigger>
                <TabsTrigger 
                  value="categories"
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none"
                >
                  Categorías
                </TabsTrigger>
                <TabsTrigger 
                  value="brands"
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none"
                >
                  Marcas
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="products" className="mt-0">
                <AdminProductsPanel />
              </TabsContent>

              <TabsContent value="categories" className="mt-0">
                <CategoriesPanel />
              </TabsContent>

              <TabsContent value="brands" className="mt-0">
                <BrandsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function StatsCard({ 
  title, 
  value, 
  icon
}: { 
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  )
}
