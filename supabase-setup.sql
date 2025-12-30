-- ==========================================
-- Board App - Supabase Veritabanı Kurulumu
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Columns Tablosu
-- Kolon/Status bilgilerini tutar
CREATE TABLE IF NOT EXISTS public.columns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cards Tablosu
-- Kart bilgilerini tutar
CREATE TABLE IF NOT EXISTS public.cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  column_id uuid REFERENCES public.columns(id) ON DELETE CASCADE,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS (Row Level Security) Politikalarını Aktif Et
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- 4. Demo için Herkese Erişim İzni
-- ⚠️ Production'da daha güvenli politikalar kullanın!

-- Columns için politikalar
DROP POLICY IF EXISTS "Enable read access for columns" ON public.columns;
DROP POLICY IF EXISTS "Enable insert access for columns" ON public.columns;
DROP POLICY IF EXISTS "Enable update access for columns" ON public.columns;
DROP POLICY IF EXISTS "Enable delete access for columns" ON public.columns;

CREATE POLICY "Enable read access for columns" ON public.columns
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for columns" ON public.columns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for columns" ON public.columns
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for columns" ON public.columns
  FOR DELETE USING (true);

-- Cards için politikalar
DROP POLICY IF EXISTS "Enable read access for cards" ON public.cards;
DROP POLICY IF EXISTS "Enable insert access for cards" ON public.cards;
DROP POLICY IF EXISTS "Enable update access for cards" ON public.cards;
DROP POLICY IF EXISTS "Enable delete access for cards" ON public.cards;

CREATE POLICY "Enable read access for cards" ON public.cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for cards" ON public.cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for cards" ON public.cards
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for cards" ON public.cards
  FOR DELETE USING (true);

-- 5. İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_columns_order ON public.columns("order");
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON public.cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_order ON public.cards("order");

-- 6. Demo Verileri (Opsiyonel)
-- İsterseniz bu kısmı silebilirsiniz

-- Demo kolonlar
INSERT INTO public.columns (title, "order") VALUES
  ('Yapılacak', 1),
  ('Devam Eden', 2),
  ('Tamamlandı', 3)
ON CONFLICT DO NOTHING;

-- Demo kartlar (kolonların id'leri otomatik atanacak)
DO $$
DECLARE
  col_yapilacak uuid;
  col_devam uuid;
  col_tamamlandi uuid;
BEGIN
  -- Kolon id'lerini al
  SELECT id INTO col_yapilacak FROM public.columns WHERE title = 'Yapılacak' LIMIT 1;
  SELECT id INTO col_devam FROM public.columns WHERE title = 'Devam Eden' LIMIT 1;
  SELECT id INTO col_tamamlandi FROM public.columns WHERE title = 'Tamamlandı' LIMIT 1;

  -- Demo kartlar ekle
  IF col_yapilacak IS NOT NULL THEN
    INSERT INTO public.cards (title, description, price, column_id, "order") VALUES
      ('Backend API geliştirme', 'REST API endpoints oluşturulacak', 15000, col_yapilacak, 1),
      ('Veritabanı tasarımı', 'PostgreSQL şema tasarlanacak', 8000, col_yapilacak, 2);
  END IF;

  IF col_devam IS NOT NULL THEN
    INSERT INTO public.cards (title, description, price, column_id, "order") VALUES
      ('Frontend geliştirme', 'React componentleri yazılıyor', 20000, col_devam, 1),
      ('UI/UX tasarım', 'Figma tasarımları yapılıyor', 12000, col_devam, 2);
  END IF;

  IF col_tamamlandi IS NOT NULL THEN
    INSERT INTO public.cards (title, description, price, column_id, "order") VALUES
      ('Proje planlaması', 'İlk planlama tamamlandı', 5000, col_tamamlandi, 1),
      ('Teknoloji seçimi', 'React + Supabase seçildi', 3000, col_tamamlandi, 2);
  END IF;
END $$;

-- ==========================================
-- Kurulum Tamamlandı! ✅
-- ==========================================
-- Şimdi Authentication bölümünden bir kullanıcı oluşturabilirsiniz.
-- Dashboard > Authentication > Users > Add User

