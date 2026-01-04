-- ==========================================
-- Widget Görünüm Modu Ayarı Ekleme
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- user_settings tablosuna widget_display_mode kolonu ekle
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS widget_display_mode text DEFAULT 'wrap' CHECK (widget_display_mode IN ('wrap', 'scroll'));

-- ==========================================
-- Güncelleme Tamamlandı! ✅
-- ==========================================
-- Kullanıcılar artık widget görünümünü seçebilir:
-- - 'wrap': Çok satırlı (aşağıya doğru genişler) - VARSAYILAN
-- - 'scroll': Tek satır (yatay scroll)
--
-- Mevcut ayarlar korundu! ✅

