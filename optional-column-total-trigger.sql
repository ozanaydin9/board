-- ==========================================
-- OPSİYONEL: Kolon Toplamını DB'de Tutma
-- ==========================================
-- Bu script'i SADECE fiyat toplamını veritabanında tutmak isterseniz kullanın.
-- Normal kullanım için GEREKLI DEĞİLDİR!

-- 1. Columns tablosuna total_price kolonu ekle
ALTER TABLE public.columns 
ADD COLUMN IF NOT EXISTS total_price numeric DEFAULT 0;

-- 2. Toplam fiyatı güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_column_total()
RETURNS TRIGGER AS $$
BEGIN
  -- İlgili kolonun toplam fiyatını güncelle
  UPDATE public.columns
  SET total_price = (
    SELECT COALESCE(SUM(price), 0)
    FROM public.cards
    WHERE column_id = COALESCE(NEW.column_id, OLD.column_id)
  )
  WHERE id = COALESCE(NEW.column_id, OLD.column_id);
  
  -- Eğer kolon değişmişse, eski kolonun toplamını da güncelle
  IF (TG_OP = 'UPDATE' AND OLD.column_id IS DISTINCT FROM NEW.column_id) THEN
    UPDATE public.columns
    SET total_price = (
      SELECT COALESCE(SUM(price), 0)
      FROM public.cards
      WHERE column_id = OLD.column_id
    )
    WHERE id = OLD.column_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_update_column_total ON public.cards;
CREATE TRIGGER trigger_update_column_total
  AFTER INSERT OR UPDATE OR DELETE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION update_column_total();

-- 4. Mevcut verilerin toplamını hesapla
UPDATE public.columns c
SET total_price = (
  SELECT COALESCE(SUM(price), 0)
  FROM public.cards
  WHERE column_id = c.id
);

-- ==========================================
-- KULLANIM NOTU:
-- ==========================================
-- Bu script'i çalıştırırsanız, Column.jsx'de değişiklik yapmanız gerekir:
-- 
-- Şu satırı:
--   const totalPrice = cards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
-- 
-- Bu şekilde değiştirin:
--   const totalPrice = parseFloat(column.total_price) || 0;
-- ==========================================

