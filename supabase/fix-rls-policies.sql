-- Script para corregir las políticas RLS para permitir operaciones CRUD públicas
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- Eliminar TODAS las políticas existentes para productos
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be inserted by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be updated by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be inserted by anyone" ON products;
DROP POLICY IF EXISTS "Products can be updated by anyone" ON products;
DROP POLICY IF EXISTS "Products can be deleted by anyone" ON products;

-- Crear nuevas políticas que permitan acceso público completo
-- IMPORTANTE: En producción deberías usar autenticación adecuada

-- Política para ver productos (incluye activos e inactivos para el admin)
CREATE POLICY "Products public select" ON products
    FOR SELECT USING (true);

-- Política para insertar productos
CREATE POLICY "Products public insert" ON products
    FOR INSERT WITH CHECK (true);

-- Política para actualizar productos (incluyendo soft delete)
CREATE POLICY "Products public update" ON products
    FOR UPDATE USING (true);

-- Política para eliminar productos (hard delete si es necesario)
CREATE POLICY "Products public delete" ON products
    FOR DELETE USING (true);

-- También actualizamos las políticas para categorías y marcas
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON brands;
DROP POLICY IF EXISTS "Categories can be modified by anyone" ON categories;
DROP POLICY IF EXISTS "Brands can be modified by anyone" ON brands;

CREATE POLICY "Categories public select" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Categories public all" ON categories
    FOR ALL USING (true);

CREATE POLICY "Brands public select" ON brands
    FOR SELECT USING (true);

CREATE POLICY "Brands public all" ON brands
    FOR ALL USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('products', 'categories', 'brands')
ORDER BY tablename, policyname;

-- Mensaje de confirmación
SELECT 'Políticas RLS actualizadas correctamente para permitir operaciones CRUD públicas' as mensaje;
