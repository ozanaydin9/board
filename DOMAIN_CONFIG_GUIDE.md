# 🌐 Domain-Based Branding Rehberi

## 📝 Genel Bakış

Artık uygulamanız domain'e göre otomatik olarak branding'ini değiştirebilir. Farklı domain'lerde farklı:
- Uygulama isimleri
- Login başlıkları
- Sayfa title'ları
- Alt başlıklar
- Favicon'lar
- Renk temaları

gösterebilirsiniz!

## 🎯 Nasıl Çalışır?

### 1. Konfigürasyon Dosyası

`src/config/domainConfig.js` dosyasında tüm domain'lerin ayarlarını tanımlarsınız:

```javascript
const DOMAIN_CONFIG = {
  // Varsayılan ayarlar
  default: {
    appName: 'TaskCherry',
    title: 'TaskCherry - Görev Yönetimi',
    loginTitle: 'TaskCherry\'ye Hoş Geldiniz',
    loginSubtitle: 'Görevlerinizi tatlı bir şekilde yönetin',
    favicon: '/vite.svg',
    primaryColor: '#3b82f6',
  },
  
  // Domain-specific ayarlar
  'app.example.com': {
    appName: 'Example Boards',
    title: 'Example Boards - Project Management',
    loginTitle: 'Welcome to Example Boards',
    loginSubtitle: 'Manage your projects efficiently',
    favicon: '/example-favicon.svg',
    primaryColor: '#10b981',
  },
};
```

### 2. Otomatik Algılama

Uygulama açıldığında:
1. ✅ Mevcut domain'i algılar (`window.location.hostname`)
2. ✅ Config'den uygun ayarları bulur
3. ✅ Sayfa title'ını günceller
4. ✅ Favicon'u değiştirir
5. ✅ Login ekranını özelleştirir

## 🚀 Kullanım

### Yeni Domain Eklemek

`src/config/domainConfig.js` dosyasını açın ve yeni domain ekleyin:

```javascript
const DOMAIN_CONFIG = {
  default: { ... },
  
  // Yeni domain
  'your-domain.com': {
    appName: 'Your App Name',
    title: 'Your App - Tagline',
    loginTitle: 'Welcome to Your App',
    loginSubtitle: 'Your custom subtitle',
    favicon: '/your-favicon.svg',
    primaryColor: '#your-color',
  },
  
  // Subdomain için
  'staging.your-domain.com': {
    appName: 'Your App (Staging)',
    title: 'Your App Staging',
    loginTitle: 'Staging Environment',
    loginSubtitle: 'Testing mode',
    favicon: '/staging-favicon.svg',
    primaryColor: '#f59e0b',
  },
};
```

### Konfigürasyon Özellikleri

| Özellik | Açıklama | Örnek |
|---------|----------|-------|
| `appName` | Login ekranındaki ana başlık | "TaskCherry" |
| `title` | Browser tab title | "TaskCherry - Görev Yönetimi" |
| `loginTitle` | Login ekranı karşılama başlığı | "Hoş Geldiniz" |
| `loginSubtitle` | Login ekranı alt başlık | "Görevlerinizi yönetin" |
| `favicon` | Browser icon (public/ klasöründe) | "/vite.svg" |
| `primaryColor` | Ana renk (opsiyonel, gelecek için) | "#3b82f6" |

## 📁 Favicon Eklemek

1. Favicon dosyanızı `public/` klasörüne ekleyin:
```
public/
├── vite.svg (varsayılan)
├── example-favicon.svg
└── your-favicon.svg
```

2. Config'de favicon path'ini belirtin:
```javascript
favicon: '/your-favicon.svg',
```

## 🎨 Özelleştirme Örnekleri

### White Label SaaS

```javascript
'client1.yourapp.com': {
  appName: 'Client 1 Boards',
  title: 'Client 1 Project Management',
  loginTitle: 'Welcome to Client 1',
  loginSubtitle: 'Enterprise project management',
  favicon: '/client1-favicon.svg',
  primaryColor: '#2563eb',
},

'client2.yourapp.com': {
  appName: 'Client 2 Tasks',
  title: 'Client 2 Task Manager',
  loginTitle: 'Client 2 Portal',
  loginSubtitle: 'Powered by YourApp',
  favicon: '/client2-favicon.svg',
  primaryColor: '#dc2626',
},
```

### Staging vs Production

```javascript
'app.yourcompany.com': {
  appName: 'YourApp',
  title: 'YourApp - Production',
  loginSubtitle: 'Production environment',
  favicon: '/prod-favicon.svg',
},

'staging.yourcompany.com': {
  appName: 'YourApp [STAGING]',
  title: 'YourApp - Staging',
  loginSubtitle: '⚠️ Testing environment',
  favicon: '/staging-favicon.svg',
  primaryColor: '#f59e0b',
},

'localhost:5173': {
  appName: 'YourApp [DEV]',
  title: 'YourApp - Development',
  loginSubtitle: '🔧 Development mode',
  favicon: '/dev-favicon.svg',
},
```

