-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Products can be inserted by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be updated by authenticated users" ON products;

-- Crear nuevas políticas permisivas para CRUD completo
CREATE POLICY "Products can be inserted by anyone" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Products can be updated by anyone" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Products can be deleted by anyone" ON products
    FOR DELETE USING (true);

-- También para marcas y categorías
CREATE POLICY "Brands can be inserted by anyone" ON brands
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Categories can be inserted by anyone" ON categories
    FOR INSERT WITH CHECK (true);
