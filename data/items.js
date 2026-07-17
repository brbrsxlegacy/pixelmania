(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.items = {
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
