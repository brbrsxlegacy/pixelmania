(function () {
  window.LUMA_DATA = window.LUMA_DATA || {};
  window.LUMA_DATA.maps = window.LUMA_DATA.maps || {};

  var pieces = [
  {
    "id": "mapPiece001",
    "number": 1,
    "title": "Isikpinar Baslangic Yolu",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-001.png",
    "mapId": "aiPiece001"
  },
  {
    "id": "mapPiece002",
    "number": 2,
    "title": "Koy Evleri Kumesi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-002.png",
    "mapId": "aiPiece002"
  },
  {
    "id": "mapPiece003",
    "number": 3,
    "title": "Revir Bahcesi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-003.png",
    "mapId": "aiPiece003"
  },
  {
    "id": "mapPiece004",
    "number": 4,
    "title": "Pazar Dukkani Onu",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-004.png",
    "mapId": "aiPiece004"
  },
  {
    "id": "mapPiece005",
    "number": 5,
    "title": "Liora Laboratuvar Avlusu",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-005.png",
    "mapId": "aiPiece005"
  },
  {
    "id": "mapPiece006",
    "number": 6,
    "title": "Cicekli Cayir",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-006.png",
    "mapId": "aiPiece006"
  },
  {
    "id": "mapPiece007",
    "number": 7,
    "title": "Bugday Tarlasi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-007.png",
    "mapId": "aiPiece007"
  },
  {
    "id": "mapPiece008",
    "number": 8,
    "title": "Golet Kenari",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-008.png",
    "mapId": "aiPiece008"
  },
  {
    "id": "mapPiece009",
    "number": 9,
    "title": "Dere Koprusu",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-009.png",
    "mapId": "aiPiece009"
  },
  {
    "id": "mapPiece010",
    "number": 10,
    "title": "Orman Patikasi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-010.png",
    "mapId": "aiPiece010"
  },
  {
    "id": "mapPiece011",
    "number": 11,
    "title": "Mantar Korusu",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-011.png",
    "mapId": "aiPiece011"
  },
  {
    "id": "mapPiece012",
    "number": 12,
    "title": "Kayalik Gecit",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-012.png",
    "mapId": "aiPiece012"
  },
  {
    "id": "mapPiece013",
    "number": 13,
    "title": "Eski Magara Agzi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-013.png",
    "mapId": "aiPiece013"
  },
  {
    "id": "mapPiece014",
    "number": 14,
    "title": "Tepe Seyir Alani",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-014.png",
    "mapId": "aiPiece014"
  },
  {
    "id": "mapPiece015",
    "number": 15,
    "title": "Tas Tapinak Kalintisi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-015.png",
    "mapId": "aiPiece015"
  },
  {
    "id": "mapPiece016",
    "number": 16,
    "title": "Kasaba Cesme Meydani",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-016.png",
    "mapId": "aiPiece016"
  },
  {
    "id": "mapPiece017",
    "number": 17,
    "title": "Citli Bahce Yolu",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-017.png",
    "mapId": "aiPiece017"
  },
  {
    "id": "mapPiece018",
    "number": 18,
    "title": "Meyve Bahcesi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-018.png",
    "mapId": "aiPiece018"
  },
  {
    "id": "mapPiece019",
    "number": 19,
    "title": "Yel Degirmeni Tarlasi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-019.png",
    "mapId": "aiPiece019"
  },
  {
    "id": "mapPiece020",
    "number": 20,
    "title": "Liman Iskelesi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-020.png",
    "mapId": "aiPiece020"
  },
  {
    "id": "mapPiece021",
    "number": 21,
    "title": "Orman Kampi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-021.png",
    "mapId": "aiPiece021"
  },
  {
    "id": "mapPiece022",
    "number": 22,
    "title": "Koy Parki",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-022.png",
    "mapId": "aiPiece022"
  },
  {
    "id": "mapPiece023",
    "number": 23,
    "title": "Pazar Tezgahlari",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-023.png",
    "mapId": "aiPiece023"
  },
  {
    "id": "mapPiece024",
    "number": 24,
    "title": "Kumsal Gecidi",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-024.png",
    "mapId": "aiPiece024"
  },
  {
    "id": "mapPiece025",
    "number": 25,
    "title": "Insaat Alani",
    "category": "village-nature",
    "source": "concepts/map-piece-choices/pieces/map-piece-025.png",
    "mapId": "aiPiece025"
  },
  {
    "id": "mapPiece026",
    "number": 26,
    "title": "Sehir Tas Sokagi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-026.png",
    "mapId": "aiPiece026"
  },
  {
    "id": "mapPiece027",
    "number": 27,
    "title": "Apartman Onu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-027.png",
    "mapId": "aiPiece027"
  },
  {
    "id": "mapPiece028",
    "number": 28,
    "title": "Belediye Meydani",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-028.png",
    "mapId": "aiPiece028"
  },
  {
    "id": "mapPiece029",
    "number": 29,
    "title": "Emlak Ofisi Ic Gorunum",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-029.png",
    "mapId": "aiPiece029"
  },
  {
    "id": "mapPiece030",
    "number": 30,
    "title": "Stil Sokagi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-030.png",
    "mapId": "aiPiece030"
  },
  {
    "id": "mapPiece031",
    "number": 31,
    "title": "Tren Istasyonu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-031.png",
    "mapId": "aiPiece031"
  },
  {
    "id": "mapPiece032",
    "number": 32,
    "title": "Fabrika Yuk Avlusu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-032.png",
    "mapId": "aiPiece032"
  },
  {
    "id": "mapPiece033",
    "number": 33,
    "title": "Arena Kapisi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-033.png",
    "mapId": "aiPiece033"
  },
  {
    "id": "mapPiece034",
    "number": 34,
    "title": "Neon Gece Pazari",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-034.png",
    "mapId": "aiPiece034"
  },
  {
    "id": "mapPiece035",
    "number": 35,
    "title": "Kanal Koprusu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-035.png",
    "mapId": "aiPiece035"
  },
  {
    "id": "mapPiece036",
    "number": 36,
    "title": "Cati Bahcesi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-036.png",
    "mapId": "aiPiece036"
  },
  {
    "id": "mapPiece037",
    "number": 37,
    "title": "Akademi Avlusu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-037.png",
    "mapId": "aiPiece037"
  },
  {
    "id": "mapPiece038",
    "number": 38,
    "title": "Kutuphane Onu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-038.png",
    "mapId": "aiPiece038"
  },
  {
    "id": "mapPiece039",
    "number": 39,
    "title": "Firin Kosesi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-039.png",
    "mapId": "aiPiece039"
  },
  {
    "id": "mapPiece040",
    "number": 40,
    "title": "Atolye Avlusu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-040.png",
    "mapId": "aiPiece040"
  },
  {
    "id": "mapPiece041",
    "number": 41,
    "title": "Liman Deposu",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-041.png",
    "mapId": "aiPiece041"
  },
  {
    "id": "mapPiece042",
    "number": 42,
    "title": "Fener Kayaligi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-042.png",
    "mapId": "aiPiece042"
  },
  {
    "id": "mapPiece043",
    "number": 43,
    "title": "Mini Oyun Karnavali",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-043.png",
    "mapId": "aiPiece043"
  },
  {
    "id": "mapPiece044",
    "number": 44,
    "title": "Park Labirenti",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-044.png",
    "mapId": "aiPiece044"
  },
  {
    "id": "mapPiece045",
    "number": 45,
    "title": "Kanalizasyon Girisi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-045.png",
    "mapId": "aiPiece045"
  },
  {
    "id": "mapPiece046",
    "number": 46,
    "title": "Metro Merdivenleri",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-046.png",
    "mapId": "aiPiece046"
  },
  {
    "id": "mapPiece047",
    "number": 47,
    "title": "Sandikli Arka Sokak",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-047.png",
    "mapId": "aiPiece047"
  },
  {
    "id": "mapPiece048",
    "number": 48,
    "title": "Gece Cesme Meydani",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-048.png",
    "mapId": "aiPiece048"
  },
  {
    "id": "mapPiece049",
    "number": 49,
    "title": "Yagmurlu Bulvar",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-049.png",
    "mapId": "aiPiece049"
  },
  {
    "id": "mapPiece050",
    "number": 50,
    "title": "Fenerli Festival Sokagi",
    "category": "city",
    "source": "concepts/map-piece-choices/pieces/map-piece-050.png",
    "mapId": "aiPiece050"
  },
  {
    "id": "mapPiece051",
    "number": 51,
    "title": "Derin Orman Acikligi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-051.png",
    "mapId": "aiPiece051"
  },
  {
    "id": "mapPiece052",
    "number": 52,
    "title": "Perili Koru",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-052.png",
    "mapId": "aiPiece052"
  },
  {
    "id": "mapPiece053",
    "number": 53,
    "title": "Bataklik Tahta Yolu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-053.png",
    "mapId": "aiPiece053"
  },
  {
    "id": "mapPiece054",
    "number": 54,
    "title": "Karli Koy Kenari",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-054.png",
    "mapId": "aiPiece054"
  },
  {
    "id": "mapPiece055",
    "number": 55,
    "title": "Karli Cam Patikasi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-055.png",
    "mapId": "aiPiece055"
  },
  {
    "id": "mapPiece056",
    "number": 56,
    "title": "Col Vahasi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-056.png",
    "mapId": "aiPiece056"
  },
  {
    "id": "mapPiece057",
    "number": 57,
    "title": "Col Harabeleri",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-057.png",
    "mapId": "aiPiece057"
  },
  {
    "id": "mapPiece058",
    "number": 58,
    "title": "Lav Magarasi Agzi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-058.png",
    "mapId": "aiPiece058"
  },
  {
    "id": "mapPiece059",
    "number": 59,
    "title": "Volkanik Catlak Duzlugu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-059.png",
    "mapId": "aiPiece059"
  },
  {
    "id": "mapPiece060",
    "number": 60,
    "title": "Kristal Magara Odasi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-060.png",
    "mapId": "aiPiece060"
  },
  {
    "id": "mapPiece061",
    "number": 61,
    "title": "Maden Ray Girisi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-061.png",
    "mapId": "aiPiece061"
  },
  {
    "id": "mapPiece062",
    "number": 62,
    "title": "Antik Tapinak Kapisi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-062.png",
    "mapId": "aiPiece062"
  },
  {
    "id": "mapPiece063",
    "number": 63,
    "title": "Tas Labirent Harabesi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-063.png",
    "mapId": "aiPiece063"
  },
  {
    "id": "mapPiece064",
    "number": 64,
    "title": "Ayisigi Mezarligi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-064.png",
    "mapId": "aiPiece064"
  },
  {
    "id": "mapPiece065",
    "number": 65,
    "title": "Bambu Korusu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-065.png",
    "mapId": "aiPiece065"
  },
  {
    "id": "mapPiece066",
    "number": 66,
    "title": "Selale Havuzu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-066.png",
    "mapId": "aiPiece066"
  },
  {
    "id": "mapPiece067",
    "number": 67,
    "title": "Nehir Deltasi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-067.png",
    "mapId": "aiPiece067"
  },
  {
    "id": "mapPiece068",
    "number": 68,
    "title": "Dag Merdivenleri",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-068.png",
    "mapId": "aiPiece068"
  },
  {
    "id": "mapPiece069",
    "number": 69,
    "title": "Ucurum Ip Koprusu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-069.png",
    "mapId": "aiPiece069"
  },
  {
    "id": "mapPiece070",
    "number": 70,
    "title": "Kanyon Gecidi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-070.png",
    "mapId": "aiPiece070"
  },
  {
    "id": "mapPiece071",
    "number": 71,
    "title": "Sonbahar Orman Yolu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-071.png",
    "mapId": "aiPiece071"
  },
  {
    "id": "mapPiece072",
    "number": 72,
    "title": "Dev Cicek Tarlasi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-072.png",
    "mapId": "aiPiece072"
  },
  {
    "id": "mapPiece073",
    "number": 73,
    "title": "Sisli Bataklik",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-073.png",
    "mapId": "aiPiece073"
  },
  {
    "id": "mapPiece074",
    "number": 74,
    "title": "Korsan Koyu",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-074.png",
    "mapId": "aiPiece074"
  },
  {
    "id": "mapPiece075",
    "number": 75,
    "title": "Gizli Boss Arenasi",
    "category": "biome-dungeon",
    "source": "concepts/map-piece-choices/pieces/map-piece-075.png",
    "mapId": "aiPiece075"
  },
  {
    "id": "mapPiece076",
    "number": 76,
    "title": "Kraliyet Bahce Kapisi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-076.png",
    "mapId": "aiPiece076"
  },
  {
    "id": "mapPiece077",
    "number": 77,
    "title": "Buyuk Boss Avlusu",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-077.png",
    "mapId": "aiPiece077"
  },
  {
    "id": "mapPiece078",
    "number": 78,
    "title": "Kadim Portal Cemberi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-078.png",
    "mapId": "aiPiece078"
  },
  {
    "id": "mapPiece079",
    "number": 79,
    "title": "Terk Edilmis Malikane",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-079.png",
    "mapId": "aiPiece079"
  },
  {
    "id": "mapPiece080",
    "number": 80,
    "title": "Malikane Fuayesi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-080.png",
    "mapId": "aiPiece080"
  },
  {
    "id": "mapPiece081",
    "number": 81,
    "title": "Buyulu Kutuphane",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-081.png",
    "mapId": "aiPiece081"
  },
  {
    "id": "mapPiece082",
    "number": 82,
    "title": "Simya Atolyesi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-082.png",
    "mapId": "aiPiece082"
  },
  {
    "id": "mapPiece083",
    "number": 83,
    "title": "Yeralti Laboratuvari",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-083.png",
    "mapId": "aiPiece083"
  },
  {
    "id": "mapPiece084",
    "number": 84,
    "title": "Luma Ciftligi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-084.png",
    "mapId": "aiPiece084"
  },
  {
    "id": "mapPiece085",
    "number": 85,
    "title": "Egitim Dojosu",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-085.png",
    "mapId": "aiPiece085"
  },
  {
    "id": "mapPiece086",
    "number": 86,
    "title": "Lonca Binasi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-086.png",
    "mapId": "aiPiece086"
  },
  {
    "id": "mapPiece087",
    "number": 87,
    "title": "Lonca Salonu",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-087.png",
    "mapId": "aiPiece087"
  },
  {
    "id": "mapPiece088",
    "number": 88,
    "title": "Acik Artirma Meydani",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-088.png",
    "mapId": "aiPiece088"
  },
  {
    "id": "mapPiece089",
    "number": 89,
    "title": "Luks Villa Kapisi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-089.png",
    "mapId": "aiPiece089"
  },
  {
    "id": "mapPiece090",
    "number": 90,
    "title": "Kiralik Ev Sokagi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-090.png",
    "mapId": "aiPiece090"
  },
  {
    "id": "mapPiece091",
    "number": 91,
    "title": "Muhtar Ofisi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-091.png",
    "mapId": "aiPiece091"
  },
  {
    "id": "mapPiece092",
    "number": 92,
    "title": "Koruma Karakolu",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-092.png",
    "mapId": "aiPiece092"
  },
  {
    "id": "mapPiece093",
    "number": 93,
    "title": "Hastane Lobisi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-093.png",
    "mapId": "aiPiece093"
  },
  {
    "id": "mapPiece094",
    "number": 94,
    "title": "Dukkan Ic Mekani",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-094.png",
    "mapId": "aiPiece094"
  },
  {
    "id": "mapPiece095",
    "number": 95,
    "title": "Kiyafet Dukkani",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-095.png",
    "mapId": "aiPiece095"
  },
  {
    "id": "mapPiece096",
    "number": 96,
    "title": "Oyuncu Yatak Odasi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-096.png",
    "mapId": "aiPiece096"
  },
  {
    "id": "mapPiece097",
    "number": 97,
    "title": "Ciftlik Ahiri",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-097.png",
    "mapId": "aiPiece097"
  },
  {
    "id": "mapPiece098",
    "number": 98,
    "title": "Sera Ic Mekani",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-098.png",
    "mapId": "aiPiece098"
  },
  {
    "id": "mapPiece099",
    "number": 99,
    "title": "Gozlemevi Tepesi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-099.png",
    "mapId": "aiPiece099"
  },
  {
    "id": "mapPiece100",
    "number": 100,
    "title": "Final Kristal Mabedi",
    "category": "special-interior",
    "source": "concepts/map-piece-choices/pieces/map-piece-100.png",
    "mapId": "aiPiece100"
  }
];

  function layer(w, h, value) {
    return Array.from({ length: w * h }, function () { return value; });
  }

  function idx(map, x, y) {
    return y * map.w + x;
  }

  function setRect(map, layerName, x, y, w, h, value) {
    for (var yy = y; yy < y + h; yy += 1) {
      for (var xx = x; xx < x + w; xx += 1) {
        if (xx >= 0 && yy >= 0 && xx < map.w && yy < map.h) map[layerName][idx(map, xx, yy)] = value;
      }
    }
  }

  function groundFor(category) {
    if (category === "city") return "cityStone";
    if (category === "biome-dungeon") return "forest";
    if (category === "special-interior") return "plaza";
    return "grass";
  }

  function encountersFor(category, number) {
    var village = [
      { id: "cimsirik", min: 4, max: 8, weight: 5 },
      { id: "minsu", min: 4, max: 8, weight: 4 },
      { id: "ruzgocuk", min: 5, max: 9, weight: 3 }
    ];
    var city = [
      { id: "voltik", min: 8, max: 13, weight: 5 },
      { id: "parilti", min: 9, max: 14, weight: 3 },
      { id: "barbo", min: 10, max: 15, weight: 1 }
    ];
    var wild = [
      { id: "golgemir", min: 13, max: 20, weight: 4 },
      { id: "kristalik", min: 14, max: 21, weight: 4 },
      { id: "nilperi", min: 13, max: 20, weight: 3 },
      { id: "lumeru", min: 18, max: 24, weight: 1 }
    ];
    var special = [
      { id: "crownlex", min: 18, max: 25, weight: 2 },
      { id: "barbo", min: 18, max: 25, weight: 2 },
      { id: "lumeru", min: 19, max: 26, weight: 1 },
      { id: "kristalik", min: 18, max: 25, weight: 3 }
    ];
    var pool = category === "city" ? city : (category === "biome-dungeon" ? wild : (category === "special-interior" ? special : village));
    return pool.map(function (entry, index) {
      return Object.assign({}, entry, { min: entry.min + number % 3, max: entry.max + number % 4, weight: Math.max(1, entry.weight - index % 2) });
    });
  }

  function makeAiMap(piece) {
    var w = 32;
    var h = 32;
    var map = {
      id: piece.mapId,
      name: "#" + String(piece.number).padStart(3, "0") + " " + piece.title,
      w: w,
      h: h,
      ground: layer(w, h, groundFor(piece.category)),
      decoration: layer(w, h, null),
      collision: layer(w, h, 0),
      encounter: layer(w, h, 0),
      foreground: layer(w, h, null),
      exits: [],
      interactions: [],
      items: [],
      encounters: encountersFor(piece.category, piece.number),
      roamerCount: piece.category === "special-interior" ? 1 : 3,
      aiPiece: { number: piece.number, title: piece.title, category: piece.category, source: piece.source }
    };
    setRect(map, "collision", 0, 0, w, 1, 1);
    setRect(map, "collision", 0, h - 1, w, 1, 1);
    setRect(map, "collision", 0, 0, 1, h, 1);
    setRect(map, "collision", w - 1, 0, 1, h, 1);
    setRect(map, "collision", 13, 30, 6, 2, 0);
    setRect(map, "encounter", 6, 6, 20, 20, piece.category === "special-interior" ? 0 : 1);
    map.exits.push({ x: 13, y: 30, w: 6, h: 2, to: "__aiReturn", spawnX: 25, spawnY: 30 });
    map.interactions.push({
      x: 16,
      y: 28,
      type: "door",
      to: "__aiReturn",
      spawnX: 25,
      spawnY: 30,
      text: "AI rota cikisi. Geldigin yere donuyorsun."
    });
    map.items.push({ id: piece.mapId + "_souvenir", x: 4 + piece.number % 22, y: 4 + piece.number % 20, itemId: "lumaKuresi", qty: 1, hidden: true });
    return map;
  }

  window.LUMA_DATA.aiMapPieces = pieces;
  pieces.forEach(function (piece) {
    window.LUMA_DATA.maps[piece.mapId] = makeAiMap(piece);
  });

  (function addAiRouteBoard() {
    var village = window.LUMA_DATA.maps.isikpinar;
    if (!village) return;
    var x = 22;
    var y = 20;
    village.decoration[y * village.w + x] = "sign";
    village.interactions.push({
      x: x,
      y: y,
      type: "aiRoutes",
      id: "ai_route_board",
      text: "AI Rota Panosu: 100 yeni harita parcasi gezilebilir."
    });
  })();
})();
