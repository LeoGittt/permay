"use client"

import { useState, useEffect } from "react"
import { Eye, MessageCircle, ShoppingCart, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { statsService } from "@/lib/supabase-services"
import type { ProductStats, ProductStatsItem } from "@/types/product"

const PERIODS = [
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
]

const formatNumber = (value: number) => Number(value).toLocaleString("es-AR")

export function StatsPanel() {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        setStats(await statsService.getProductStats(since))
      } catch (err) {
        console.error("Error loading stats:", err)
        setError("No se pudieron cargar las estadísticas")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [days])

  return (
    <div className="space-y-6">
      {/* Encabezado y período */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Estadísticas</h2>
          <p className="text-sm text-gray-600">Qué productos les interesan más a tus clientes</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((period) => (
            <Button
              key={period.days}
              size="sm"
              variant={days === period.days ? "default" : "outline"}
              onClick={() => setDays(period.days)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Cargando estadísticas...
        </div>
      )}

      {!loading && error && (
        <div className="py-16 text-center text-red-600">{error}</div>
      )}

      {!loading && !error && stats && (
        <>
          {stats.totals.tracking_since ? (
            <p className="text-xs text-gray-500">
              Datos registrados desde el {new Date(stats.totals.tracking_since).toLocaleDateString("es-AR")}.
            </p>
          ) : (
            <Card className="border border-dashed border-gray-300 shadow-none">
              <CardContent className="py-8 text-center text-sm text-gray-600">
                Todavía no hay datos. Cada vez que un cliente abre un producto, lo consulta por WhatsApp,
                lo agrega al carrito o hace un pedido, se va a ver acá.
              </CardContent>
            </Card>
          )}

          {/* Totales del período */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Productos vistos" value={stats.totals.views} icon={<Eye className="h-4 w-4 text-gray-400" />} />
            <SummaryCard title="Consultas por WhatsApp" value={stats.totals.whatsapp_queries} icon={<MessageCircle className="h-4 w-4 text-gray-400" />} />
            <SummaryCard title="Agregados al carrito" value={stats.totals.cart_adds} icon={<ShoppingCart className="h-4 w-4 text-gray-400" />} />
            <SummaryCard title="Unidades pedidas" value={stats.totals.units} icon={<Package className="h-4 w-4 text-gray-400" />} />
          </div>

          {/* Rankings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RankingCard
              title="Más vistos"
              description="Los productos que más clientes abrieron"
              items={stats.most_viewed}
              metric="views"
              unit="vistas"
            />
            <RankingCard
              title="Más pedidos por WhatsApp"
              description="Unidades incluidas en pedidos enviados"
              items={stats.most_ordered}
              metric="units"
              unit="unidades"
            />
            <RankingCard
              title="Más agregados al carrito"
              description="Los que más veces se sumaron al carrito"
              items={stats.most_added}
              metric="cart_adds"
              unit="veces"
            />
            <RankingCard
              title="Más consultados por WhatsApp"
              description='Desde el botón de consulta de cada producto'
              items={stats.most_queried}
              metric="whatsapp_queries"
              unit="consultas"
            />
            <RankingCard
              title="Menos vistos"
              description={`${formatNumber(stats.totals.products_without_views)} productos activos sin ninguna vista en el período`}
              items={stats.least_viewed}
              metric="views"
              unit="vistas"
            />
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg font-semibold text-gray-900">{formatNumber(value)}</div>
      </CardContent>
    </Card>
  )
}

function RankingCard({
  title,
  description,
  items,
  metric,
  unit,
}: {
  title: string
  description: string
  items: ProductStatsItem[]
  metric: "views" | "whatsapp_queries" | "cart_adds" | "units"
  unit: string
}) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
        <p className="text-xs text-gray-500">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Sin datos en este período</p>
        ) : (
          <ol className="space-y-2">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-medium text-gray-400 text-right">{index + 1}</span>
                <img
                  src={item.image || "/placeholder.svg?height=40&width=40"}
                  alt={item.name}
                  loading="lazy"
                  className="h-10 w-10 rounded-md object-cover border border-gray-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.brand}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formatNumber(item[metric])} <span className="text-xs font-normal text-gray-500">{unit}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
