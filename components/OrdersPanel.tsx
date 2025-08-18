"use client"

import { useState, useEffect } from "react"
import { Eye, Check, X, Clock, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { orderService } from "@/lib/supabase-services"
import type { Order } from "@/types/product"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
}

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado"
}

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <Check className="h-4 w-4" />,
  preparing: <Package className="h-4 w-4" />,
  ready: <Package className="h-4 w-4" />,
  delivered: <Truck className="h-4 w-4" />,
  cancelled: <X className="h-4 w-4" />
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const ITEMS_PER_PAGE = 10

  // Cargar órdenes
  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data, count } = await orderService.getOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE
      })
      setOrders(data)
      setTotalOrders(count)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter, currentPage])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado de la orden')
    }
  }

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
          <p className="text-gray-600">Administra los pedidos de clientes</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium mb-1">
                Filtrar por estado
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Listo</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes ({totalOrders})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron órdenes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Orden #{order.id}</h3>
                        <Badge className={statusColors[order.status]}>
                          {statusIcons[order.status]}
                          <span className="ml-1">{statusLabels[order.status]}</span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <strong>Cliente:</strong> {order.customer_name}
                        </div>
                        <div>
                          <strong>Teléfono:</strong> {order.customer_phone}
                        </div>
                        <div>
                          <strong>Entrega:</strong> {order.delivery_option === 'retiro' ? 'Retiro' : 'Envío'}
                        </div>
                        <div>
                          <strong>Total:</strong> {formatPrice(order.total_amount)}
                        </div>
                        <div>
                          <strong>Pago:</strong> {order.payment_method}
                        </div>
                        <div>
                          <strong>Fecha:</strong> {formatDate(order.created_at)}
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-2 text-sm">
                          <strong>Notas:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus as Order['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="preparing">Preparando</SelectItem>
                          <SelectItem value="ready">Listo</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal Ver Orden */}
      {selectedOrder && (
        <ViewOrderModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

// Modal para ver orden
function ViewOrderModal({ 
  order, 
  isOpen, 
  onClose 
}: {
  order: Order
  isOpen: boolean
  onClose: () => void
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Orden #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Nombre:</strong> {order.customer_name}
                </div>
                <div>
                  <strong>Teléfono:</strong> {order.customer_phone}
                </div>
                {order.customer_email && (
                  <div>
                    <strong>Email:</strong> {order.customer_email}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Estado:</strong>
                  <Badge className={`ml-2 ${statusColors[order.status]}`}>
                    {statusIcons[order.status]}
                    <span className="ml-1">{statusLabels[order.status]}</span>
                  </Badge>
                </div>
                <div>
                  <strong>Entrega:</strong> {order.delivery_option === 'retiro' ? 'Retiro en tienda' : 'Envío a domicilio'}
                </div>
                <div>
                  <strong>Método de pago:</strong> {order.payment_method}
                </div>
                <div>
                  <strong>Fecha:</strong> {formatDate(order.created_at)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items de la orden */}
          {order.order_items && order.order_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        {item.product && (
                          <>
                            <img
                              src={item.product.image || "/placeholder.svg?height=40&width=40"}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-600">{item.product.brand}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.quantity}x {formatPrice(item.unit_price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total: {formatPrice(item.total_price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total del pedido:</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
