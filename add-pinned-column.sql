-- ==========================================
-- Kolonlara Pinned Özelliği Ekleme
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- columns tablosuna pinned kolonu ekle
ALTER TABLE public.columns 
ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;

-- Pinned kolonlar için index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_columns_pinned ON public.columns(pinned);

-- ==========================================
-- Güncelleme Tamamlandı! ✅
-- ==========================================
-- Artık kolonları pinleyebilirsiniz.

