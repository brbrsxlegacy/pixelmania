(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.items = {
    isikMeyvesi: { id: "isikMeyvesi", name: "Işık Meyvesi", category: "Yiyecek", price: 25, sell: 10, food: { heal: 12, hunger: 24, energy: 6, friendship: 2 }, description: "Tatlı orman meyvesi. 12 can, 24 tokluk ve 2 dostluk verir." },
    ormanMantari: { id: "ormanMantari", name: "Orman Mantarı", category: "Malzeme", price: 20, sell: 8, description: "Çorba için toplanan yenilebilir mantar. Önce pişir." },
    altinTahil: { id: "altinTahil", name: "Altın Tahıl", category: "Malzeme", price: 15, sell: 6, description: "Ekmek ve piknik tabağının temel malzemesi." },
    koyEkmegi: { id: "koyEkmegi", name: "Köy Ekmeği", category: "Yiyecek", price: 55, sell: 22, food: { heal: 26, hunger: 36, energy: 14, friendship: 4 }, description: "2 tahılla hazırlanır. 26 can, 36 tokluk ve 4 dostluk verir." },
    lumaCorbasi: { id: "lumaCorbasi", name: "Luma Çorbası", category: "Yiyecek", price: 90, sell: 36, food: { heal: 48, hunger: 52, energy: 24, friendship: 6, cure: true }, description: "2 mantar + 1 meyve. 48 can, 52 tokluk, 6 dostluk; durum etkilerini temizler." },
    piknikTabagi: { id: "piknikTabagi", name: "Piknik Tabağı", category: "Yiyecek", price: 150, sell: 60, food: { heal: 80, hunger: 70, energy: 35, friendship: 10 }, description: "2 meyve + 1 mantar + 1 ekmek. 80 can, 70 tokluk ve 10 dostluk verir." },
    kucukIksir: { id: "kucukIksir", name: "Küçük İksir", category: "İyileştirme", price: 80, sell: 32, effect: { heal: 24 }, description: "Bir yaratığın canını 24 yeniler." },
    buyukIksir: { id: "buyukIksir", name: "Büyük İksir", category: "İyileştirme", price: 180, sell: 72, effect: { heal: 60 }, description: "Bir yaratığın canını 60 yeniler." },
    tamIksir: { id: "tamIksir", name: "Tam İksir", category: "İyileştirme", price: 420, sell: 160, effect: { fullHeal: true }, description: "Bir yaratığın canını tamamen yeniler." },
    panzehir: { id: "panzehir", name: "Panzehir", category: "İyileştirme", price: 70, sell: 28, effect: { cure: true }, description: "Yanık, sersemleme ve uyku gibi etkileri temizler." },
    lumaKuresi: { id: "lumaKuresi", name: "Luma Küresi", category: "Yakalama", price: 120, sell: 48, capturePower: 1, description: "Işık parçacıklarıyla çalışan temel yakalama küresi." },
    gucluLumaKuresi: { id: "gucluLumaKuresi", name: "Güçlü Luma Küresi", category: "Yakalama", price: 280, sell: 110, capturePower: 1.55, description: "Zor yakalanan yaratıklar için kuvvetli küre." },
    kristalLumaKuresi: { id: "kristalLumaKuresi", name: "Kristal Luma Küresi", category: "Yakalama", price: 620, sell: 250, capturePower: 2.25, description: "Kristal çekirdeğiyle parlayan özel yakalama küresi." },
    kacisTasi: { id: "kacisTasi", name: "Kaçış Taşı", category: "Özel", price: 150, sell: 60, effect: { escape: true }, description: "Vahşi savaştan güvenli kaçış sağlar." },
    parlakKristal: { id: "parlakKristal", name: "Parlak Kristal", category: "Görev", price: 0, sell: 0, protected: true, description: "Köyün kuyusundan kaybolan sıcak ışıklı kristal." },
    ormanAnahtari: { id: "ormanAnahtari", name: "Orman Anahtarı", category: "Görev", price: 0, sell: 0, protected: true, description: "Eski ağaç kapısını açan reçineli anahtar." },
    magaraFeneri: { id: "magaraFeneri", name: "Mağara Feneri", category: "Görev", price: 0, sell: 0, protected: true, description: "Eski Taş Mağarası'nda yolu gösteren kristal fener." }
  };
})();
