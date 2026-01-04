# 📋 Çoklu Board Sistemi Rehberi

Bu rehber, uygulamaya eklenen çoklu board sisteminin nasıl çalıştığını ve nasıl kullanılacağını açıklar.

## 🎯 Genel Bakış

Çoklu board sistemi ile her kullanıcı birden fazla bağımsız board oluşturabilir ve yönetebilir. Her board'un kendi kolonları, kartları, widget'ları ve raporları vardır.

## 📊 Veritabanı Yapısı

### Boards Tablosu

```sql
CREATE TABLE public.boards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Yeni Board',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### İlişkiler

- **Columns**: Her kolon bir board'a aittir (`board_id` foreign key)
- **Cards**: Her kart bir board'a aittir (`board_id` foreign key)
- **User Widgets**: Her widget bir board'a aittir (`board_id` foreign key)
- **Reports**: Her rapor bir board'a bağlıdır (`board_id` foreign key)

### Row Level Security (RLS)

Her tablo için kullanıcı bazlı RLS politikaları uygulanmıştır:
- Kullanıcılar sadece kendi boardlarını görebilir
- Kullanıcılar sadece kendi boardlarındaki kolonları, kartları ve widget'ları görebilir

## 🚀 Özellikler

### 1. Board Oluşturma

```javascript
const handleCreateBoard = async (name) => {
  const maxOrder = boards.length > 0 
    ? Math.max(...boards.map(b => b.order || 0)) 
    : 0;

  const { data, error } = await createBoard(name, maxOrder + 1);
  
  if (!error && data) {
    setBoards(prev => [...prev, data]);
    setActiveBoard(data);
  }
};
```

### 2. Board Değiştirme

```javascript
const handleBoardChange = (board) => {
  setActiveBoard(board);
  // Board değiştiğinde veriler otomatik yüklenir
};
```

### 3. Board Yeniden Adlandırma

```javascript
const handleBoardRename = async (boardId, newName) => {
  const { data, error } = await updateBoard(boardId, { name: newName });
  
  if (!error && data) {
    setBoards(prev => prev.map(b => b.id === boardId ? data : b));
  }
};
```

### 4. Board Silme

```javascript
const handleBoardDelete = async (boardId) => {
  const { error } = await deleteBoard(boardId);
  
  if (!error) {
    setBoards(boards.filter(b => b.id !== boardId));
    // Aktif board başka bir board'a geçer
  }
};
```

## 🎨 UI Komponenti: BoardTabs

Board navigasyonu için Excel sheet benzeri bir tab sistemi kullanılır.

### Özellikler

- ✅ Yatay scroll ile tüm boardları görüntüleme
- ✅ Aktif board vurgulama
- ✅ Inline düzenleme (tab'a çift tıklama)
- ✅ Sağ tıklama context menüsü
- ✅ Yeni board ekleme butonu
- ✅ Drag & drop desteği (gelecek versiyon)

### Kullanım

```jsx
<BoardTabs
  boards={boards}
  activeBoard={activeBoard}
  onBoardChange={handleBoardChange}
  onBoardCreate={handleCreateBoard}
  onBoardRename={handleBoardRename}
  onBoardDelete={handleBoardDelete}
/>
```

## 📊 Raporlama Sistemi

### Board Bazlı Raporlar

Raporlar artık board'a özeldir:

```javascript
// Rapor oluştururken board_id belirtilir
const { data, error } = await createReport(
  title, 
  description, 
  snapshotData, 
  boardId  // <-- Board ID
);

// Raporları board'a göre filtreleme
const filteredReports = reports.filter(report => {
  if (selectedBoardFilter !== 'all') {
    return report.board_id === selectedBoardFilter;
  }
  return true;
});
```

### Rapor Oluşturma Modalı

```jsx
<CreateReportModal
  isOpen={showCreateModal}
  boards={boards}  // <-- Tüm boardlar listesi
  onSave={handleCreateReport}
  onCancel={() => setShowCreateModal(false)}
