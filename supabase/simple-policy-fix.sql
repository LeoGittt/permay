-- Script simple para verificar y crear solo las políticas necesarias
-- Ejecutar este script si el anterior sigue dando problemas

-- Verificar políticas actuales
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- Solo crear la política de UPDATE si no existe
DO $$
BEGIN
    -- Intentar crear la política de UPDATE para productos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Products public update'
    ) THEN
        EXECUTE 'CREATE POLICY "Products public update" ON products FOR UPDATE USING (true)';
        RAISE NOTICE 'Política de UPDATE creada exitosamente';
    ELSE
        RAISE NOTICE 'Política de UPDATE ya existe';
    END IF;
    
    -- Intentar crear la política de DELETE para productos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Products public delete'
    ) THEN
        EXECUTE 'CREATE POLICY "Products public delete" ON products FOR DELETE USING (true)';
        RAISE NOTICE 'Política de DELETE creada exitosamente';
    ELSE
        RAISE NOTICE 'Política de DELETE ya existe';
    END IF;
END
$$;

-- Verificar que las políticas estén activas
SELECT 'Verificación de políticas completada' as resultado;
