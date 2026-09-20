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
- F5: Hızlı kayıt
- F9: Hızlı yükleme

Mobilde yön pedi, etkileşim, koşu, hızlı eşya ve menü düğmeleri otomatik görünür.

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
