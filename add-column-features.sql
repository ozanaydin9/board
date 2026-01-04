-- ==========================================
-- Kolon Özellikleri: Sıralama ve Drag & Drop
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- columns tablosuna yeni kolonlar ekle
ALTER TABLE public.columns 
ADD COLUMN IF NOT EXISTS sort_by text DEFAULT 'order' 
  CHECK (sort_by IN ('order', 'priority_high', 'priority_low', 'price_high', 'price_low', 'date_asc', 'date_desc', 'title'));

ALTER TABLE public.columns 
ADD COLUMN IF NOT EXISTS sort_order text DEFAULT 'asc' 
  CHECK (sort_order IN ('asc', 'desc'));

-- Sıralama için index
CREATE INDEX IF NOT EXISTS idx_columns_sort_by ON public.columns(sort_by);

-- ==========================================
-- Güncelleme Tamamlandı! ✅
-- ==========================================
-- Kolonlar artık kendi sıralama ayarlarına sahip:
-- 
-- sort_by seçenekleri:
-- - 'order': Manuel sıralama (varsayılan, drag & drop)
-- - 'priority_high': Öncelik (yüksek üstte)
-- - 'priority_low': Öncelik (düşük üstte)
-- - 'price_high': Fiyat (yüksek üstte)
-- - 'price_low': Fiyat (düşük üstte)
-- - 'date_asc': Tarih (eskiden yeniye)
-- - 'date_desc': Tarih (yeniden eskiye)
-- - 'title': Alfabetik
--
-- Mevcut kolonlar korundu! ✅

