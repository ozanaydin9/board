-- ==========================================
-- Yeni Widget Tipi: target_percentage Ekleme
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın
-- MEVCUt WIDGET'LARI BOZMAZ!

-- widget_type enum'una yeni değer ekle
DO $$ 
BEGIN
  -- target_percentage değerini ekle (yoksa)
  BEGIN
    ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'target_percentage';
  EXCEPTION 
    WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN 
      RAISE NOTICE 'target_percentage zaten mevcut veya eklenemedi';
  END;
END $$;

-- ==========================================
-- Güncelleme Tamamlandı! ✅
-- ==========================================
-- Artık "Hedef Yüzdesi" widget'ını kullanabilirsiniz.
-- 
-- Özellikler:
-- - Tamamlanan yüzde (harcanan oran)
-- - Kalan yüzde (boş oran)
-- - İki mod arasında seçim yapabilirsiniz
--
-- Mevcut widget'larınız korundu! ✅

