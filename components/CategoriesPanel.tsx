"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryService } from "@/lib/supabase-services"
import type { Category } from "@/types/product"

export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Estados para formularios
  const [createForm, setCreateForm] = useState({
    name: "",
    description: ""
  })
  const [editForm, setEditForm] = useState({
    name: "",
    description: ""
  })

  // Cargar categorías
  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...categories]

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(category =>
        statusFilter === "active" ? category.active : !category.active
      )
    }

    setFilteredCategories(filtered)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [categories, searchTerm, statusFilter])

  // Crear categoría
  const handleCreate = async () => {
    if (!createForm.name.trim()) return

    try {
      await categoryService.createCategory({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined
      })
      
      setCreateForm({ name: "", description: "" })
      setIsCreateModalOpen(false)
      loadCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error al crear la categoría')
    }
  }

  // Editar categoría
  const handleEdit = async () => {
    if (!selectedCategory || !editForm.name.trim()) return

    try {
      await categoryService.updateCategory(selectedCategory.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined
      })
      
      setIsEditModalOpen(false)
      setSelectedCategory(null)
      loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error al actualizar la categoría')
    }
  }

  // Eliminar categoría
  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      await categoryService.deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la categoría')
    }
  }

  // Cambiar estado activo/inactivo
  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.toggleCategoryStatus(category.id)
      loadCategories()
    } catch (error) {
      console.error('Error toggling category status:', error)
      alert('Error al cambiar el estado de la categoría')
    }
  }

  // Abrir modal de edición
  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      name: category.name,
      description: category.description || ""
    })
    setIsEditModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando categorías...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Categorías</h2>
          <p className="text-gray-500 text-xs sm:text-sm">
            {filteredCategories.length} de {categories.length} categorías
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black text-white hover:bg-gray-800 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva categoría
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchTerm || statusFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
            }}
            className="whitespace-nowrap"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Lista de categorías */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
          {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 line-clamp-2 min-h-[3.5rem] flex items-center">{category.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="flex-1">
                {category.description ? (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-[4.5rem]">
                    {category.description}
                  </p>
                ) : (
                  <div className="min-h-[4.5rem] mb-3"></div>
                )}
                
                {/* Información adicional */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <div className="truncate">Slug: {category.slug}</div>
                  <div>Creado: {new Date(category.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(category)}
                  className="flex-1 text-xs"
                >
                  {category.active ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Activar
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(category)}
                  title="Editar categoría"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategoryToDelete(category)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "{category.name}".
                        Solo se puede eliminar si no tiene productos asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "No se encontraron categorías con los filtros aplicados" 
              : "No hay categorías creadas aún"}
          </div>
        </div>
      )}

      {/* Modal Crear Categoría */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva categoría</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nombre *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Nombre de la categoría"
              />
            </div>
            
            <div>
              <Label htmlFor="create-description">Descripción</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!createForm.name.trim()}
            >
              Crear categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Categoría */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nombre de la categoría"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={!editForm.name.trim()}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
