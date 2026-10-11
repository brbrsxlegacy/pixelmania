# Işık Muhafızları: Luma Yolu

Özgün yaratıklar, Türkçe arayüz, HTML5 Canvas ve vanilla JavaScript ile hazırlanmış 2D pixel-art yaratık toplama RPG'si.

## Çalıştırma

Doğrudan `index.html` dosyasını açabilirsiniz. Daha tutarlı tarayıcı davranışı için yerel sunucu da kullanabilirsiniz:

```bash
python -m http.server 8000
```

Sonra `http://localhost:8000` adresini açın.

## Kontroller

- WASD / ok tuşları: Hareket
- Sol Shift: Koş
- E / Enter: Etkileşim ve onay
- Escape: Menü
- Q: Hızlı eşya
- F: Piknik & Mutfak
- F5: Hızlı kayıt
- F9: Hızlı yükleme

Mobilde yön pedi, etkileşim, koşu, hızlı eşya ve menü düğmeleri otomatik görünür.

## Piknik güncellemesi — 11 Ekim 2026

- Dünya ve savaşlar tekrar 2D Canvas ile çizilir. Eski 3D modülleri kaynakta saklanır ancak sayfada yüklenmez; WebGL/CDN bağımlılığı kaldırılmıştır.
- Dikey telefonda dünya ekranın üstünü doldurur; kamera oranı ekranla uyarlanır ve dokunmatik kontroller için altta ayrı alan bulunur. Küçük iç mekânlar ortalanır.
- Işık Meyvesi, Orman Mantarı ve Altın Tahıl dış haritalarda E / Etkileş ile toplanır. Bitkiler 120 saniye aktif keşif sonrası yenilenir; süre kayıtla korunur.
- Mutfaktan 3 tarif hazırlanır: Köy Ekmeği, Luma Çorbası, Piknik Tabağı. Malzemeler ve ekmek dükkândan da alınır.
- Ekipteki herhangi bir Luma yiyeceklerle iyileştirilir; mevcut açlık, enerji, dostluk sistemiyle bağlantılıdır. Çorba durum etkilerini temizler. Yiyecekler savaş dışında kullanılır.
- Bir Luma'yı art arda beslemek için 15 saniye aktif keşif gerekir. İlk Piknik görevi 3 toplama, 2 yemek ve 1 besleme ister; bir kez 150 Luma ve bir tabak verir.
- Mevcut `lumaQuest.slot.*` kayıtları ve ekipler korunur. Eski kayıtlar başlangıç malzemeleri alır; kaydedilmiş yiyecek sayıları tekrar yüklemede korunur.

## Google AdSense

AdSense yayıncı kodu ve site doğrulama etiketi projeye eklenmiştir. Kök dizindeki
`ads.txt` dosyası Render dağıtımında `https://pixelmania.onrender.com/ads.txt`
adresinden sunulur.

- Otomatik reklamlar için AdSense panelinde siteye ait **Otomatik reklamlar**
  anahtarını açın.
- Sabit reklam alanları kullanmak isterseniz AdSense'te üç görüntülü reklam
  birimi oluşturup kimliklerini `js/adsense-config.js` dosyasına girin.
- Reklamlar `localhost` veya `file://` üzerinde gerçek biçimde görünmeyebilir;
  onaylı canlı alan adında kontrol edin.
