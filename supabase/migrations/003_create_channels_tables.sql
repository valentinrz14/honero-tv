-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5E3C',
  icon TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  slug TEXT NOT NULL,
  logo_url TEXT NOT NULL DEFAULT '',
  description TEXT,
  is_evento BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stream options for each channel (multiple sources per channel)
CREATE TABLE IF NOT EXISTS public.stream_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Opción 1',
  stream_url TEXT NOT NULL,
  has_ads BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0, -- lower = preferred
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channels_category ON public.channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_active ON public.channels(is_active);
CREATE INDEX IF NOT EXISTS idx_stream_options_channel ON public.stream_options(channel_id);
CREATE INDEX IF NOT EXISTS idx_stream_options_active ON public.stream_options(is_active);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_options ENABLE ROW LEVEL SECURITY;

-- Read-only access for all authenticated/anon users
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Active channels are viewable by everyone" ON public.channels
  FOR SELECT USING (is_active = true);

CREATE POLICY "Active stream options are viewable by everyone" ON public.stream_options
  FOR SELECT USING (is_active = true);

-- RPC function to fetch all channels with their stream options and categories in one call
CREATE OR REPLACE FUNCTION public.get_channels_with_options()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'categories', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'color', c.color,
          'icon', c.icon
        ) ORDER BY c.sort_order, c.name
      )
      FROM public.categories c
      WHERE c.is_active = true
    ),
    'channels', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ch.id,
          'name', ch.name,
          'category', ch.category_id,
          'slug', ch.slug,
          'logoUrl', ch.logo_url,
          'description', ch.description,
          'isEvento', ch.is_evento,
          'streamOptions', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'id', so.id,
                'label', so.label,
                'streamUrl', so.stream_url,
                'hasAds', so.has_ads,
                'priority', so.priority
              ) ORDER BY so.priority, so.label
            ), '[]'::jsonb)
            FROM public.stream_options so
            WHERE so.channel_id = ch.id AND so.is_active = true
          )
        ) ORDER BY ch.sort_order, ch.name
      )
      FROM public.channels ch
      WHERE ch.is_active = true
    )
  ) INTO result;

  RETURN result;
END;
$$;
