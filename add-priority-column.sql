-- ==========================================
-- Kartlara Priority (Öncelik) Özelliği Ekleme
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- cards tablosuna priority kolonu ekle (1-5 arası, null = önceliksiz)
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS priority integer DEFAULT NULL CHECK (priority >= 1 AND priority <= 5);

-- Priority için index ekle (filtreleme/sıralama için)
CREATE INDEX IF NOT EXISTS idx_cards_priority ON public.cards(priority);

-- ==========================================
-- Güncelleme Tamamlandı! ✅
-- ==========================================
-- Artık kartlara 1-5 arası yıldız verebilirsiniz.
-- null = yıldız yok
-- 1-5 = yıldız sayısı

