# 🚀 Board App - Kurulum Rehberi

Bu rehber, Board App'i sıfırdan kurmak için gereken tüm adımları detaylıca anlatır.

## 📋 Ön Gereksinimler

- Node.js (v16 veya üzeri)
- Yarn veya npm
- Bir Supabase hesabı (ücretsiz)

## 1️⃣ Supabase Projesi Oluşturma

### Adım 1: Supabase Hesabı

1. [https://supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın

### Adım 2: Yeni Proje Oluşturun

1. Dashboard'da "New Project" butonuna tıklayın
2. Proje bilgilerini doldurun:
   - **Name**: Board App (veya istediğiniz bir isim)
   - **Database Password**: Güçlü bir şifre oluşturun (not alın!)
   - **Region**: Size en yakın bölgeyi seçin
3. "Create new project" butonuna tıklayın
4. Proje oluşturulurken 1-2 dakika bekleyin ☕

### Adım 3: API Bilgilerini Alın

1. Sol menüden **Settings** > **API** sekmesine gidin
2. Şu bilgileri not alın:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon/public key** (başı `eyJ` ile başlayan uzun bir string)

## 2️⃣ Veritabanı Kurulumu

### Adım 1: SQL Editor'ü Açın

1. Sol menüden **SQL Editor** sekmesine gidin
2. "+ New query" butonuna tıklayın

### Adım 2: Tabloları Oluşturun

1. Proje kök dizinindeki `supabase-setup.sql` dosyasını açın
2. Tüm içeriği kopyalayın
3. SQL Editor'e yapıştırın
4. Sağ alttaki **Run** butonuna tıklayın
5. "Success. No rows returned" mesajını görmelisiniz ✅

Bu script şunları yapar:
- `columns` ve `cards` tablolarını oluşturur
- Gerekli indeksleri ekler
- RLS politikalarını ayarlar
- Demo verilerini ekler (opsiyonel)

## 3️⃣ Authentication Kurulumu

### Adım 1: Email Authentication'ı Aktif Edin

1. Sol menüden **Authentication** > **Providers** sekmesine gidin
2. **Email** provider'ının aktif olduğundan emin olun

### Adım 2: İlk Kullanıcıyı Oluşturun

**Yöntem 1: Dashboard Üzerinden (Önerilen)**

1. Sol menüden **Authentication** > **Users** sekmesine gidin
2. "Add User" > "Create new user" butonuna tıklayın
3. Email ve şifre girin:
   - **Email**: `demo@example.com` (veya istediğiniz bir email)
   - **Password**: `demo123456` (veya güçlü bir şifre)
4. "Create user" butonuna tıklayın

**Yöntem 2: SQL ile**

```sql
-- SQL Editor'de çalıştırın
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@example.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## 4️⃣ Proje Kurulumu

### Adım 1: Bağımlılıkları Yükleyin

```bash
# Proje dizinine gidin
cd board

# Bağımlılıkları yükleyin
yarn install
# veya
npm install
```

### Adım 2: Environment Variables

1. `.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

2. `.env` dosyasını açın ve Supabase bilgilerinizi girin:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Adım 3: Uygulamayı Başlatın

```bash
yarn dev
# veya
npm run dev
```

Tarayıcınızda [http://localhost:5173](http://localhost:5173) adresini açın.

## 5️⃣ İlk Giriş

1. Login ekranında oluşturduğunuz kullanıcı bilgileriyle giriş yapın:
   - **Email**: `demo@example.com`
   - **Password**: `demo123456`

2. Başarılı giriş sonrası board ekranını görmelisiniz! 🎉

## 6️⃣ Demo Verilerini Test Edin

Eğer SQL script'ini çalıştırdıysanız, zaten 3 kolon ve 6 kart göreceksiniz:

- **Yapılacak** (2 kart)
- **Devam Eden** (2 kart)
- **Tamamlandı** (2 kart)

Şunları deneyin:
- ✅ Kartları sürükleyip başka kolonlara taşıyın
- ✅ Yeni bir kart ekleyin
- ✅ Bir kartı düzenleyin
- ✅ Yeni bir kolon oluşturun
- ✅ Fiyat toplamlarını kontrol edin

## 🔧 Sorun Giderme

### 1. "Failed to fetch" hatası

**Neden**: Supabase bağlantı bilgileri yanlış veya eksik.

**Çözüm**:
- `.env` dosyasında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini kontrol edin
- Değerlerin başında/sonunda boşluk olmadığından emin olun
- Sunucuyu yeniden başlatın (`yarn dev`)

### 2. "Invalid login credentials" hatası

**Neden**: Kullanıcı bulunamadı veya şifre yanlış.

**Çözüm**:
- Supabase Dashboard > Authentication > Users bölümünden kullanıcının var olduğundan emin olun
- Email'in doğru yazıldığından emin olun
- Şifreyi kontrol edin

### 3. Kolonlar veya kartlar görünmüyor

**Neden**: Tablolar oluşturulmamış veya RLS politikaları yanlış.

**Çözüm**:
- `supabase-setup.sql` dosyasını tekrar çalıştırın
- Tarayıcı Console'da hata mesajlarını kontrol edin
- Supabase Dashboard > Table Editor'den tabloların var olduğunu kontrol edin

### 4. Drag & Drop çalışmıyor

**Neden**: JavaScript hatası veya tarayıcı uyumsuzluğu.

**Çözüm**:
- Tarayıcı Console'ı kontrol edin
- Sayfayı yenileyin (Ctrl+F5 veya Cmd+Shift+R)
- Modern bir tarayıcı kullanın (Chrome, Firefox, Edge)

### 5. "Module not found" hatası

**Neden**: Bağımlılıklar düzgün yüklenmemiş.

**Çözüm**:
```bash
# node_modules'ü silin ve tekrar yükleyin
rm -rf node_modules
yarn install
# veya
npm install
```

## 📊 Veritabanı Yapısı

### Columns Tablosu

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid | Primary key |
| title | text | Kolon adı |
| order | integer | Sıralama |
| created_at | timestamp | Oluşturma zamanı |

### Cards Tablosu

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid | Primary key |
| title | text | Kart başlığı |
| description | text | Kart açıklaması |
| price | numeric | Fiyat |
| column_id | uuid | Bağlı olduğu kolon (foreign key) |
| order | integer | Kolon içi sıralama |
| created_at | timestamp | Oluşturma zamanı |

## 🎯 Sonraki Adımlar

Artık uygulama çalışıyor! Şimdi:

1. ✅ Kendi kolonlarınızı oluşturun
2. ✅ Projelerinizi kartlara dönüştürün
3. ✅ Fiyat takibi yapın
4. ✅ Drag & drop ile kartları yönetin

## 🚀 Production'a Alma

Production'a almadan önce:

1. **Güvenlik**: RLS politikalarını kullanıcı bazlı yapın
2. **Environment**: Production environment variables ayarlayın
3. **Build**: `yarn build` komutuyla production build alın
4. **Deploy**: Vercel, Netlify veya benzeri platformlarda deploy edin

## 📞 Yardım

Sorun yaşıyorsanız:
- README.md dosyasını okuyun
- Supabase Dashboard'dan logları kontrol edin
- Tarayıcı Console'ı kontrol edin
- GitHub'da issue açın

---

**Kurulum tamamlandı! Keyifli kullanımlar! 🎉**

