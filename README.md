# 🍒 TaskCherry - Görev Yönetim Uygulaması

Görevlerinizi tatlı bir şekilde yönetin! Modern, akıcı ve özelleştirilebilir kanban board uygulaması. React + JavaScript ile geliştirilmiştir.

## ✨ Özellikler

- ✅ **Drag & Drop**: Kartları kolonlar arasında sürükle-bırak ile taşıyın
- ✅ **Çoklu Board**: Her kullanıcı birden fazla board oluşturabilir ve yönetebilir
- ✅ **Board Navigasyonu**: Excel sheet gibi alt tab'larla boardlar arası geçiş
- ✅ **Kolon Yönetimi**: Kendi kolonlarınızı (statülerinizi) oluşturun ve yönetin
- ✅ **Kart CRUD**: Kartları oluşturun, düzenleyin, silin
- ✅ **Fiyat Takibi**: Her karta fiyat ekleyin ve kolon başlıklarında otomatik toplam görün
- ✅ **Raporlama**: Board snapshot'ları oluşturun ve board bazlı filtreleyin
- ✅ **Authentication**: Supabase ile güvenli giriş sistemi
- ✅ **Modern UI**: Custom CSS ile tasarlanmış, temiz ve profesyonel arayüz
- ✅ **Responsive**: Masaüstü ve mobil uyumlu

## 🛠️ Teknolojiler

- **React 19** - UI framework
- **Vite** - Build tool
- **@dnd-kit** - Drag & drop fonksiyonalitesi
- **Supabase** - Backend, veritabanı ve authentication
- **CSS** - Custom styling (Tailwind kullanılmadı)

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
yarn install
# veya
npm install
```

### 2. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'de `supabase-setup.sql` dosyasını çalıştırın
4. Ardından `add-boards-system.sql` dosyasını çalıştırarak çoklu board desteğini ekleyin

**Önemli:** Tüm SQL migration dosyalarını sırasıyla çalıştırmanız gerekmektedir:
- `supabase-setup.sql` (Temel tablolar)
- `add-card-note.sql`, `add-column-features.sql`, vb. (Ek özellikler)
- `add-boards-system.sql` (Çoklu board sistemi)

### 3. Environment Variables Ayarlayın

Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Bu bilgileri Supabase projenizin Settings > API sayfasından alabilirsiniz.

### 4. Kullanıcı Oluşturun

Supabase Dashboard > Authentication > Users bölümünden bir kullanıcı oluşturun veya:

```sql
-- SQL Editor'de çalıştırın
insert into auth.users (email, encrypted_password, email_confirmed_at)
values ('demo@example.com', crypt('demo123', gen_salt('bf')), now());
```

### 5. Uygulamayı Başlatın

```bash
yarn dev
# veya
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 📖 Kullanım

1. **Giriş Yapın**: Oluşturduğunuz kullanıcı bilgileri ile giriş yapın
2. **Board Yönetimi**: 
   - Ekranın alt kısmındaki tab'lardan mevcut boardlar arasında geçiş yapın
   - "+" butonuna tıklayarak yeni board oluşturun
   - Bir board'a sağ tıklayarak yeniden adlandırın veya silin
3. **Kolon Ekleyin**: "Yeni Kolon" butonuna tıklayarak kolonlar oluşturun (örn: "Yapılacak", "Devam Eden", "Tamamlanan")
4. **Kart Ekleyin**: Her kolonun altındaki "Kart Ekle" butonuna tıklayarak kart oluşturun
5. **Kart Bilgileri**: Her karta başlık, açıklama ve fiyat ekleyebilirsiniz
6. **Drag & Drop**: Kartları sürükleyerek kolonlar arasında taşıyın
7. **Raporlama**: 
   - Kullanıcı menüsünden "Raporlar" sayfasına gidin
   - Yeni rapor oluştur butonuna tıklayın
   - Board seçin ve rapor başlığı girin
   - Raporları board'a göre filtreleyin
8. **Düzenle & Sil**: Kartların ve kolonların üzerine geldiğinizde düzenleme ve silme butonları görünür

## 🎨 Proje Yapısı

```
src/
├── components/
│   ├── Board.jsx          # Ana board ekranı
│   ├── BoardTabs.jsx      # Board navigasyon tab'ları
│   ├── Column.jsx         # Kolon bileşeni
│   ├── Card.jsx          # Kart bileşeni
│   ├── CreateReportModal.jsx  # Rapor oluşturma modalı
│   └── Login.jsx         # Login ekranı
├── pages/
│   └── ReportsPage.jsx   # Raporlar sayfası
├── lib/
│   └── supabase.js       # Supabase client ve API fonksiyonları
├── styles/
│   ├── board.css         # Board stilleri
│   ├── board-tabs.css    # Board tab stilleri
│   ├── column.css        # Kolon stilleri
│   ├── card.css          # Kart stilleri
│   ├── reports-page.css  # Raporlar sayfası stilleri
│   └── login.css         # Login stilleri
├── App.jsx               # Ana uygulama bileşeni
├── App.css              # Global app stilleri
├── index.css            # Global reset ve base stiller
└── main.jsx             # Giriş noktası
```

## 🔑 Önemli Özellikler

### Çoklu Board Sistemi

- Her kullanıcı birden fazla board oluşturabilir
- Board'lar arasında Excel sheet gibi alt tab'lardan geçiş
- Sağ tıklama menüsü ile board yönetimi (yeniden adlandır, sil)
- Her board'un kendi kolonları, kartları ve widget'ları
- Board bazlı raporlama ve filtreleme

### Drag & Drop

- @dnd-kit kütüphanesi kullanılarak implementasyonu
- Kartları kolonlar içinde sıralama
- Kartları kolonlar arasında taşıma
- Smooth animasyonlar ve visual feedback

### Fiyat Toplama

- Her kartın fiyat alanı var
- Kolon başlıklarında o kolondaki tüm kartların toplam fiyatı gösterilir
- Gerçek zamanlı güncelleme

### CRUD Operasyonları

- **Kolon**: Oluştur, Güncelle, Sil
- **Kart**: Oluştur, Güncelle, Sil
- Tüm işlemler Supabase ile senkronize

## 🎯 Production Deployment

### Build

```bash
yarn build
# veya
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

### Deploy

Herhangi bir static hosting servisinde deploy edebilirsiniz:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Environment variables'ı deploy platformunda ayarlamayı unutmayın.

## 🔒 Güvenlik Notları

Bu proje demo amaçlıdır. Production kullanımı için:

1. Supabase RLS politikalarını güçlendirin
2. Kullanıcı bazlı erişim kontrolleri ekleyin
3. Rate limiting uygulayın
4. Environment variables'ı güvenli bir şekilde yönetin

## 📝 Lisans

MIT

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.

## 💡 İpuçları

- Supabase'in ücretsiz planı demo için yeterlidir
- Kartları düzenlemek için üzerine gelip edit ikonuna tıklayın
- Kolonları silmek için önce içindeki kartları silmelisiniz
- Drag & drop sırasında kartın görsel bir kopyası mouse ile birlikte hareket eder
- Board'lara sağ tıklayarak hızlıca yeniden adlandırabilir veya silebilirsiniz
- Alt kısımdaki tab'lardan board'lar arasında hızlıca geçiş yapabilirsiniz
- Raporları board bazlı filtreleyerek daha organize takip edebilirsiniz

## 📞 Destek

Herhangi bir sorunuz veya probleminiz varsa issue açabilirsiniz.

---

**Happy Coding! 🚀**
