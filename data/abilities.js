(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.abilities = {
    yaprakDarbesi: { id: "yaprakDarbesi", name: "Yaprak Darbesi", element: "Yaprak", power: 36, accuracy: 96, pp: 24, animation: "leaf", effect: null, description: "Keskin yapraklarla hızlı bir vuruş." },
    kokKapani: { id: "kokKapani", name: "Kök Kapanı", element: "Yaprak", power: 28, accuracy: 90, pp: 18, animation: "root", effect: { type: "slow", chance: .25 }, description: "Rakibin hızını düşürebilen sarmaşık kapanı." },
    camKalkan: { id: "camKalkan", name: "Çam Kalkanı", element: "Yaprak", power: 0, accuracy: 100, pp: 12, animation: "guard", effect: { type: "defenseUp", chance: 1 }, description: "Savunmayı yükselten reçineli koruma." },
    polenUykusu: { id: "polenUykusu", name: "Polen Uykusu", element: "Yaprak", power: 0, accuracy: 72, pp: 10, animation: "dust", effect: { type: "sleep", chance: .55 }, description: "Hafif polenler rakibi sersemletir." },
    kozSicramasi: { id: "kozSicramasi", name: "Köz Sıçraması", element: "Alev", power: 34, accuracy: 95, pp: 24, animation: "ember", effect: { type: "burn", chance: .15 }, description: "Kıvılcımlar savuran sıcak bir hamle." },
    alevPencesi: { id: "alevPencesi", name: "Alev Pençesi", element: "Alev", power: 50, accuracy: 90, pp: 15, animation: "claw", effect: { type: "burn", chance: .18 }, description: "Alevli pençelerle yakın saldırı." },
    korPerdesi: { id: "korPerdesi", name: "Kor Perdesi", element: "Alev", power: 0, accuracy: 100, pp: 12, animation: "guard", effect: { type: "attackUp", chance: 1 }, description: "İç ateşi güçlendirir." },
    firinNefesi: { id: "firinNefesi", name: "Fırın Nefesi", element: "Alev", power: 62, accuracy: 84, pp: 8, animation: "flame", effect: { type: "burn", chance: .25 }, description: "Geniş bir sıcak hava dalgası." },
    kopukAtisi: { id: "kopukAtisi", name: "Köpük Atışı", element: "Su", power: 32, accuracy: 98, pp: 24, animation: "bubble", effect: null, description: "Parlak köpüklerle su vuruşu." },
    dalgaCarpmasi: { id: "dalgaCarpmasi", name: "Dalga Çarpması", element: "Su", power: 52, accuracy: 90, pp: 14, animation: "wave", effect: { type: "slow", chance: .18 }, description: "Kısa ama güçlü bir dalga." },
    yagmurNabzi: { id: "yagmurNabzi", name: "Yağmur Nabzı", element: "Su", power: 0, accuracy: 100, pp: 12, animation: "heal", effect: { type: "selfHeal", chance: 1 }, description: "Kullanıcının canını az miktarda yeniler." },
    inciAkimi: { id: "inciAkimi", name: "İnci Akımı", element: "Su", power: 64, accuracy: 82, pp: 8, animation: "waterbolt", effect: null, description: "Yoğun su basıncıyla parlayan darbe." },
    tasYumruk: { id: "tasYumruk", name: "Taş Yumruk", element: "Kaya", power: 42, accuracy: 92, pp: 18, animation: "rock", effect: null, description: "Sert kaya çıkıntısıyla saldırır." },
    kristalSavunma: { id: "kristalSavunma", name: "Kristal Savunma", element: "Kaya", power: 0, accuracy: 100, pp: 12, animation: "guard", effect: { type: "defenseUp", chance: 1 }, description: "Kristal zırh savunmayı artırır." },
    magaraCokusu: { id: "magaraCokusu", name: "Mağara Çöküşü", element: "Kaya", power: 66, accuracy: 78, pp: 7, animation: "quake", effect: { type: "slow", chance: .2 }, description: "Yer sarsıntısıyla ağır hasar verir." },
    ruzgarKesisi: { id: "ruzgarKesisi", name: "Rüzgar Kesisi", element: "Rüzgar", power: 36, accuracy: 98, pp: 24, animation: "wind", effect: null, description: "Keskin bir hava akımı." },
    firtinaDonusu: { id: "firtinaDonusu", name: "Fırtına Dönüşü", element: "Rüzgar", power: 58, accuracy: 88, pp: 10, animation: "cyclone", effect: { type: "slow", chance: .2 }, description: "Rakibi savuran spiral rüzgar." },
    hizKanadi: { id: "hizKanadi", name: "Hız Kanadı", element: "Rüzgar", power: 0, accuracy: 100, pp: 12, animation: "boost", effect: { type: "speedUp", chance: 1 }, description: "Kullanıcının hızını yükseltir." },
    voltKivilcimi: { id: "voltKivilcimi", name: "Volt Kıvılcımı", element: "Elektrik", power: 38, accuracy: 94, pp: 20, animation: "spark", effect: { type: "stun", chance: .12 }, description: "Zıplayan elektrik kıvılcımları." },
    simsekZiplamasi: { id: "simsekZiplamasi", name: "Şimşek Zıplaması", element: "Elektrik", power: 58, accuracy: 86, pp: 10, animation: "bolt", effect: { type: "stun", chance: .25 }, description: "Hızlı ve riskli elektrik hamlesi." },
    golgeIsirigi: { id: "golgeIsirigi", name: "Gölge Isırığı", element: "Gölge", power: 44, accuracy: 92, pp: 16, animation: "shadow", effect: { type: "attackDown", chance: .18 }, description: "Korku bırakan karanlık ısırık." },
    gecePerdesi: { id: "gecePerdesi", name: "Gece Perdesi", element: "Gölge", power: 0, accuracy: 100, pp: 10, animation: "veil", effect: { type: "evasionUp", chance: 1 }, description: "Kullanıcıyı soluk bir perdeyle gizler." },
    isikHalesi: { id: "isikHalesi", name: "Işık Halesi", element: "Işık", power: 40, accuracy: 95, pp: 18, animation: "light", effect: null, description: "Sıcak ışık halkasıyla vurur." },
    safakPatlamasi: { id: "safakPatlamasi", name: "Şafak Patlaması", element: "Işık", power: 68, accuracy: 80, pp: 7, animation: "nova", effect: { type: "blind", chance: .22 }, description: "Kısa süreli parıltı patlaması." }
  };
})();
