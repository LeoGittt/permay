# 🚀 Guía de Migración a Supabase para Permay

Esta guía te llevará paso a paso para integrar Supabase en tu proyecto Permay y tener un sistema completo de gestión de productos.

## 📋 Requisitos Previos

- Cuenta en [Supabase](https://supabase.com)
- Node.js instalado
- El proyecto Permay funcionando localmente

## 🛠️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase
1. Ve a [app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Guarda la URL y la clave pública (anon key)

### 1.2 Configurar Variables de Entorno
1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
   ```

### 1.3 Crear Tablas en Supabase
1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido completo del archivo `supabase/schema.sql`

## 🔄 Paso 2: Migrar Datos Existentes

### 2.1 Instalar Dependencias para Migración
```bash
npm install -D tsx
```

### 2.2 Ejecutar Script de Migración
```bash
npx tsx scripts/migrate-products.ts
```

Este script:
- ✅ Crea marcas y categorías únicas
- ✅ Migra todos los productos existentes
- ✅ Maneja errores y duplicados
- ✅ Muestra progreso detallado

## 🎯 Paso 3: Actualizar la Aplicación

### 3.1 Cambiar Hook de Productos
En `app/page.tsx`, reemplaza:
```typescript
import { useProducts } from "@/hooks/useProducts"
```

Por:
```typescript
import { useProducts } from "@/hooks/useProductsSupabase"
```

### 3.2 Actualizar Hook de Carrito (Opcional)
Para integración completa con órdenes, reemplaza:
```typescript
import { useCart } from "@/hooks/useCart"
```

Por:
```typescript
import { useCartWithSupabase } from "@/hooks/useCartWithSupabase"
```

## 🔧 Paso 4: Panel de Administración

### 4.1 Acceder al Panel
Visita: `http://localhost:3000/admin`

### 4.2 Funcionalidades Disponibles
- ✅ **Gestión de Productos**: Crear, editar, eliminar productos
- ✅ **Gestión de Órdenes**: Ver y gestionar pedidos de clientes
- ✅ **Dashboard**: Estadísticas y métricas
- ✅ **Filtros Avanzados**: Búsqueda y filtrado en tiempo real

## 🚀 Paso 5: Verificar Funcionalidad

### 5.1 Verificar Productos
```bash
npm run dev
```
- Ve a la página principal
- Verifica que los productos se cargan desde Supabase
- Prueba filtros y búsqueda

### 5.2 Verificar Admin Panel
- Ve a `/admin`
- Prueba crear un nuevo producto
- Prueba editar un producto existente
- Verifica que los cambios se reflejan en la tienda

### 5.3 Verificar Órdenes (Si usas useCartWithSupabase)
- Agrega productos al carrito
- Completa una compra
- Ve al panel de admin para ver la orden

## 📊 Funcionalidades Nuevas Disponibles

### Para Usuarios
- ✅ **Productos en Tiempo Real**: Los cambios se reflejan inmediatamente
- ✅ **Mejor Rendimiento**: Paginación y carga eficiente
- ✅ **Búsqueda Avanzada**: Búsqueda en nombre, descripción y marca
- ✅ **Stock en Tiempo Real**: Control de inventario

### Para Administradores
- ✅ **CRUD Completo**: Crear, leer, actualizar, eliminar productos
- ✅ **Gestión de Órdenes**: Ver y actualizar estado de pedidos
- ✅ **Control de Stock**: Gestión de inventario
- ✅ **Productos Destacados**: Marcar productos como destacados
- ✅ **Categorización**: Gestión de marcas y categorías

## 🔐 Configuración de Seguridad (Opcional)

### Autenticación para Admin
Si quieres proteger el panel de admin:

1. **Configura Auth en Supabase**:
   - Ve a Authentication en tu dashboard
   - Configura proveedores de autenticación

2. **Agrega Middleware de Protección**:
   ```typescript
   // middleware.ts
   import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export async function middleware(req: NextRequest) {
     if (req.nextUrl.pathname.startsWith('/admin')) {
       const res = NextResponse.next()
       const supabase = createMiddlewareClient({ req, res })
       const { data: { session } } = await supabase.auth.getSession()
       
       if (!session) {
         return NextResponse.redirect(new URL('/login', req.url))
       }
     }
     return NextResponse.next()
   }
   ```

## 🐛 Solución de Problemas

### Error: "No se encuentra el módulo @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### Error: "Cannot connect to Supabase"
- Verifica las variables de entorno
- Verifica que el proyecto Supabase esté activo
- Revisa la configuración de RLS en Supabase

### Error: "Table doesn't exist"
- Asegúrate de haber ejecutado `supabase/schema.sql`
- Verifica que las tablas se crearon correctamente

### Los productos no se muestran
- Verifica que se ejecutó la migración correctamente
- Revisa los logs en la consola del navegador
- Verifica las políticas RLS en Supabase

## 📈 Próximos Pasos

1. **Analytics**: Agregar métricas de ventas y productos más vendidos
2. **Imágenes**: Implementar upload de imágenes a Supabase Storage
3. **Notificaciones**: Sistema de notificaciones para nuevas órdenes
4. **API REST**: Crear endpoints para integraciones externas
5. **Multi-tienda**: Soporte para múltiples sucursales

## 💡 Consejos

- **Backup**: Siempre haz backup antes de migrar
- **Testing**: Prueba en un entorno de desarrollo primero
- **Monitoreo**: Revisa los logs de Supabase regularmente
- **Performance**: Usa índices para consultas frecuentes
- **Seguridad**: Revisa las políticas RLS periódicamente

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica los logs en Supabase Dashboard
3. Revisa esta documentación paso a paso
4. Consulta la [documentación oficial de Supabase](https://supabase.com/docs)

¡Listo! Ahora tienes un sistema completo de gestión de productos con Supabase. 🎉
