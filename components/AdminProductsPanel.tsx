"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Eye, Package, ChevronLeft, ChevronRight } from "lucide-react"
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
import { productService } from "@/lib/supabase-services"
import type { Product, CreateProductData, UpdateProductData } from "@/types/product"

export function AdminProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const ITEMS_PER_PAGE = 10

  // Cargar productos
  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data, count } = await productService.getProducts({
        search: searchTerm || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
      setProducts(data)
      setTotalProducts(count)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar marcas y categorías
  const loadBrandsAndCategories = async () => {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        productService.getBrands(),
        productService.getCategories()
      ])
      setBrands(brandsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading brands and categories:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [searchTerm, currentPage])

  useEffect(() => {
    loadBrandsAndCategories()
  }, [])

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
    <div className="space-y-8 admin-panel">
      {/* Header ultra mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-100 particles-bg fade-in-up">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 bounce-in">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg hover-scale glow-effect">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-shimmer">
                  Gestión de Productos
                </h2>
                <p className="text-gray-600 text-lg">Administra tu catálogo con estilo</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 slide-in-right">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-100 hover-lift">
                <span className="text-sm text-gray-600">Total: </span>
                <span className="font-bold text-blue-600">{totalProducts}</span>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-green-100 hover-lift">
                <span className="text-sm text-gray-600">Página: </span>
                <span className="font-bold text-green-600">{currentPage}/{totalPages}</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 btn-magic bounce-in"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Crear Producto
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda ultra moderna */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50">
        <CardContent className="pt-6">
          <div className="relative">
            <Label htmlFor="search" className="text-sm font-semibold text-gray-700 mb-2 block">
              🔍 Buscar en tu inventario
            </Label>
            <div className="relative group">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              <Input
                id="search"
                placeholder="Busca por nombre, marca, categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de productos rediseñado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          // Loading cards ultra elegantes con efectos avanzados
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
              <div className="relative">
                <div className="animate-pulse">
                  {/* Imagen skeleton con shimmer */}
                  <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Badges skeleton */}
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-20 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full animate-pulse"></div>
                      <div className="h-6 w-16 bg-gradient-to-r from-green-200 to-green-300 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Título skeleton */}
                    <div className="space-y-2">
                      <div className="h-6 w-3/4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    </div>
                    
                    {/* Precio skeleton */}
                    <div className="h-8 w-1/3 bg-gradient-to-r from-green-200 to-green-300 rounded-lg animate-pulse"></div>
                    
                    {/* Descripción skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                      <div className="h-3 w-4/5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    </div>
                    
                    {/* Botones skeleton */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <div className="flex-1 h-9 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg animate-pulse"></div>
                      <div className="flex-1 h-9 bg-gradient-to-r from-green-200 to-green-300 rounded-lg animate-pulse"></div>
                      <div className="h-9 w-12 bg-gradient-to-r from-red-200 to-red-300 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-gray-300 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="mb-6">
                  <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay productos</h3>
                  <p className="text-gray-400">Comienza creando tu primer producto o ajusta los filtros</p>
                </div>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer producto
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          products.map((product, index) => (
            <Card 
              key={product.id} 
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 overflow-hidden hover-lift fade-in-up particles-bg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                {/* Imagen del producto */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=300"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges flotantes */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold shadow-lg animate-pulse">
                        ⭐ Destacado
                      </Badge>
                    )}
                    <Badge variant={product.active ? "default" : "secondary"} className="font-medium shadow-md">
                      {product.active ? "🟢 Activo" : "🔴 Inactivo"}
                    </Badge>
                  </div>

                  {/* Stock badge */}
                  {product.stock !== undefined && (
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"} 
                        className="font-bold shadow-lg"
                      >
                        📦 {product.stock}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Contenido del card */}
                <CardContent className="p-6 space-y-4">
                  {/* Título y marca */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {product.brand}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{product.category}</span>
                    </div>
                  </div>

                  {/* Precio destacado */}
                  <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </div>
                  </div>

                  {/* Descripción corta */}
                  {product.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product)
                        setIsEditModalOpen(true)
                      }}
                      className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paginación ultra elegante */}
      {totalPages > 1 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}</span> de <span className="font-semibold text-gray-900">{totalProducts}</span> productos
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="group border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1 mx-4">
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
                        className={`min-w-[40px] h-10 ${
                          currentPage === pageNum 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        } transition-all duration-300`}
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
                  className="group border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  🗑️ Confirmar Desactivación
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 mt-1">
                  Esta acción marcará el producto como inactivo
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {productToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-4">
                  <img
                    src={productToDelete.image || "/placeholder.svg?height=80&width=80"}
                    alt={productToDelete.name}
                    className="w-16 h-16 object-cover rounded-lg shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{productToDelete.name}</h4>
                    <p className="text-sm text-gray-600">{productToDelete.brand} • {productToDelete.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 text-xl">⚠️</span>
                  <div>
                    <h5 className="font-semibold text-yellow-800">¿Estás seguro?</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      El producto se marcará como <strong>inactivo</strong> y no aparecerá en la tienda, 
                      pero mantendrá todos sus datos. Podrás reactivarlo más tarde si es necesario.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="gap-4 pt-6">
            <AlertDialogCancel className="px-8 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl rounded-xl transition-all duration-500 transform hover:scale-105"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Desactivar Producto
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
  categories: string[]
}) {
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: 0,
    image: "",
    stock: 0,
    featured: false
  })
  const [loading, setLoading] = useState(false)

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
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Crear Nuevo Producto
              </DialogTitle>
              <p className="text-gray-600 mt-1">Completa la información del producto</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          {/* Información básica */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  📝 Nombre del Producto *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Crema Hidratante Premium"
                  required
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">
                  🏷️ Marca *
                </Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Seleccionar marca" />
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

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                  📂 Categoría *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                  💰 Precio *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  className="border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700">
                  🖼️ URL de Imagen
                </Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 rounded-xl transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                  📦 Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Descripción del Producto</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                📄 Descripción Detallada
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las características, beneficios y detalles del producto..."
                rows={4}
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300 resize-none"
              />
            </div>
          </div>

          {/* Opciones especiales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Opciones Especiales</h3>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-orange-500"
                />
                <div>
                  <Label htmlFor="featured" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    ⭐ Producto Destacado
                  </Label>
                  <p className="text-xs text-gray-600">Los productos destacados aparecen primero en la tienda</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl rounded-xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Producto
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modal para editar producto
function EditProductModal({ 
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
  categories: string[]
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
    active: product.active
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await productService.updateProduct(product.id, formData)
      onSuccess()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error al actualizar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Marca *</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData({ ...formData, brand: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marca" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Producto activo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Producto"}
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                👁️ Detalles del Producto
              </DialogTitle>
              <p className="text-gray-600 mt-1">Información completa del producto</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8 pt-6">
          {/* Sección principal con imagen y datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <img
                  src={product.image || "/placeholder.svg?height=400&width=400"}
                  alt={product.name}
                  className="relative w-full h-80 object-cover rounded-2xl shadow-xl border-4 border-white"
                />
                {product.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-bold shadow-lg animate-pulse">
                    ⭐ Destacado
                  </div>
                )}
              </div>
              
              {/* Badges de estado */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge 
                  variant={product.active ? "default" : "secondary"} 
                  className={`px-4 py-2 font-bold text-sm shadow-lg ${
                    product.active 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                  }`}
                >
                  {product.active ? "🟢 Activo" : "🔴 Inactivo"}
                </Badge>
                {product.stock !== undefined && (
                  <Badge 
                    variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"} 
                    className="px-4 py-2 font-bold text-sm shadow-lg"
                  >
                    📦 Stock: {product.stock}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Información del producto */}
            <div className="space-y-6">
              {/* Nombre y marca */}
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full font-semibold text-sm border border-blue-200">
                    🏷️ {product.brand}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded-full font-semibold text-sm border border-green-200">
                    📂 {product.category}
                  </span>
                </div>
              </div>
              
              {/* Precio destacado */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-lg">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-semibold mb-2">💰 Precio</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500">🆔</span>
                    <span className="font-semibold text-gray-700">ID del Producto</span>
                  </div>
                  <p className="text-gray-600 font-mono text-sm">{product.id}</p>
                </div>
                
                {product.created_at && (
                  <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-500">📅</span>
                      <span className="font-semibold text-gray-700">Fecha de Creación</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {new Date(product.created_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Descripción detallada */}
          {product.description && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">📝 Descripción del Producto</h4>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                  {product.description}
                </p>
              </div>
            </div>
          )}
          
          {/* Botón de cierre elegante */}
          <div className="flex justify-center pt-6 border-t border-gray-100">
            <Button 
              onClick={onClose}
              className="px-12 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-xl hover:shadow-2xl rounded-xl transition-all duration-500 transform hover:scale-105"
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Cerrar Vista
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
