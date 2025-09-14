"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { MapPin, Check } from 'lucide-react'

interface LocationPickerProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialPosition?: { lat: number; lng: number }
}

// Map component that loads Leaflet dynamically
function InteractiveMap({ position, setPosition, isLoading }: {
  position: [number, number] | null
  setPosition: (pos: [number, number]) => void
  isLoading: boolean
}) {
  const [mapReady, setMapReady] = useState(false)
  const [mapComponents, setMapComponents] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Load Leaflet and react-leaflet
      Promise.all([
        import('leaflet'),
        import('react-leaflet')
      ]).then(([L, ReactLeaflet]) => {
        // Custom icon
        const customIcon = new L.Icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })

        const { MapContainer, TileLayer, Marker, useMapEvents } = ReactLeaflet

        function LocationMarker() {
          const map = useMapEvents({
            click(e: any) {
              setPosition([e.latlng.lat, e.latlng.lng])
            },
          })

          React.useEffect(() => {
            const timer = setTimeout(() => {
              map.invalidateSize()
            }, 100)
            return () => clearTimeout(timer)
          }, [map])

          return position ? React.createElement(Marker, { position, icon: customIcon }) : null
        }

        setMapComponents({
          MapContainer,
          TileLayer,
          LocationMarker
        })
        setMapReady(true)
      }).catch(console.error)
    }
  }, [position, setPosition])

  if (!mapReady || !mapComponents) {
    return (
      <div className="flex-1 relative min-h-0">
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Cargando mapa interactivo...</p>
          </div>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, LocationMarker } = mapComponents

  return (
    <div className="flex-1 relative min-h-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-xs text-gray-600 font-medium">Detectando ubicación...</p>
          </div>
        </div>
      )}
      
      {React.createElement(
        MapContainer,
        {
          center: position || [-32.8895, -68.8458],
          zoom: 15,
          style: { height: '100%', width: '100%' },
          className: 'z-0'
        },
        React.createElement(TileLayer, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }),
        React.createElement(LocationMarker)
      )}
    </div>
  )
}

export default function LocationPicker({ isOpen, onClose, onLocationSelect, initialPosition }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : [-32.8895, -68.8458] // Mendoza, Argentina
  )
  const [isLoading, setIsLoading] = useState(false)

  // Get user's current location on component mount
  useEffect(() => {
    if (isOpen && !initialPosition) {
      if ("geolocation" in navigator) {
        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPosition([position.coords.latitude, position.coords.longitude])
            setIsLoading(false)
          },
          (error) => {
            console.log('Geolocation error:', error)
            setIsLoading(false)
          },
          { timeout: 5000, enableHighAccuracy: true }
        )
      }
    }
  }, [isOpen, initialPosition])

  const handleConfirm = async () => {
    if (!position) return

    const [lat, lng] = position
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onLocationSelect(lat, lng, address)
    } catch (error) {
      console.error('Error getting address:', error)
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
    
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 gap-0 border-0 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">
          Seleccionar ubicación en el mapa
        </DialogTitle>
        
        {/* Header ultra compacto */}
        <div className="flex items-center px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Seleccionar ubicación</h3>
              <p className="text-[10px] text-gray-500">Toca en el mapa para elegir tu dirección</p>
            </div>
          </div>
        </div>
        
        {/* Map component - loads dynamically */}
        <InteractiveMap 
          position={position}
          setPosition={setPosition}
          isLoading={isLoading}
        />
        
        {/* Panel flotante de confirmación */}
        {position && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-900">Ubicación seleccionada</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {position[0]?.toFixed(4)}, {position[1]?.toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onClose}
                    className="h-8 px-3 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleConfirm} 
                    size="sm"
                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}