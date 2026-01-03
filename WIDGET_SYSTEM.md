# 📊 Özelleştirilebilir Widget Sistemi

## 🎯 Widget Tipleri

### 1. **total_cards** - Toplam Kart Sayısı
- İkon: 📊
- Değer: Tüm kartların sayısı
- Progress: Yok
- Ayarlar: Renk seçimi

### 2. **total_price** - Toplam Değer
- İkon: 💰
- Değer: Tüm kartların toplam fiyatı
- Progress: Yok
- Ayarlar: Para birimi, format

### 3. **high_priority** - Yüksek Öncelikli Kartlar
- İkon: ⭐
- Değer: 4-5 yıldızlı kartların sayısı
- Progress: Yüzdelik gösterim
- Ayarlar: Min öncelik seviyesi (3, 4, 5)

### 4. **column_count** - Kolon Sayısı
- İkon: 📋
- Değer: Toplam kolon sayısı
- Progress: Yok
- Ayarlar: Renk

### 5. **column_cards** - Belirli Kolonun Kartları
- İkon: 📝
- Değer: Seçilen kolonun kart sayısı
- Progress: Kolonun toplam içindeki yüzdesi
- Ayarlar: **column_id** (hangi kolon)

### 6. **column_total** - Belirli Kolonun Toplam Fiyatı
- İkon: 💵
- Değer: Seçilen kolonun toplam fiyatı
- Progress: Tüm toplam içindeki yüzdesi
- Ayarlar: **column_id**

### 7. **pinned_total** - Pinli Kolonların Toplamı
- İkon: 📌
- Değer: Pinli kolonlardaki toplam fiyat
- Progress: Tüm toplam içindeki yüzdesi
- Ayarlar: Renk

### 8. **average_price** - Ortalama Kart Fiyatı
- İkon: 📈
- Değer: Ortalama kart fiyatı
- Progress: Yok
- Ayarlar: Format

### 9. **completed_cards** - Tamamlanan Kartlar
- İkon: ✅
- Değer: Belirli kolondaki kartlar
- Progress: Tüm kartlara göre yüzde
- Ayarlar: **column_id** (tamamlandı kolonu)

---

## 🎨 Renk Temaları

Kullanıcı seçebilir:
- **Mavi** (blue) - Varsayılan
- **Yeşil** (green) - Para/değer
- **Turuncu** (orange) - Öncelik/uyarı
- **Mor** (purple) - Özel
- **Kırmızı** (red) - Kritik
- **Sarı** (yellow) - Dikkat

---

## 🛠️ Kullanıcı Özellikleri

### ✅ Widget Ekleme
1. "➕ Widget Ekle" butonuna tıkla
2. Widget tipini seç
3. Başlık gir
4. İkon seç
5. Ayarları yap (renk, kolon seç, vs.)
6. Kaydet

### ✅ Widget Düzenleme
1. Widget'a sağ tık veya "⋮" menü
2. Başlık değiştir
3. İkon değiştir
4. Renk değiştir
5. Ayarları güncelle

### ✅ Widget Silme
1. Widget menüsünden "Sil"
2. Onay ver
3. Kaldırılır

### ✅ Widget Sıralama
1. Widget'ı sürükle
2. İstediğin yere bırak
3. Sıra otomatik güncellenir

---

## 💾 Veritabanı Yapısı

```sql
user_widgets
├── id (uuid)
├── user_id (uuid)
├── widget_type (enum)
├── title (text)
├── icon (text)
├── settings (jsonb)
│   ├── column_id
│   ├── color
│   ├── show_progress
│   └── priority_min
├── order (integer)
├── created_at
└── updated_at
```

---

## 🚀 Sonraki Adımlar

1. ✅ Veritabanı oluşturuldu
2. ⏳ Widget bileşenleri
3. ⏳ Ekleme/düzenleme modal'ı
4. ⏳ Drag & drop implementasyonu
5. ⏳ Supabase entegrasyonu

