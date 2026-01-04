-- Raporlar/Snapshot tablosu oluştur
-- Bu tablo kullanıcıların board durumunu kaydedip daha sonra görüntülemesini sağlar

-- Önce tabloyu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);

-- RLS (Row Level Security) aktif et
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
-- Kullanıcılar sadece kendi raporlarını görebilir
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi raporlarını oluşturabilir
DROP POLICY IF EXISTS "Users can create own reports" ON public.reports;
CREATE POLICY "Users can create own reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi raporlarını güncelleyebilir
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports"
  ON public.reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi raporlarını silebilir
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
CREATE POLICY "Users can delete own reports"
  ON public.reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Otomatik updated_at trigger fonksiyonu (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger ekle
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Snapshot data örnek yapısı:
-- {
--   "columns": [...],        // Tüm kolonlar
--   "cards": [...],          // Tüm kartlar
--   "widgets": [...],        // Tüm widgetlar
--   "userSettings": {...},   // Kullanıcı ayarları
--   "metadata": {
--     "totalCards": 42,
--     "totalPrice": 150000,
--     "columnCount": 5,
--     "captureDate": "2026-01-04T16:00:00Z"
--   }
-- }

