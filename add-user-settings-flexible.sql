-- ==========================================
-- Kullanıcı Ayarları Tablosu (ESNEk & GENİŞLETİLEBİLİR)
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın
-- ÖNCEKİ add-user-settings.sql YERINE BUNU KULLANIN

-- user_settings tablosu oluştur (JSONB ile esnek yapı)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Temel ayarlar (hızlı erişim için ayrı kolonlar)
  star_count integer DEFAULT 5 CHECK (star_count IN (3, 5)),
  
  -- Gelecekteki tüm ayarlar için JSONB (sınırsız genişleme)
  preferences jsonb DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- JSONB için index (hızlı arama)
CREATE INDEX IF NOT EXISTS idx_user_settings_preferences ON public.user_settings USING gin(preferences);

-- RLS (Row Level Security) aktif et
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Politikalar: Kullanıcı sadece kendi ayarlarını görebilir/düzenleyebilir
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_settings_updated ON public.user_settings;
CREATE TRIGGER on_user_settings_updated
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- ÖRNEK KULLANIM
-- ==========================================

-- Varsayılan ayarlar örneği:
-- {
--   "theme": "dark",
--   "card_style": "compact",
--   "notifications": true,
--   "color_scheme": "blue",
--   "show_prices": true,
--   "show_descriptions": true,
--   "auto_save": true
-- }

-- İleride yeni ayar eklemek için ALTER TABLE GEREKMİYOR!
-- Sadece preferences JSONB içine ekleyin:
-- UPDATE user_settings 
-- SET preferences = preferences || '{"new_feature": "value"}'::jsonb
-- WHERE user_id = auth.uid();

-- ==========================================
-- Kurulum Tamamlandı! ✅
-- ==========================================
-- Kullanıcılar artık:
-- - Yıldız sayısı (3 veya 5)
-- - Sınırsız özel ayarlar (preferences JSONB)
-- saklayabilir.
-- 
-- Mevcut kartlar/kolonlar HİÇ ETKİLENMEZ!

