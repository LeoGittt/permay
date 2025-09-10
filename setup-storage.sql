-- Crear bucket para imágenes de productos
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear el bucket 'product-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- 2. Crear política para permitir que cualquiera pueda ver las imágenes (públicas)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- 3. Crear política para permitir subir imágenes (puedes ajustar esto según tus necesidades de seguridad)
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- 4. Crear política para permitir eliminar imágenes
CREATE POLICY "Allow deletes" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- 5. Verificar que el bucket se creó correctamente
SELECT * FROM storage.buckets WHERE id = 'product-images';
