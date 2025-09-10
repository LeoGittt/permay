"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brandService } from "@/lib/supabase-services"
import type { Brand } from "@/types/product"

export function BrandsPanel() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)

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

  // Cargar marcas
  const loadBrands = async () => {
    setLoading(true)
    try {
      const data = await brandService.getAllBrands()
      setBrands(data)
      setFilteredBrands(data)
    } catch (error) {
      console.error('Error loading brands:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...brands]

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(brand =>
        statusFilter === "active" ? brand.active : !brand.active
      )
    }

    setFilteredBrands(filtered)
  }

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [brands, searchTerm, statusFilter])

  // Crear marca
  const handleCreate = async () => {
    if (!createForm.name.trim()) return

    try {
      await brandService.createBrand({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined
      })
      
      setCreateForm({ name: "", description: "" })
      setIsCreateModalOpen(false)
      loadBrands()
    } catch (error) {
      console.error('Error creating brand:', error)
      alert('Error al crear la marca')
    }
  }

  // Editar marca
  const handleEdit = async () => {
    if (!selectedBrand || !editForm.name.trim()) return

    try {
      await brandService.updateBrand(selectedBrand.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined
      })
      
      setIsEditModalOpen(false)
      setSelectedBrand(null)
      loadBrands()
    } catch (error) {
      console.error('Error updating brand:', error)
      alert('Error al actualizar la marca')
    }
  }

  // Eliminar marca
  const handleDelete = async () => {
    if (!brandToDelete) return

    try {
      await brandService.deleteBrand(brandToDelete.id)
      setBrandToDelete(null)
      loadBrands()
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la marca')
    }
  }

  // Cambiar estado activo/inactivo
  const handleToggleStatus = async (brand: Brand) => {
    try {
      await brandService.toggleBrandStatus(brand.id)
      loadBrands()
    } catch (error) {
      console.error('Error toggling brand status:', error)
      alert('Error al cambiar el estado de la marca')
    }
  }

  // Abrir modal de edición
  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setEditForm({
      name: brand.name,
      description: brand.description || ""
    })
    setIsEditModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando marcas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Marcas</h2>
          <p className="text-gray-500 text-xs sm:text-sm">
            {filteredBrands.length} de {brands.length} marcas
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black text-white hover:bg-gray-800 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva marca
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar marcas..."
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

      {/* Lista de marcas */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl">
          {filteredBrands.map((brand) => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 line-clamp-2 min-h-[3.5rem] flex items-center">{brand.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={brand.active ? "default" : "secondary"}>
                      {brand.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="flex-1">
                {brand.description ? (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-[4.5rem]">
                    {brand.description}
                  </p>
                ) : (
                  <div className="min-h-[4.5rem] mb-3"></div>
                )}
                
                {/* Información adicional */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <div className="truncate">Slug: {brand.slug}</div>
                  <div>Creado: {new Date(brand.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(brand)}
                  className="flex-1 text-xs"
                >
                  {brand.active ? (
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
                  onClick={() => openEditModal(brand)}
                  title="Editar marca"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBrandToDelete(brand)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar marca"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la marca "{brand.name}".
                        Solo se puede eliminar si no tiene productos asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setBrandToDelete(null)}>
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
      {filteredBrands.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "No se encontraron marcas con los filtros aplicados" 
              : "No hay marcas creadas aún"}
          </div>
        </div>
      )}

      {/* Modal Crear Marca */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva marca</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nombre *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Nombre de la marca"
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
              Crear marca
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Marca */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar marca</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nombre de la marca"
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
