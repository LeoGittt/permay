-- Script para permitir migración de datos (ejecutar en Supabase SQL Editor)
-- PASO 1: Deshabilitar temporalmente RLS para migración

-- Deshabilitar RLS temporalmente para productos
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Opcional: También para brands y categories si vas a migrar esos datos
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
