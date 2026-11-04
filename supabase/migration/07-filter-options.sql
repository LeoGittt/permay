-- Permay: listas completas de marcas y categorías para los filtros de la tienda.
-- Antes se armaban leyendo los productos, pero la API devuelve como máximo 1000 filas:
-- con más de 1000 productos activos faltaban marcas y categorías en los filtros.
-- Ejecutar UNA sola vez en el SQL Editor del proyecto NUEVO (gcabsfccmtuybsllshgf).

create or replace function public.get_active_brands()
returns text[]
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(array_agg(distinct brand::text order by brand::text), '{}')
  from products
  where active and coalesce(trim(brand), '') <> ''
$$;

create or replace function public.get_active_categories()
returns text[]
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(array_agg(distinct category::text order by category::text), '{}')
  from products
  where active and coalesce(trim(category), '') <> ''
$$;

-- La tienda los usa sin login
grant execute on function public.get_active_brands() to anon, authenticated;
grant execute on function public.get_active_categories() to anon, authenticated;
