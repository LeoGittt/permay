-- Migración para agregar sistema de ofertas
-- Fecha: 10 de septiembre de 2025

-- Agregar campo on_sale a la tabla products
ALTER TABLE products 
ADD COLUMN on_sale BOOLEAN DEFAULT false;

-- Crear índice para mejorar el rendimiento de consultas de ofertas
CREATE INDEX idx_products_on_sale ON products(on_sale);

-- Actualizar el trigger para que incluya on_sale en las actualizaciones
-- (El trigger ya existe y funcionará automáticamente)

-- Política RLS para ofertas (misma que productos normales)
-- Las políticas existentes ya cubren este nuevo campo

COMMENT ON COLUMN products.on_sale IS 'Indica si el producto está actualmente en oferta';
