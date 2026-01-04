-- ==========================================
-- Kartlara Note (Not/Tarih) Alanı Ekleme
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- cards tablosuna note kolonu ekle
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS note text DEFAULT NULL;

-- Note için index ekle (arama için)
CREATE INDEX IF NOT EXISTS idx_cards_note ON public.cards(note) WHERE note IS NOT NULL;

-- ==========================================
-- Güncelleme Tamamlandı! ✅
-- ==========================================
-- Kartlara artık kısa not/tarih ekleyebilirsiniz.
-- Örnek kullanımlar:
-- - "15 Ocak 2026"
-- - "Müşteri: Ahmet Bey"
-- - "Deadline: Cuma"
-- - "v2.0"

