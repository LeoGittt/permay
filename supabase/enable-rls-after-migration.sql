-- Script para rehabilitar RLS después de la migración (ejecutar en Supabase SQL Editor)
-- PASO 2: Rehabilitar RLS después de la migración

-- Rehabilitar RLS para productos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Rehabilitar para brands y categories
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Crear política más permisiva para inserción de productos (para admin)
DROP POLICY IF EXISTS "Products can be inserted by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be updated by authenticated users" ON products;

-- Nueva política que permite inserción/actualización sin autenticación (para admin panel)
CREATE POLICY "Enable insert for all users" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON products
    FOR DELETE USING (true);

-- Políticas similares para brands y categories
CREATE POLICY "Enable insert for brands" ON brands
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for brands" ON brands
    FOR UPDATE USING (true);

CREATE POLICY "Enable insert for categories" ON categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for categories" ON categories
    FOR UPDATE USING (true);
