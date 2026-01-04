-- ==========================================
-- BOARDS SİSTEMİ - Çoklu Board Desteği
-- ==========================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Boards Tablosu Oluştur
CREATE TABLE IF NOT EXISTS public.boards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Yeni Board',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Boards tablosuna RLS ekle
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Boards politikaları - Kullanıcı sadece kendi boardlarını görebilir
DROP POLICY IF EXISTS "Users can view own boards" ON public.boards;
CREATE POLICY "Users can view own boards" ON public.boards
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own boards" ON public.boards;
CREATE POLICY "Users can insert own boards" ON public.boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own boards" ON public.boards;
CREATE POLICY "Users can update own boards" ON public.boards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own boards" ON public.boards;
CREATE POLICY "Users can delete own boards" ON public.boards
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Columns tablosuna board_id ekle
ALTER TABLE public.columns 
ADD COLUMN IF NOT EXISTS board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE;

-- 4. Cards tablosuna board_id ekle (denormalizasyon - daha hızlı sorgular için)
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE;

-- 5. Reports tablosuna board_id ekle
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL;

-- 6. User Widgets tablosuna board_id ekle
ALTER TABLE public.user_widgets 
ADD COLUMN IF NOT EXISTS board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE;

-- 7. İndeksler
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON public.boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_order ON public.boards("order");
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON public.columns(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON public.cards(board_id);
CREATE INDEX IF NOT EXISTS idx_reports_board_id ON public.reports(board_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_board_id ON public.user_widgets(board_id);

-- 8. Columns RLS politikalarını güncelle
DROP POLICY IF EXISTS "Enable read access for columns" ON public.columns;
DROP POLICY IF EXISTS "Enable insert access for columns" ON public.columns;
DROP POLICY IF EXISTS "Enable update access for columns" ON public.columns;
DROP POLICY IF EXISTS "Enable delete access for columns" ON public.columns;
DROP POLICY IF EXISTS "Users can view own board columns" ON public.columns;
DROP POLICY IF EXISTS "Users can insert own board columns" ON public.columns;
DROP POLICY IF EXISTS "Users can update own board columns" ON public.columns;
DROP POLICY IF EXISTS "Users can delete own board columns" ON public.columns;

CREATE POLICY "Users can view own board columns" ON public.columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own board columns" ON public.columns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own board columns" ON public.columns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own board columns" ON public.columns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

-- 9. Cards RLS politikalarını güncelle
DROP POLICY IF EXISTS "Enable read access for cards" ON public.cards;
DROP POLICY IF EXISTS "Enable insert access for cards" ON public.cards;
DROP POLICY IF EXISTS "Enable update access for cards" ON public.cards;
DROP POLICY IF EXISTS "Enable delete access for cards" ON public.cards;
DROP POLICY IF EXISTS "Users can view own board cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own board cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update own board cards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete own board cards" ON public.cards;

CREATE POLICY "Users can view own board cards" ON public.cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own board cards" ON public.cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own board cards" ON public.cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND boards.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own board cards" ON public.cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = cards.board_id 
      AND boards.user_id = auth.uid()
    )
  );

-- 10. Reports RLS politikalarını güncelle
DROP POLICY IF EXISTS "Enable read access for reports" ON public.reports;
DROP POLICY IF EXISTS "Enable insert access for reports" ON public.reports;
DROP POLICY IF EXISTS "Enable update access for reports" ON public.reports;
DROP POLICY IF EXISTS "Enable delete access for reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- 11. User Widgets RLS politikalarını güncelle
DROP POLICY IF EXISTS "Enable read access for user_widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Enable insert access for user_widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Enable update access for user_widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Enable delete access for user_widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can view own board widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can insert own board widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can update own board widgets" ON public.user_widgets;
DROP POLICY IF EXISTS "Users can delete own board widgets" ON public.user_widgets;

CREATE POLICY "Users can view own board widgets" ON public.user_widgets
  FOR SELECT USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = user_widgets.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own board widgets" ON public.user_widgets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = user_widgets.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own board widgets" ON public.user_widgets
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = user_widgets.board_id 
      AND boards.user_id = auth.uid()
    )
  ) WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = user_widgets.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own board widgets" ON public.user_widgets
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = user_widgets.board_id 
      AND boards.user_id = auth.uid()
    )
  );

-- 12. Mevcut verileri migrate et (her kullanıcı için varsayılan board oluştur)
DO $$
DECLARE
  v_user_id uuid;
  v_default_board_id uuid;
BEGIN
  -- Her kullanıcı için
  FOR v_user_id IN 
    SELECT DISTINCT user_id 
    FROM public.columns 
    WHERE user_id IS NOT NULL
    UNION
    SELECT DISTINCT user_id 
    FROM public.cards 
    WHERE user_id IS NOT NULL
  LOOP
    -- Varsayılan board oluştur
    INSERT INTO public.boards (user_id, name, "order")
    VALUES (v_user_id, 'Ana Board', 1)
    RETURNING id INTO v_default_board_id;
    
    -- Kullanıcının tüm kolonlarını bu board'a bağla
    UPDATE public.columns 
    SET board_id = v_default_board_id 
    WHERE user_id = v_user_id AND board_id IS NULL;
    
    -- Kullanıcının tüm kartlarını bu board'a bağla
    UPDATE public.cards 
    SET board_id = v_default_board_id 
    WHERE user_id = v_user_id AND board_id IS NULL;
    
    -- Kullanıcının tüm widget'larını bu board'a bağla
    UPDATE public.user_widgets 
    SET board_id = v_default_board_id 
    WHERE user_id = v_user_id AND board_id IS NULL;
    
    -- Kullanıcının tüm raporlarını bu board'a bağla
    UPDATE public.reports 
    SET board_id = v_default_board_id 
    WHERE user_id = v_user_id AND board_id IS NULL;
  END LOOP;
END $$;

-- 13. Trigger: Cards tablosundaki board_id'yi otomatik doldur
CREATE OR REPLACE FUNCTION sync_card_board_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Card eklendiğinde veya column_id değiştiğinde board_id'yi sync et
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.column_id != OLD.column_id) THEN
    SELECT board_id INTO NEW.board_id
    FROM public.columns
    WHERE id = NEW.column_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_card_board_id_trigger ON public.cards;
CREATE TRIGGER sync_card_board_id_trigger
  BEFORE INSERT OR UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION sync_card_board_id();

-- 14. Trigger: Board updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_board_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_board_updated_at_trigger ON public.boards;
CREATE TRIGGER update_board_updated_at_trigger
  BEFORE UPDATE ON public.boards
  FOR EACH ROW
  EXECUTE FUNCTION update_board_updated_at();

-- ==========================================
-- Kurulum Tamamlandı! ✅
-- ==========================================
-- Artık her kullanıcı birden fazla board oluşturabilir.
-- Mevcut veriler otomatik olarak "Ana Board" altına taşındı.

