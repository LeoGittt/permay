-- Permay: estadísticas de productos para el admin.
-- Registra cuándo alguien abre un producto, lo consulta por WhatsApp, lo agrega al
-- carrito o lo pide por WhatsApp. No guarda datos personales: solo producto, tipo y fecha.
-- Ejecutar UNA sola vez en el SQL Editor del proyecto NUEVO (gcabsfccmtuybsllshgf).

-- ===================== TABLA DE EVENTOS =====================

create table public.product_events (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  event_type varchar(20) not null
    check (event_type in ('view', 'whatsapp_query', 'add_to_cart', 'whatsapp_order')),
  quantity integer not null default 1 check (quantity between 1 and 1000),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index idx_product_events_created_at on public.product_events (created_at);
create index idx_product_events_product on public.product_events (product_id, event_type);

alter table public.product_events enable row level security;

-- La tienda registra eventos sin login, pero solo elige producto, tipo y cantidad:
-- la fecha la pone la base, así nadie puede cargar eventos en el pasado o en el futuro
revoke all on public.product_events from anon, authenticated;
grant insert (product_id, event_type, quantity) on public.product_events to anon, authenticated;
grant select on public.product_events to authenticated;
grant usage on sequence public.product_events_id_seq to anon, authenticated;

create policy "Product events can be created by anyone" on public.product_events
  for insert to anon, authenticated with check (true);
create policy "Product events admin select" on public.product_events
  for select to authenticated using (true);

-- ===================== ESTADÍSTICAS PARA EL ADMIN =====================

-- Resume los eventos desde p_since para los productos activos, en un solo JSON
create or replace function public.get_product_stats(p_since timestamptz, p_limit integer default 10)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with stats as (
    select
      p.id, p.name, p.brand, p.image,
      count(e.id) filter (where e.event_type = 'view') as views,
      count(e.id) filter (where e.event_type = 'whatsapp_query') as whatsapp_queries,
      count(e.id) filter (where e.event_type = 'add_to_cart') as cart_adds,
      count(e.id) filter (where e.event_type = 'whatsapp_order') as orders,
      coalesce(sum(e.quantity) filter (where e.event_type = 'whatsapp_order'), 0) as units
    from products p
    left join product_events e on e.product_id = p.id and e.created_at >= p_since
    where p.active
    group by p.id
  )
  select jsonb_build_object(
    'totals', (
      select jsonb_build_object(
        'views', coalesce(sum(views), 0),
        'whatsapp_queries', coalesce(sum(whatsapp_queries), 0),
        'cart_adds', coalesce(sum(cart_adds), 0),
        'units', coalesce(sum(units), 0),
        'products_without_views', count(*) filter (where views = 0),
        'tracking_since', (select min(created_at) from product_events)
      )
      from stats
    ),
    'most_viewed', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.views desc, s.name), '[]'::jsonb)
      from (select * from stats where views > 0 order by views desc, name limit p_limit) s
    ),
    'least_viewed', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.views, s.name), '[]'::jsonb)
      from (select * from stats order by views, name limit p_limit) s
    ),
    'most_queried', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.whatsapp_queries desc, s.name), '[]'::jsonb)
      from (select * from stats where whatsapp_queries > 0 order by whatsapp_queries desc, name limit p_limit) s
    ),
    'most_added', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.cart_adds desc, s.name), '[]'::jsonb)
      from (select * from stats where cart_adds > 0 order by cart_adds desc, name limit p_limit) s
    ),
    'most_ordered', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.units desc, s.name), '[]'::jsonb)
      from (select * from stats where units > 0 order by units desc, name limit p_limit) s
    )
  )
$$;

-- Solo el admin (usuario autenticado) puede ver las estadísticas
revoke execute on function public.get_product_stats(timestamptz, integer) from public, anon;
grant execute on function public.get_product_stats(timestamptz, integer) to authenticated;