/>
```

## 🔄 Veri Akışı

### İlk Yükleme

1. Kullanıcının tüm boardları yüklenir
2. İlk board (veya en son kullanılan) aktif yapılır
3. Aktif board'un verileri yüklenir (kolonlar, kartlar, widget'lar)

### Board Değişimi

1. Kullanıcı board tab'ına tıklar
2. `activeBoard` state güncellenir
3. `useEffect` tetiklenir ve yeni board'un verileri yüklenir

### Veri İzolasyonu

Her board'un verileri birbirinden bağımsızdır:

```javascript
// Board-specific data loading
const loadData = async () => {
  if (!activeBoard) return;
  
  const [columnsResult, cardsResult] = await Promise.all([
    getColumns(activeBoard.id),  // Board ID ile filtreleme
    getCards(activeBoard.id),
  ]);
  
  // ...
};
```

## 🔧 API Fonksiyonları

### Board CRUD

```javascript
// Tüm boardları getir
export const getBoards = async () => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('order', { ascending: true });
  
  return { data, error };
};

// Board oluştur
export const createBoard = async (name, order) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('boards')
    .insert([{ name, order, user_id: user.id }])
    .select()
    .single();
  
  return { data, error };
};

// Board güncelle
export const updateBoard = async (boardId, updates) => {
  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)
    .select()
    .single();
  
  return { data, error };
};

// Board sil
export const deleteBoard = async (boardId) => {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId);
  
  return { error };
};
```

### Board-Filtered Data

```javascript
// Kolonları board'a göre getir
export const getColumns = async (boardId) => {
  let query = supabase
    .from('columns')
    .select('*');
  
  if (boardId) {
    query = query.eq('board_id', boardId);
  }
  
  const { data, error } = await query.order('order', { ascending: true });
  return { data, error };
};
```

## 🎯 Kullanım Senaryoları

### 1. Proje Bazlı Organizasyon

```
Board 1: "Proje A"
  - Kolonlar: Backlog, In Progress, Done
  - Kartlar: Proje A'ya özel görevler

Board 2: "Proje B"
  - Kolonlar: Todo, Doing, Review, Done
  - Kartlar: Proje B'ye özel görevler
```

### 2. Departman Bazlı Yönetim

```
Board 1: "Yazılım Geliştirme"
Board 2: "Marketing"
Board 3: "Satış"
```

### 3. Zaman Bazlı Planlama

```
Board 1: "Q1 2026"
Board 2: "Q2 2026"
Board 3: "Q3 2026"
```

## 🔐 Güvenlik

### RLS Politikaları

Tüm board verileri kullanıcı bazlı izole edilmiştir:

```sql
-- Örnek RLS politikası
CREATE POLICY "Users can view own board columns" ON public.columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );
```

### Cascade Silme

Board silindiğinde ilişkili tüm veriler otomatik silinir:
- Kolonlar (`ON DELETE CASCADE`)
- Kartlar (`ON DELETE CASCADE`)
- Widget'lar (`ON DELETE CASCADE`)
- Raporlar (`ON DELETE SET NULL`)

## 🚀 Gelecek Geliştirmeler

- [ ] Board şablonları
- [ ] Board kopyalama
- [ ] Board arşivleme
- [ ] Board paylaşma (başka kullanıcılarla)
- [ ] Board tema ayarları
- [ ] Board export/import
- [ ] Board activity log

## 📝 Migration Notu

Mevcut kullanıcılar için:
- Migration script otomatik olarak varsayılan board oluşturur
- Tüm mevcut kolonlar, kartlar ve widget'lar bu board'a atanır
- Board adı: "Ana Board"

```sql
-- Migration kodu (add-boards-system.sql içinde)
DO $$
DECLARE
  v_user_id uuid;
  v_default_board_id uuid;
BEGIN
  FOR v_user_id IN 
    SELECT DISTINCT user_id FROM public.columns WHERE user_id IS NOT NULL
  LOOP
    INSERT INTO public.boards (user_id, name, "order")
    VALUES (v_user_id, 'Ana Board', 1)
    RETURNING id INTO v_default_board_id;
    
    UPDATE public.columns 
    SET board_id = v_default_board_id 
    WHERE user_id = v_user_id AND board_id IS NULL;
  END LOOP;
END $$;
```

## 🎓 Öğrenilen Dersler

1. **Veritabanı Tasarımı**: Board ID'yi hem kolonlara hem de kartlara eklemek (denormalizasyon) sorguları hızlandırır
2. **RLS Politikaları**: Güvenlik için tüm sorgularda board ownership kontrolü yapılması önemli
3. **UI/UX**: Excel-benzeri tab navigasyonu kullanıcılar için tanıdık ve kolay
4. **State Yönetimi**: Board değiştiğinde tüm ilgili verilerin yeniden yüklenmesi gerekir

---

**Happy Boarding! 🚀**

