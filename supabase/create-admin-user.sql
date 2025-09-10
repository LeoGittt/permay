-- Script para crear usuario admin en Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Crear el usuario admin
-- Ve a Authentication > Users en tu dashboard de Supabase
-- Haz clic en "Invite user"
-- Email: admin@permay.com (o el email que prefieras)
-- Contraseña: (la que elijas)

-- Alternativamente, puedes usar este script SQL:
-- NOTA: Reemplaza 'tu-email@tudominio.com' y 'tu-contraseña-segura'

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@permay.com', -- Cambia este email
  crypt('admin123456', gen_salt('bf')), -- Cambia esta contraseña
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- INSTRUCCIONES:
-- 1. Cambia 'admin@permay.com' por tu email preferido
-- 2. Cambia 'admin123456' por una contraseña segura
-- 3. Ejecuta este script en Supabase SQL Editor
-- 4. ¡Listo! Ya podes usar esas credenciales para acceder al admin