### Multi-Language

```javascript
'app.yoursite.com': {
  appName: 'TaskCherry',
  loginTitle: 'Welcome to TaskCherry',
  loginSubtitle: 'Manage your tasks sweetly',
},

'tr.yoursite.com': {
  appName: 'TaskCherry',
  loginTitle: 'TaskCherry\'ye Hoş Geldiniz',
  loginSubtitle: 'Görevlerinizi tatlı bir şekilde yönetin',
},

'es.yoursite.com': {
  appName: 'TaskCherry',
  loginTitle: 'Bienvenido a TaskCherry',
  loginSubtitle: 'Gestiona tus tareas dulcemente',
},
```

## 🔍 Debugging

### Domain'i Kontrol Etme

Console'da mevcut domain'i görmek için:

```javascript
console.log('Current domain:', window.location.hostname);
console.log('Config:', getDomainConfig());
```

### Test Etme

1. **Localhost:**
```bash
npm run dev
# http://localhost:5173 açılır
# "TaskCherry Dev" görünür
```

2. **Custom Host (Test için):**
```bash
# /etc/hosts dosyasına ekleyin (Mac/Linux):
127.0.0.1 test.local

# Sonra:
npm run dev -- --host
# http://test.local:5173 açılır
```

## 📊 Production Deploy

### Subdomain Setup

1. **Vercel:**
```bash
# vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

# Her subdomain için aynı deploy kullanılır
# Otomatik domain'e göre branding yapılır
```

2. **DNS Setup:**
```
A    app.yourdomain.com    → your-ip
A    staging.yourdomain.com → your-ip
CNAME client1.yourdomain.com → app.yourdomain.com
```

### Environment Variables (Opsiyonel)

Eğer domain config'i environment variable'lardan almak isterseniz:

```javascript
// .env
VITE_APP_NAME=TaskCherry
VITE_LOGIN_SUBTITLE=Welcome

// domainConfig.js
default: {
  appName: import.meta.env.VITE_APP_NAME || 'TaskCherry',
  loginSubtitle: import.meta.env.VITE_LOGIN_SUBTITLE || 'Default subtitle',
}
```

## 🎯 Gelecek Özellikler

Domain config sistemine eklenebilecekler:

- [ ] Tema renk şemaları (CSS variables ile)
- [ ] Logo resim yolu
- [ ] Email şablonları
- [ ] Dil seçenekleri
- [ ] Feature flags (domain'e özel özellikler)
- [ ] Analytics tracking ID'leri

## 💡 İpuçları

### Best Practices

1. **Default Config:** Her zaman eksiksiz bir default config bulundurun
2. **Fallback:** Domain bulunamazsa default'a dönmeli
3. **Favicon:** SVG formatı kullanın (her boyutta keskin görünür)
4. **Title:** SEO için açıklayıcı ve unique olmalı
5. **Subtitle:** Kısa ve net (max 50 karakter)

### Common Pitfalls

❌ **Yanlış:**
```javascript
'example.com:443': { ... } // Port numarası browser'da görünmez
```

✅ **Doğru:**
```javascript
'example.com': { ... } // Port olmadan
```

❌ **Yanlış:**
```javascript
favicon: 'favicon.svg', // Slash eksik
```

✅ **Doğru:**
```javascript
favicon: '/favicon.svg', // Public folder'dan başlar
```

## 🧪 Test Checklist

Deploy öncesi test edin:

- [ ] Localhost'ta doğru config görünüyor mu?
- [ ] Production domain'de doğru config görünüyor mu?
- [ ] Favicon değişiyor mu?
- [ ] Page title doğru mu?
- [ ] Login ekranı özelleştirilmiş mi?
- [ ] Subdomain'ler ayrı config alıyor mu?
- [ ] Default config fallback çalışıyor mu?

## 📚 Örnek Kullanım Senaryoları

### Senaryo 1: Ajans/Freelance

Her müşteri için ayrı subdomain:

```javascript
'client-a.myagency.com': {
  appName: 'Client A Project Board',
  loginSubtitle: 'Powered by MyAgency',
},
```

### Senaryo 2: Multi-Tenant SaaS

Her tenant kendi branding'i:

```javascript
'tenant1.app.com': { appName: 'Tenant 1' },
'tenant2.app.com': { appName: 'Tenant 2' },
```

### Senaryo 3: Internal Tools

Şirket içi farklı departmanlar:

```javascript
'sales.internal.com': { appName: 'Sales Board' },
'dev.internal.com': { appName: 'Dev Tasks' },
```

---

**🎨 Happy Branding!**

Sorular için: GitHub Issues veya dökümantasyona başvurun.

