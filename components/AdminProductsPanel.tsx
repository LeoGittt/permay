"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Eye, Package, ChevronLeft, ChevronRight, Grid3X3, List, Filter, X, Upload, Image, Link, Camera, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { productService, categoryService, brandService, imageService } from "@/lib/supabase-services"
import type { Product, CreateProductData, UpdateProductData, Category } from "@/types/product"
import "@/styles/admin-products.css"

export function AdminProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    brand: "all",
    category: "all", 
    status: "all", // all, active, inactive
    featured: "all", // all, featured, regular
    onSale: "all", // all, on-sale, regular
    stock: "all" // all, in-stock, out-of-stock, low-stock
  })
  const [showFilters, setShowFilters] = useState(false)

  const ITEMS_PER_PAGE = 12

  // Cargar productos con filtros
  const loadProducts = async () => {
    setLoading(true)
    try {
      // Preparar parámetros de filtros
      const filterParams: any = {
        search: searchTerm || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sortBy: 'created_at',
        sortOrder: 'desc'
      }

      // Agregar filtros si están seleccionados (no son "all")
      if (filters.brand && filters.brand !== "all") filterParams.brand = filters.brand
      if (filters.category && filters.category !== "all") filterParams.category = filters.category
      if (filters.status && filters.status !== "all") {
        if (filters.status === 'active') filterParams.active = true
        if (filters.status === 'inactive') filterParams.active = false
      }
      if (filters.featured && filters.featured !== "all") {
        if (filters.featured === 'featured') filterParams.featured = true
        if (filters.featured === 'regular') filterParams.featured = false
      }
      
      if (filters.onSale && filters.onSale !== "all") {
        if (filters.onSale === 'on-sale') filterParams.on_sale = true
        if (filters.onSale === 'regular') filterParams.on_sale = false
      }
      
      // Filtro de stock
      if (filters.stock && filters.stock !== "all") {
        if (filters.stock === 'in-stock') filterParams.minStock = 1
        if (filters.stock === 'out-of-stock') filterParams.maxStock = 0
        if (filters.stock === 'low-stock') {
          filterParams.minStock = 1
          filterParams.maxStock = 10
        }
      }

      const { data, count } = await productService.getProducts(filterParams)
      setProducts(data)
      setTotalProducts(count)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir modal de crear producto y recargar marcas
  const openCreateModal = async () => {
    setIsCreateModalOpen(true)
    // Recargar marcas para asegurar que estén actualizadas
    await loadBrandsAndCategories()
  }

  // Función para abrir modal de editar producto y recargar marcas
  const openEditModal = async (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
    // Recargar marcas para asegurar que estén actualizadas
    await loadBrandsAndCategories()
  }

  // Cargar marcas y categorías
  const loadBrandsAndCategories = async () => {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        brandService.getActiveBrands(), // Cambio: usar brandService en lugar de productService
        categoryService.getActiveCategories() // Solo categorías activas para formularios
      ])
      // Extraer solo los nombres de las marcas para mantener compatibilidad
      setBrands(brandsData.map(brand => brand.name))
      setCategories(categoriesData)
      console.log('Marcas activas cargadas:', brandsData) // Debug log
      console.log('Categorías activas cargadas:', categoriesData) // Debug log
    } catch (error) {
      console.error('Error loading brands and categories:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [searchTerm, currentPage, filters])

  useEffect(() => {
    loadBrandsAndCategories()
  }, [])

  // Funciones para manejar filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Resetear a la primera página cuando se cambian filtros
  }

  const clearFilters = () => {
    setFilters({
      brand: "all",
      category: "all",
      status: "all",
      featured: "all",
      onSale: "all",
      stock: "all"
    })
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "all")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      console.log('Attempting to delete product with ID:', productToDelete.id)
      await productService.deleteProduct(productToDelete.id)
      console.log('Product deleted successfully')
      await loadProducts() // Recargar productos después de eliminar
      await loadBrandsAndCategories() // También recargar categorías para actualizar el estado
      setProductToDelete(null)
      alert('Producto desactivado exitosamente')
    } catch (error) {
      console.error('Error deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al desactivar el producto: ${errorMessage}`)
    }
  }

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Productos</h2>
          <p className="text-gray-500 text-xs sm:text-sm">{totalProducts} productos en total</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-black text-white hover:bg-gray-800 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo producto
        </Button>
      </div>

      {/* Controles: búsqueda, filtros y vista */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-gray-400 rounded-lg text-sm"
            />
          </div>
          
          {/* Botón filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm ${
              hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.values(filters).filter(f => f !== "").length}
              </Badge>
            )}
          </Button>
          
          {/* Toggle vista */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-none px-3 py-2 text-xs ${
                viewMode === 'grid' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-none px-3 py-2 text-xs border-l border-gray-200 ${
                viewMode === 'list' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <Card className="border border-gray-200 bg-gray-50/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {/* Filtro por marca */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Marca
                  </Label>
                  <Select
                    value={filters.brand}
                    onValueChange={(value) => handleFilterChange('brand', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todas las marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las marcas</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por categoría */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Categoría
                  </Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="font-medium">Todas las categorías</span>
                      </SelectItem>
                      {categories
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <span className="truncate">{category.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por estado */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Estado
                  </Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por destacado */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Destacado
                  </Label>
                  <Select
                    value={filters.featured}
                    onValueChange={(value) => handleFilterChange('featured', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="featured">Destacados</SelectItem>
                      <SelectItem value="regular">Regulares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por ofertas */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Ofertas
                  </Label>
                  <Select
                    value={filters.onSale}
                    onValueChange={(value) => handleFilterChange('onSale', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="on-sale">En oferta</SelectItem>
                      <SelectItem value="regular">Sin oferta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por stock */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-1 block">
                    Stock
                  </Label>
                  <Select
                    value={filters.stock}
                    onValueChange={(value) => handleFilterChange('stock', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="in-stock">En stock</SelectItem>
                      <SelectItem value="low-stock">Stock bajo (1-10)</SelectItem>
                      <SelectItem value="out-of-stock">Sin stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botón limpiar filtros */}
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 px-3 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filtros activos */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.brand && filters.brand !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Marca: {filters.brand}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('brand', 'all')}
                />
              </Badge>
            )}
            {filters.category && filters.category !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Categoría: {filters.category}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('category', 'all')}
                />
              </Badge>
            )}
            {filters.status && filters.status !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Estado: {filters.status === 'active' ? 'Activo' : 'Inactivo'}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('status', 'all')}
                />
              </Badge>
            )}
            {filters.featured && filters.featured !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {filters.featured === 'featured' ? 'Destacados' : 'Regulares'}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('featured', 'all')}
                />
              </Badge>
            )}
            {filters.onSale && filters.onSale !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {filters.onSale === 'on-sale' ? 'En oferta' : 'Sin oferta'}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('onSale', 'all')}
                />
              </Badge>
            )}
            {filters.stock && filters.stock !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Stock: {filters.stock === 'in-stock' ? 'En stock' : 
                         filters.stock === 'low-stock' ? 'Stock bajo' : 'Sin stock'}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('stock', 'all')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Grid de productos responsive con alineación mejorada */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 items-start" 
        : "space-y-2"
      }>
        {loading ? (
          // Loading cards más compactas
          Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="border border-gray-200 overflow-hidden h-full">
              <div className="animate-pulse flex flex-col h-full">
                {viewMode === 'grid' ? (
                  <>
                    <div className="h-20 sm:h-24 bg-gray-200 skeleton"></div>
                    <div className="p-2 sm:p-3 space-y-2 flex-1">
                      <div className="h-3 bg-gray-200 rounded skeleton w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded skeleton w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded skeleton w-1/4"></div>
                      <div className="flex gap-1 mt-auto">
                        <div className="h-6 bg-gray-200 rounded skeleton flex-1"></div>
                        <div className="h-6 bg-gray-200 rounded skeleton flex-1"></div>
                        <div className="h-6 bg-gray-200 rounded skeleton w-6"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <div className="h-12 w-12 bg-gray-200 rounded skeleton flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded skeleton w-1/3"></div>
                      <div className="h-2 bg-gray-200 rounded skeleton w-1/4"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-7 w-7 bg-gray-200 rounded skeleton"></div>
                      <div className="h-7 w-7 bg-gray-200 rounded skeleton"></div>
                      <div className="h-7 w-7 bg-gray-200 rounded skeleton"></div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="text-center py-8 sm:py-12">
                <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
                <p className="text-gray-500 text-sm mb-4">Comienza creando tu primer producto</p>
                <Button 
                  onClick={openCreateModal}
                  className="bg-black text-white hover:bg-gray-800 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear producto
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          products.map((product) => (
            viewMode === 'grid' ? (
              // Vista en grilla - tarjetas alineadas con altura uniforme
              <Card 
                key={product.id} 
                className="border border-gray-200 hover:shadow-sm transition-all duration-200 group product-card focus-enhanced flex flex-col h-full"
                tabIndex={0}
              >
                <div className="flex flex-col h-full">
                  {/* Imagen con altura fija */}
                  <div className="h-20 sm:h-24 overflow-hidden rounded-t-lg bg-gray-50 flex-shrink-0">
                    <img
                      src={product.image || "/placeholder.svg?height=120&width=200"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>

                  {/* Contenido del card con flexbox */}
                  <CardContent className="p-2 sm:p-3 flex flex-col flex-1 justify-between mobile-compact card-content">
                    <div className="space-y-2 flex-1">
                      {/* Badges compactos - altura fija */}
                      <div className="flex flex-wrap gap-1 min-h-[16px]">
                        {product.featured && (
                          <Badge variant="default" className="text-[10px] px-1 py-0 badge">
                            Destacado
                          </Badge>
                        )}
                        <Badge 
                          variant={product.active ? "default" : "secondary"} 
                          className="text-[10px] px-1 py-0 badge"
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </Badge>
                        {product.stock !== undefined && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 badge">
                            {product.stock}
                          </Badge>
                        )}
                      </div>

                      {/* Título y marca - altura flexible pero limitada */}
                      <div className="min-h-[32px] flex flex-col justify-start">
                        <h3 className="font-medium text-gray-900 text-xs leading-tight line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 line-clamp-1">
                          <span className="truncate">{product.brand}</span>
                          <span>•</span>
                          <span className="truncate">{product.category}</span>
                        </div>
                      </div>

                      {/* Precio - altura fija */}
                      <div className="min-h-[20px] flex items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción - siempre en la parte inferior */}
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 text-[10px] h-6 px-1 button-compact focus-enhanced"
                        title="Ver producto"
                      >
                        <Eye className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(product)}
                        className="flex-1 text-[10px] h-6 px-1 button-compact focus-enhanced"
                        title="Editar producto"
                      >
                        <Edit className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="text-[10px] h-6 px-1 text-red-600 hover:text-red-700 hover:bg-red-50 button-compact focus-enhanced"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ) : (
              // Vista en lista - formato horizontal
              <Card 
                key={product.id} 
                className="border border-gray-200 hover:shadow-sm transition-shadow duration-200 focus-enhanced"
                tabIndex={0}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Imagen pequeña */}
                    <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={product.image || "/placeholder.svg?height=64&width=64"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate">{product.brand}</span>
                            <span>•</span>
                            <span className="truncate">{product.category}</span>
                          </div>
                        </div>

                        {/* Precio y badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          
                          <div className="hidden sm:flex gap-1">
                            {product.featured && (
                              <Badge variant="default" className="text-[10px] px-1 py-0">
                                Destacado
                              </Badge>
                            )}
                            {product.on_sale && (
                              <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">
                                Oferta
                              </Badge>
                            )}
                            <Badge 
                              variant={product.active ? "default" : "secondary"} 
                              className="text-[10px] px-1 py-0"
                            >
                              {product.active ? "Activo" : "Inactivo"}
                            </Badge>
                            {product.stock !== undefined && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {product.stock}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Badges móviles */}
                      <div className="flex sm:hidden gap-1 mt-2">
                        {product.featured && (
                          <Badge variant="default" className="text-[10px] px-1 py-0">
                            Destacado
                          </Badge>
                        )}
                        {product.on_sale && (
                          <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">
                            Oferta
                          </Badge>
                        )}
                        <Badge 
                          variant={product.active ? "default" : "secondary"} 
                          className="text-[10px] px-1 py-0"
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </Badge>
                        {product.stock !== undefined && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {product.stock}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        className="text-xs h-7 px-2 focus-enhanced"
                        title="Ver producto"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(product)}
                        className="text-xs h-7 px-2 focus-enhanced"
                        title="Editar producto"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 focus-enhanced"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))
        )}
      </div>

      {/* Paginación responsive */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-4 gap-3">
          <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} de {totalProducts} productos
          </div>
          
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[32px] h-8 text-xs"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 text-xs"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Crear Producto */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          loadProducts()
        }}
        brands={brands}
        categories={categories}
      />

      {/* Modal Editar Producto */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProduct(null)
          }}
          onSuccess={() => {
            setIsEditModalOpen(false)
            setSelectedProduct(null)
            loadProducts()
          }}
          product={selectedProduct}
          brands={brands}
          categories={categories}
        />
      )}

      {/* Modal Ver Producto */}
      {selectedProduct && !isEditModalOpen && (
        <ViewProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* AlertDialog compacto para confirmar eliminación */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Confirmar desactivación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Esta acción marcará el producto como inactivo
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {productToDelete && (
            <div className="py-3">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <img
                  src={productToDelete.image || "/placeholder.svg?height=32&width=32"}
                  alt={productToDelete.name}
                  className="w-8 h-8 object-cover rounded"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{productToDelete.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{productToDelete.brand} • {productToDelete.category}</p>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Modal para crear producto
function CreateProductModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  brands,
  categories
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  brands: string[]
  categories: Category[]
}) {
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: 0,
    image: "",
    stock: 0,
    featured: false,
    on_sale: false
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Crear vista previa inmediatamente
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setLoading(true)
      const imageUrl = await imageService.uploadImage(file)
      setFormData({ ...formData, image: imageUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Error al subir la imagen')
      setImagePreview(null) // Limpiar preview si hay error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await productService.createProduct(formData)
      onSuccess()
      setFormData({
        name: "",
        brand: "",
        category: "",
        description: "",
        price: 0,
        image: "",
        stock: 0,
        featured: false
      })
      setImagePreview(null) // Limpiar vista previa
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setImagePreview(null) // Limpiar vista previa al cerrar
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-medium">
            Nuevo producto
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos básicos en grid compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="text-sm">
                Nombre *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="brand" className="text-sm">
                Marca *
              </Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData({ ...formData, brand: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm">
                Categoría *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.name}
                      className="category-item-long"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">
                          {category.name}
                        </span>
                        {category.description && (
                          <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="text-sm">
                Precio *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="stock" className="text-sm">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-sm">Imagen del producto</Label>
              <Tabs defaultValue="url" className="mt-1">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    URL de imagen
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Subir archivo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="pl-10 pr-10"
                    />
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Limpiar URL"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {/* Vista previa de URL */}
                  {formData.image && formData.image.startsWith('http') && !imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <div className="relative">
                        <img 
                          src={formData.image} 
                          alt="Vista previa URL" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="upload" className="mt-2">
                  {!imagePreview ? (
                    // Mostrar zona de subida solo si no hay imagen
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer group relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          Subir imagen
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Arrastra tu imagen aquí o haz clic para seleccionar
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Image className="w-4 h-4 mr-1" />
                            JPG, PNG, WEBP
                          </span>
                          <span>Max 5MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Mostrar vista previa cuando hay imagen
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Vista previa" 
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null)
                            setFormData({ ...formData, image: "" })
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {loading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm">Subiendo...</p>
                            </div>
                          </div>
                        )}
                        {formData.image && !loading && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      {/* Opción para cambiar imagen */}
                      <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 text-center transition-colors">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Cambiar imagen
                          </div>
                        </label>
                      </div>
                      
                      {formData.image && !loading && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                          <p className="text-xs text-green-700 font-medium">
                            ✓ Imagen subida exitosamente
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description" className="text-sm">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Switch destacado */}
          <div className="flex items-center gap-2 py-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">
              Producto destacado
            </Label>
          </div>

          {/* Switch oferta */}
          <div className="flex items-center gap-2 py-2">
            <Switch
              id="onSale"
              checked={formData.on_sale}
              onCheckedChange={(checked) => setFormData({ ...formData, on_sale: checked })}
            />
            <Label htmlFor="onSale" className="text-sm cursor-pointer">
              Producto en oferta
            </Label>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-3 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Creando...
                </div>
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modal para editar producto
export function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  brands,
  categories
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: Product
  brands: string[]
  categories: Category[]
}) {
  const [formData, setFormData] = useState<UpdateProductData>({
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    price: product.price,
    image: product.image,
    stock: product.stock,
    featured: product.featured,
    on_sale: product.on_sale,
    active: product.active
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Crear vista previa inmediatamente
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setLoading(true)
      const imageUrl = await imageService.uploadImage(file)
      setFormData({ ...formData, image: imageUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Error al subir la imagen')
      setImagePreview(null) // Limpiar preview si hay error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await productService.updateProduct(product.id, formData)
      onSuccess()
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Error al actualizar el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setImagePreview(null) // Limpiar vista previa al cerrar
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-medium">Editar producto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="text-sm">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="brand" className="text-sm">Marca *</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData({ ...formData, brand: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category" className="text-sm">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.name}
                      className="category-item-long"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">
                          {category.name}
                        </span>
                        {category.description && (
                          <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="text-sm">Precio *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="stock" className="text-sm">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-sm">Imagen del producto</Label>
              <Tabs defaultValue="url" className="mt-1">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    URL de imagen
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Subir archivo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="pl-10 pr-10"
                    />
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Limpiar URL"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {/* Vista previa de URL */}
                  {formData.image && formData.image.startsWith('http') && !imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <div className="relative">
                        <img 
                          src={formData.image} 
                          alt="Vista previa URL" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="upload" className="mt-2">
                  {imagePreview ? (
                    // Mostrar nueva imagen seleccionada
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Nueva imagen" 
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null)
                            // Mantener la imagen original en formData
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                          title="Cancelar cambio"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {loading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm">Subiendo...</p>
                            </div>
                          </div>
                        )}
                        {formData.image && !loading && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      {/* Opción para cambiar nuevamente */}
                      <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 text-center transition-colors">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Seleccionar otra imagen
                          </div>
                        </label>
                      </div>
                      
                      {formData.image && !loading && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                          <p className="text-xs text-green-700 font-medium">
                            ✓ Nueva imagen subida exitosamente
                          </p>
                        </div>
                      )}
                    </div>
                  ) : formData.image && formData.image.startsWith('http') ? (
                    // Mostrar imagen actual si existe
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                        <div className="relative">
                          <img 
                            src={formData.image} 
                            alt="Imagen actual" 
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, image: "" })
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                            title="Eliminar imagen"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Opción para cambiar imagen */}
                      <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 text-center transition-colors">
                            <Upload className="w-4 h-4 inline mr-2" />
                            Cambiar imagen
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    // Mostrar zona de subida solo si no hay imagen
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer group relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          Agregar imagen
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Arrastra tu imagen aquí o haz clic para seleccionar
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Image className="w-4 h-4 mr-1" />
                            JPG, PNG, WEBP
                          </span>
                          <span>Max 5MB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description" className="text-sm">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">Destacado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="onSale"
                checked={formData.on_sale}
                onCheckedChange={(checked) => setFormData({ ...formData, on_sale: checked })}
              />
              <Label htmlFor="onSale" className="text-sm cursor-pointer">En oferta</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active" className="text-sm cursor-pointer">Activo</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
// Modal para ver producto con diseño ultra elegante
function ViewProductModal({
  product,
  isOpen,
  onClose
}: {
  product: Product
  isOpen: boolean
  onClose: () => void
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-medium">Detalles del producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagen compacta */}
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg?height=200&width=300"}
              alt={product.name}
              className="w-full h-32 sm:h-40 object-cover rounded-lg border"
            />
            
            {/* Badges sobre la imagen */}
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant={product.active ? "default" : "secondary"} className="text-xs">
                {product.active ? "Activo" : "Inactivo"}
              </Badge>
              {product.featured && (
                <Badge className="bg-black text-white text-xs">Destacado</Badge>
              )}
              {product.on_sale && (
                <Badge className="bg-red-500 text-white text-xs">Oferta</Badge>
              )}
            </div>
          </div>

          {/* Información principal compacta */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Precio</p>
                <p className="text-xl font-bold">{formatPrice(product.price)}</p>
              </div>
              
              {product.stock !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Stock</p>
                  <Badge
                    variant={
                      product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"
                    }
                    className="text-sm"
                  >
                    {product.stock}
                  </Badge>
                </div>
              )}
            </div>

            {/* Descripción si existe */}
            {product.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Descripción</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Información técnica compacta */}
            <div className="grid grid-cols-1 gap-2 text-xs border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-mono">{product.id}</span>
              </div>
              
              {product.created_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado:</span>
                  <span>
                    {new Date(product.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botón de cierre */}
          <div className="pt-3 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ViewProductModal }
