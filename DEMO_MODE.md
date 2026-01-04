# 🎨 Demo Mod - Board Tabs Tasarım Önizlemesi

## Mükemmel! Artık DB güncellemeden tasarımı görebilirsiniz!

### 🚀 Hemen Test Edin

```bash
npm run dev
```

## 🎯 Ne Göreceksiniz?

### Demo Mod Özellikleri

✅ **Board Tabs Navigasyonu** - Ekranın altında Excel sheet benzeri tab'lar  
✅ **4 Örnek Board** - Ana Board, Proje A, Proje B, Kişisel  
✅ **Tab Geçişleri** - Board'lar arası görsel geçiş  
✅ **Context Menü** - Sağ tıklama ile rename/delete  
✅ **Yeniden Adlandırma** - Board isimlerini değiştirme (görsel)  
✅ **Board Silme** - Board'ları silme (görsel)  
✅ **Yeni Board Ekleme** - "+" butonu (bilgilendirme mesajı verir)  
✅ **Mevcut Verileriniz** - Tüm kolonlar ve kartlar normal çalışır  
✅ **Demo Badge** - Sol altta "🎨 DEMO" badge'i

### 📺 Görsel Önizleme

```
┌──────────────────────────────────────────────────┐
│  Widget'lar | Ana Board         | Ayarlar | 👤   │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Yapılacak]  [Devam Eden]  [Tamamlanan]       │
│                                                  │
│    Mevcut kartlarınız burada görünür             │
│                                                  │
├──────────────────────────────────────────────────┤
│ 🎨 DEMO │ [Ana Board] [Proje A] [Proje B] [+]  │ ← Board Tabs
└──────────────────────────────────────────────────┘
```

## 🎮 Demo Modda Yapabilecekleriniz

### ✅ Çalışan Özellikler (Görsel)

1. **Board Tab'larına Tıklama**
   - Tab'lara tıklayın → Görsel olarak değişir
   - Console'da hangi board'a geçtiğinizi görürsünüz
   - Mevcut verileriniz tüm board'larda aynı görünür (DB olmadığı için)

2. **Sağ Tıklama Menüsü**
   - Board tab'ına sağ tıklayın
   - "Yeniden Adlandır" veya "Board'u Sil" seçenekleri
   - Görsel olarak çalışır

3. **Board Yeniden Adlandırma**
   - Sağ tıklama → Yeniden Adlandır
   - Yeni isim girin → Enter
   - Tab ismi görsel olarak değişir

4. **Board Silme**
   - Sağ tıklama → Board'u Sil
   - Onay ver → Tab görsel olarak kaybolur
   - Son board silinemez (koruma var)

5. **Tab Tasarımı İnceleme**
   - Hover efektleri
   - Aktif tab vurgulama
   - Smooth geçişler
   - Excel-benzeri görünüm

### ⚠️ Bilgilendirme Veren Özellikler

1. **"+" Butonu (Yeni Board Ekleme)**
   - Tıklarsanız: Açıklayıcı mesaj gösterir
   - Mesaj: "Bu sadece görsel demo! Gerçek board için SQL çalıştırın"
   - Tasarımı görebilirsiniz

## 🎨 Demo Mod Console Mesajları

Konsol'da göreceğiniz yararlı mesajlar:

```
🎨 DEMO MOD: Board tabs tasarımını görmek için mock data kullanılıyor...
💡 İpucu: Gerçek board sistemi için add-boards-system.sql dosyasını çalıştırın

🎨 DEMO MOD: "Proje A" board'una geçildi (görsel demo)
🎨 DEMO MOD: Board yeniden adlandırma görsel demo
🎨 DEMO MOD: Board silme görsel demo
```

## 🔄 Gerçek Sisteme Geçiş

### Tasarımdan Memnun Kaldınız mı?

Şimdi gerçek sisteme geçebilirsiniz:

