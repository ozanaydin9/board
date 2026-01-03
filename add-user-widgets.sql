-- ==========================================
-- Kullanıcı Widget'ları Tablosu
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- Widget tipleri için enum
CREATE TYPE widget_type AS ENUM (
  'total_cards',        -- Toplam kart sayısı
  'total_price',        -- Toplam fiyat
  'high_priority',      -- Yüksek öncelikli kartlar
  'column_count',       -- Kolon sayısı
  'column_cards',       -- Belirli kolonun kart sayısı
  'column_total',       -- Belirli kolonun toplam fiyatı
  'pinned_total',       -- Pinli kolonların toplamı
  'average_price',      -- Ortalama kart fiyatı
  'completed_cards'     -- Tamamlanan kartlar (belirli kolonda)
);

-- user_widgets tablosu
CREATE TABLE IF NOT EXISTS public.user_widgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Widget bilgileri
  widget_type widget_type NOT NULL,
  title text NOT NULL,
  icon text DEFAULT '📊',
  
  -- Widget ayarları (JSONB ile esnek)
  settings jsonb DEFAULT '{}'::jsonb,
  -- Örnek settings:
  -- {
  --   "column_id": "uuid",        -- Belirli kolon için
  --   "color": "blue",            -- Renk teması
  --   "show_progress": true,      -- Progress bar göster
  --   "priority_min": 4           -- Min öncelik seviyesi
  -- }
  
  -- Sıralama
  "order" integer NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) aktif et
ALTER TABLE public.user_widgets ENABLE ROW LEVEL SECURITY;

-- Politikalar
DROP POLICY IF EXISTS "Users can view own widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can insert own widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can update own widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can delete own widgets" ON public.user_widgets;

CREATE POLICY "Users can view own widgets" ON public.user_widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widgets" ON public.user_widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets" ON public.user_widgets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets" ON public.user_widgets
  FOR DELETE USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_widgets_user_id ON public.user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_order ON public.user_widgets("order");
CREATE INDEX IF NOT EXISTS idx_user_widgets_settings ON public.user_widgets USING gin(settings);

-- updated_at otomatik güncelleme
DROP TRIGGER IF EXISTS on_user_widgets_updated ON public.user_widgets;
CREATE TRIGGER on_user_widgets_updated
  BEFORE UPDATE ON public.user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Varsayılan widget'lar ekleme fonksiyonu
CREATE OR REPLACE FUNCTION create_default_widgets(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_widgets (user_id, widget_type, title, icon, "order") VALUES
    (p_user_id, 'total_cards', 'Toplam Kart', '📊', 1),
    (p_user_id, 'total_price', 'Toplam Değer', '💰', 2),
    (p_user_id, 'high_priority', 'Yüksek Öncelik', '⭐', 3),
    (p_user_id, 'column_count', 'Kolonlar', '📋', 4);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Kurulum Tamamlandı! ✅
-- ==========================================
-- Kullanıcılar artık:
-- - Kendi widget'larını oluşturabilir
-- - Widget başlıklarını özelleştirebilir
-- - Widget'ları sıralayabilir
-- - Widget ayarlarını değiştirebilir
-- 
-- Varsayılan widget'lar için:
-- SELECT create_default_widgets(auth.uid());

