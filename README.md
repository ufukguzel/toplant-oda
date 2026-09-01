# 📅 Toplantı Odası Rezervasyon Sistemi

Firebase Realtime Database ile çalışan, gerçek zamanlı bir toplantı odası rezervasyon uygulaması. Ekip üyeleri tarih seçip uygun saat aralıklarında oda rezervasyonu yapabilir; tüm değişiklikler anlık olarak tüm kullanıcılara yansır.

## ✨ Özellikler

- 🗓️ **Tarih bazlı rezervasyon** — istediğin güne ait rezervasyonları görüntüle ve yönet
- ⏰ **Saat slotları** — 08:00–20:00 arası saatlik dilimlerde rezervasyon
- 🔄 **Gerçek zamanlı senkronizasyon** — Firebase Realtime Database ile anlık güncelleme
- 🟢 **Canlı bağlantı durumu** — çevrimiçi/çevrimdışı göstergesi
- 📝 **Rezervasyon detayı** — ad ve açıklama ile kayıt
- 💻 **Modern arayüz** — React + lucide-react ikonları

## 🛠️ Teknolojiler

- **React** (fonksiyonel bileşenler + Hooks)
- **Firebase Realtime Database** (gerçek zamanlı veri senkronizasyonu)
- **lucide-react** (ikon seti)
- Firebase Hosting (dağıtım)

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Firebase yapılandırmasını main.js içinde kendi projenle güncelle
# Yerel çalıştırma / dağıtım
firebase serve      # yerel önizleme
firebase deploy     # canlıya alma
```

## 📁 Yapı

```
├── main.js                 # Ana uygulama (React bileşeni + Firebase mantığı)
├── public/
│   └── index.html          # Giriş noktası
├── firebase.json           # Firebase Hosting yapılandırması
├── firestore.rules         # Güvenlik kuralları
└── firestore.indexes.json  # İndeksler
```

## 📄 Lisans

Bu proje kişisel kullanım için geliştirilmiştir.