```bash
# 1. Supabase Dashboard'a gidin
# 2. SQL Editor'e gidin
# 3. add-boards-system.sql dosyasını yapıştırın
# 4. "Run" butonuna tıklayın
# 5. Sayfayı yenileyin (F5)
```

### Gerçek Sistemde Değişen Neler?

```diff
- 🎨 DEMO badge kaybolur
+ ✅ Gerçek board'lar oluşturulur
+ ✅ Her board'un kendi verileri olur
+ ✅ "+" butonu gerçekten board oluşturur
+ ✅ Veriler database'e kaydedilir
+ ✅ Board'lar kalıcı olur
```

## 🎯 Demo vs Gerçek Sistem

| Özellik | Demo Mod | Gerçek Sistem |
|---------|----------|---------------|
| Board Tabs Görünümü | ✅ Evet | ✅ Evet |
| Tab Geçişleri | ✅ Görsel | ✅ Gerçek |
| Context Menü | ✅ Evet | ✅ Evet |
| Rename/Delete | ✅ Görsel | ✅ Kalıcı |
| Yeni Board Ekleme | ⚠️ Mesaj | ✅ Gerçek |
| Mevcut Veriler | ✅ Çalışır | ✅ Çalışır |
| Board Başına Veri | ❌ Aynı | ✅ Ayrı |
| Kalıcı Değişiklik | ❌ Hayır | ✅ Evet |
| Demo Badge | ✅ Evet | ❌ Hayır |

## 💡 Yararlı İpuçları

### Demo Modda İnceleyeceğiniz Şeyler

✅ **Görsel Tasarım**
- Board tabs'ların konumu (alt kısımda)
- Tab'ların rengi ve stili
- Hover efektleri
- Aktif tab vurgulama

✅ **Interaksiyon**
- Tab'lara tıklama
- Sağ tıklama menüsü
- Inline düzenleme UI'ı
- Smooth geçişler

✅ **Layout**
- Board tabs'ların board content'e etkisi
- Scroll davranışı
- Responsive tasarım (pencereyi küçültün)

✅ **Context Menü**
- Sağ tıklama deneyimi
- Menü konumlandırması
- Overlay'in çalışması

### Demo Modda Test Senaryoları

1. **Tab Geçişi**
   ```
   Ana Board → Proje A → Proje B → Kişisel
   Görsel değişimi gözlemleyin
   ```

2. **Yeniden Adlandırma**
   ```
   Proje A'ya sağ tıkla
   → Yeniden Adlandır
   → "Yazılım Projesi" yaz
   → Enter
   ```

3. **Board Silme**
   ```
   Kişisel'e sağ tıkla
   → Board'u Sil
   → Onay ver
   → Tab kaybolur
   ```

4. **Tasarım İncelemesi**
   ```
   Pencereyi küçült/büyüt
   → Responsive davranışı gözlemle
   Tab'lara hover yap
   → Hover efektlerini gözlemle
   ```

## 🎓 Sonuç

### Demo Mod Avantajları

✅ **Sıfır Risk** - DB'ye dokunmadan test  
✅ **Hızlı Önizleme** - Anında görsel feedback  
✅ **Güvenli Test** - Mevcut veriler etkilenmez  
✅ **Tasarım İnceleme** - UI/UX'i rahatça test edin  

### Gerçek Sisteme Geçmeden Önce

- [ ] Tab tasarımını beğendiniz mi?
- [ ] Konumlandırma uygun mu?
- [ ] Renkler ve stiller hoşunuza gitti mi?
- [ ] Context menü kullanışlı mı?
- [ ] Genel akış mantıklı mı?

### Hepsi Tamam mı? → Gerçek Sisteme Geçin!

```sql
-- Supabase > SQL Editor
-- add-boards-system.sql çalıştır
```

---

**Demo Modun Tadını Çıkarın! 🎨**

Sorular için: MIGRATION_SAFETY.md ve BOARDS_GUIDE.md dosyalarına bakın.

