(function () {
  var L = window.LUMA = window.LUMA || {};
  var TILE = 16;

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function outlineRect(ctx, x, y, w, h, fill, outline) {
    rect(ctx, x, y, w, h, outline || "#172033");
    rect(ctx, x + 1, y + 1, w - 2, h - 2, fill);
  }

  function shadeTile(ctx, x, y, base, alt, time) {
    rect(ctx, x, y, TILE, TILE, base);
    var pulse = Math.floor((time || 0) * 4) % 4;
    for (var i = 0; i < 5; i += 1) {
      var px = x + ((i * 7 + pulse * 2) % 15);
      var py = y + ((i * 5 + pulse) % 14);
      rect(ctx, px, py, 1, 1, alt);
    }
  }

  function drawTinySpark(ctx, x, y, color, time) {
    var bob = Math.sin((time || 0) * 5 + x) * 1.5;
    rect(ctx, x, y + bob, 2, 2, color);
    rect(ctx, x - 1, y + 1 + bob, 4, 1, "#fff4d2");
  }

  L.Asset = {
    TILE: TILE,

    drawTile: function (ctx, code, x, y, time) {
      switch (code) {
        case "grass":
          shadeTile(ctx, x, y, "#70c461", "#5dab54", time);
          break;
        case "meadow":
          shadeTile(ctx, x, y, "#82cf65", "#65b957", time);
          break;
        case "forest":
          shadeTile(ctx, x, y, "#4f9d55", "#377f45", time);
          break;
        case "sandGrass":
          shadeTile(ctx, x, y, "#a6c95d", "#e0c974", time);
          break;
        case "road":
          shadeTile(ctx, x, y, "#c99a57", "#ad7a42", time);
          break;
        case "plaza":
          shadeTile(ctx, x, y, "#d8b875", "#b98d55", time);
          rect(ctx, x, y + 15, 16, 1, "#a9774a");
          break;
        case "leafRoad":
          shadeTile(ctx, x, y, "#7a9f52", "#d2a94a", time);
          break;
        case "tallGrass":
          rect(ctx, x, y, TILE, TILE, "#66b95d");
          for (var g = 0; g < 8; g += 1) {
            var sway = Math.sin((time || 0) * 4 + g) > 0 ? 1 : 0;
            rect(ctx, x + g * 2, y + 6 - sway, 1, 8 + sway, g % 2 ? "#3f9a4b" : "#8bd36b");
          }
          break;
        case "water":
          rect(ctx, x, y, TILE, TILE, "#3e91cf");
          var wave = Math.floor((time || 0) * 6) % 8;
          rect(ctx, x + wave - 3, y + 4, 7, 1, "#9de8ff");
          rect(ctx, x + 12 - wave, y + 10, 6, 1, "#6ed1ed");
          break;
        case "bridge":
          rect(ctx, x, y, TILE, TILE, "#9a663b");
          rect(ctx, x, y + 2, TILE, 2, "#d2a05d");
          rect(ctx, x, y + 8, TILE, 2, "#6d4029");
          rect(ctx, x + 2, y, 2, TILE, "#744428");
          rect(ctx, x + 12, y, 2, TILE, "#744428");
          break;
        case "cave":
          shadeTile(ctx, x, y, "#33384a", "#252938", time);
          break;
        case "caveFloor":
          shadeTile(ctx, x, y, "#555b66", "#444957", time);
          break;
        case "woodFloor":
          rect(ctx, x, y, TILE, TILE, "#b77a45");
          rect(ctx, x, y + 7, TILE, 1, "#8a5532");
          rect(ctx, x + 7, y, 1, TILE, "#c99055");
          break;
        case "labFloor":
          shadeTile(ctx, x, y, "#d9e7d5", "#b8cfbf", time);
          break;
        case "clinicFloor":
          shadeTile(ctx, x, y, "#f2e1c5", "#e7b9b1", time);
          break;
        case "shopFloor":
          shadeTile(ctx, x, y, "#d9ad63", "#ba7e3e", time);
          break;
        case "roomWall":
          rect(ctx, x, y, TILE, TILE, "#6f86a8");
          rect(ctx, x, y + 10, TILE, 6, "#4e5d7c");
          rect(ctx, x + 1, y + 1, 14, 1, "#9db6cf");
          break;
        case "rug":
          rect(ctx, x, y, TILE, TILE, "#9f3d4b");
          rect(ctx, x + 2, y + 2, 12, 12, "#d2a05d");
          rect(ctx, x + 5, y + 5, 6, 6, "#fff4d2");
          break;
        case "cityStone":
          shadeTile(ctx, x, y, "#8ca0a8", "#72838c", time);
          rect(ctx, x, y + 15, TILE, 1, "#5d6974");
          rect(ctx, x + 15, y, 1, TILE, "#aeb9bd");
          break;
        case "asphalt":
          shadeTile(ctx, x, y, "#3f4854", "#2d3540", time);
          rect(ctx, x + 6, y + 7, 4, 2, "#f2d54a");
          break;
        case "marketTile":
          shadeTile(ctx, x, y, "#d0a25d", "#b67e45", time);
          rect(ctx, x + 2, y + 2, 5, 5, "#f2b94b");
          rect(ctx, x + 9, y + 9, 5, 5, "#fff4d2");
          break;
        case "gardenTile":
          shadeTile(ctx, x, y, "#62b85a", "#3f944f", time);
          rect(ctx, x + 3, y + 4, 2, 2, "#f08bb0");
          rect(ctx, x + 11, y + 10, 2, 2, "#f2d54a");
          break;
        case "desert":
          shadeTile(ctx, x, y, "#d7bc74", "#c29a57", time);
          rect(ctx, x + 2, y + 10, 8, 1, "#f2d99b");
          break;
        case "snow":
          shadeTile(ctx, x, y, "#dfefff", "#b8d4ed", time);
          rect(ctx, x + 4, y + 5, 2, 2, "#ffffff");
          rect(ctx, x + 11, y + 12, 2, 2, "#ffffff");
          break;
        case "lava":
          rect(ctx, x, y, TILE, TILE, "#6d231f");
          rect(ctx, x + 2, y + 4, 12, 2, "#e46d45");
          rect(ctx, x + 6, y + 10, 7, 2, "#f2b94b");
          break;
        case "swamp":
          shadeTile(ctx, x, y, "#527043", "#324b38", time);
          rect(ctx, x + 3, y + 11, 9, 2, "#6d8f54");
          break;
        case "ruinFloor":
          shadeTile(ctx, x, y, "#8f8372", "#6d665f", time);
          rect(ctx, x + 1, y + 1, 6, 2, "#b9b0a0");
          rect(ctx, x + 9, y + 8, 5, 2, "#5f5a55");
          break;
        default:
          shadeTile(ctx, x, y, "#70c461", "#5dab54", time);
      }
    },

    drawObject: function (ctx, code, x, y, time) {
      switch (code) {
        case "tree":
        case "pine":
          rect(ctx, x + 10, y + 20, 10, 16, "#78523a");
          rect(ctx, x + 3, y + 9, 26, 20, "#172033");
          rect(ctx, x + 5, y + 7, 22, 20, code === "pine" ? "#2e7d4f" : "#3f944f");
          rect(ctx, x + 8, y + 3, 16, 12, code === "pine" ? "#55b46b" : "#62bf5b");
          rect(ctx, x + 12, y, 8, 6, "#87d66f");
          rect(ctx, x + 6, y + 25, 20, 8, "rgba(13, 27, 33, .25)");
          break;
        case "houseBlue":
        case "houseRed":
        case "shop":
          var roof = code === "houseBlue" ? "#4f76b9" : (code === "shop" ? "#d2a23e" : "#c65642");
          rect(ctx, x + 2, y + 18, 76, 44, "#172033");
          rect(ctx, x + 5, y + 21, 70, 38, "#f0d18c");
          rect(ctx, x, y + 8, 82, 18, "#172033");
          rect(ctx, x + 4, y + 6, 74, 18, roof);
          rect(ctx, x + 11, y + 30, 14, 12, "#86c3da");
          rect(ctx, x + 53, y + 30, 14, 12, "#86c3da");
          rect(ctx, x + 35, y + 39, 13, 20, "#8b5a37");
          rect(ctx, x + 40, y + 48, 2, 2, "#f2b94b");
          if (code === "shop") {
            outlineRect(ctx, x + 20, y + 23, 42, 10, "#fff4d2");
            rect(ctx, x + 28, y + 26, 26, 3, "#172033");
          }
          break;
        case "lab":
          rect(ctx, x + 2, y + 17, 104, 58, "#172033");
          rect(ctx, x + 6, y + 21, 96, 50, "#dbe8d2");
          rect(ctx, x, y + 5, 108, 20, "#172033");
          rect(ctx, x + 5, y + 3, 98, 20, "#6aa9c8");
          rect(ctx, x + 16, y + 31, 18, 14, "#9de8ff");
          rect(ctx, x + 72, y + 31, 18, 14, "#9de8ff");
          rect(ctx, x + 44, y + 43, 18, 28, "#7d5b42");
          drawTinySpark(ctx, x + 52, y + 15, "#fff4d2", time);
          break;
        case "healingStation":
          rect(ctx, x + 2, y + 18, 54, 32, "#172033");
          rect(ctx, x + 5, y + 21, 48, 26, "#f8e3be");
          rect(ctx, x + 18, y + 7, 22, 18, "#172033");
          rect(ctx, x + 21, y + 4, 16, 18, "#e46d45");
          rect(ctx, x + 27, y + 7, 4, 12, "#fff4d2");
          rect(ctx, x + 23, y + 11, 12, 4, "#fff4d2");
          break;
        case "sign":
          rect(ctx, x + 6, y + 9, 4, 10, "#744428");
          outlineRect(ctx, x + 1, y + 2, 14, 9, "#d2a05d");
          break;
        case "well":
          rect(ctx, x + 2, y + 10, 28, 16, "#172033");
          rect(ctx, x + 4, y + 12, 24, 12, "#8a8f91");
          rect(ctx, x + 7, y + 14, 18, 7, "#28364f");
          rect(ctx, x + 0, y + 4, 32, 6, "#744428");
          break;
        case "flowerPink":
        case "flowerYellow":
          rect(ctx, x + 7, y + 8, 2, 5, "#2f8548");
          rect(ctx, x + 6, y + 6, 4, 3, code === "flowerPink" ? "#f08bb0" : "#f2d54a");
          break;
        case "mushroom":
          rect(ctx, x + 7, y + 9, 3, 4, "#fff4d2");
          rect(ctx, x + 5, y + 6, 7, 4, "#d9514e");
          rect(ctx, x + 7, y + 7, 1, 1, "#fff4d2");
          break;
        case "rock":
        case "caveWall":
          rect(ctx, x + 2, y + 8, 12, 7, "#172033");
          rect(ctx, x + 3, y + 6, 10, 8, "#8a8f91");
          rect(ctx, x + 5, y + 7, 4, 2, "#b9b7aa");
          break;
        case "log":
          rect(ctx, x, y + 7, 32, 8, "#172033");
          rect(ctx, x + 1, y + 6, 30, 8, "#8b5a37");
          rect(ctx, x + 3, y + 8, 24, 2, "#c58b4f");
          break;
        case "dock":
          rect(ctx, x, y + 5, 80, 10, "#744428");
          for (var d = 0; d < 5; d += 1) rect(ctx, x + d * 16 + 2, y + 6, 12, 8, "#a86f42");
          break;
        case "caveMouth":
          rect(ctx, x, y + 5, 64, 43, "#172033");
          rect(ctx, x + 5, y + 1, 54, 34, "#555b66");
          rect(ctx, x + 13, y + 15, 38, 30, "#111827");
          rect(ctx, x + 18, y + 12, 6, 9, "#72808f");
          break;
        case "crystalBlue":
        case "crystalPink":
          var c = code === "crystalBlue" ? "#93d4e8" : "#f08bb0";
          rect(ctx, x + 6, y + 2, 5, 13, "#172033");
          rect(ctx, x + 7, y + 1, 3, 13, c);
          rect(ctx, x + 5, y + 6, 7, 5, "#fff4d2");
          drawTinySpark(ctx, x + 12, y + 1, "#fff4d2", time);
          break;
        case "chest":
          outlineRect(ctx, x + 1, y + 5, 14, 10, "#9a663b");
          rect(ctx, x + 2, y + 8, 12, 2, "#f2b94b");
          rect(ctx, x + 7, y + 9, 2, 3, "#172033");
          break;
        case "bookshelf":
          rect(ctx, x + 1, y + 1, 30, 30, "#172033");
          rect(ctx, x + 3, y + 3, 26, 26, "#7d4f32");
          rect(ctx, x + 5, y + 7, 22, 3, "#f2b94b");
          rect(ctx, x + 5, y + 14, 22, 3, "#6aa9c8");
          rect(ctx, x + 5, y + 21, 22, 3, "#d9514e");
          break;
        case "table":
          rect(ctx, x + 1, y + 8, 30, 16, "#172033");
          rect(ctx, x + 3, y + 6, 26, 16, "#a86f42");
          rect(ctx, x + 6, y + 9, 20, 3, "#d2a05d");
          rect(ctx, x + 5, y + 22, 4, 9, "#744428");
          rect(ctx, x + 23, y + 22, 4, 9, "#744428");
          break;
        case "labDesk":
          rect(ctx, x + 1, y + 9, 62, 22, "#172033");
          rect(ctx, x + 3, y + 7, 58, 22, "#dbe8d2");
          rect(ctx, x + 8, y + 3, 10, 9, "#54b86b");
          rect(ctx, x + 27, y + 2, 10, 10, "#e46d45");
          rect(ctx, x + 45, y + 3, 10, 9, "#4aa8d8");
          drawTinySpark(ctx, x + 32, y + 1, "#fff4d2", time);
          break;
        case "bedBlue":
        case "bedRed":
          var blanket = code === "bedBlue" ? "#4f76b9" : "#c65642";
          rect(ctx, x + 1, y + 2, 30, 28, "#172033");
          rect(ctx, x + 3, y + 4, 26, 24, "#fff4d2");
          rect(ctx, x + 3, y + 13, 26, 15, blanket);
          rect(ctx, x + 6, y + 6, 10, 6, "#f8e3be");
          break;
        case "healingBed":
          rect(ctx, x + 1, y + 4, 46, 24, "#172033");
          rect(ctx, x + 3, y + 6, 42, 20, "#fff4d2");
          rect(ctx, x + 5, y + 16, 38, 8, "#e46d45");
          rect(ctx, x + 22, y + 9, 4, 10, "#e46d45");
          rect(ctx, x + 19, y + 12, 10, 4, "#e46d45");
          break;
        case "healingCore":
          rect(ctx, x + 5, y + 8, 38, 23, "#172033");
          rect(ctx, x + 7, y + 10, 34, 19, "#dbe8d2");
          rect(ctx, x + 18, y + 2, 12, 14, "#93d4e8");
          drawTinySpark(ctx, x + 34, y + 4, "#fff4d2", time);
          break;
        case "shopCounter":
          rect(ctx, x + 1, y + 8, 94, 22, "#172033");
          rect(ctx, x + 3, y + 6, 90, 22, "#9a663b");
          rect(ctx, x + 8, y + 10, 26, 7, "#f2b94b");
          rect(ctx, x + 55, y + 10, 26, 7, "#54b86b");
          break;
        case "shelfGoods":
          rect(ctx, x + 1, y + 2, 30, 28, "#172033");
          rect(ctx, x + 3, y + 4, 26, 24, "#8b5a37");
          rect(ctx, x + 6, y + 8, 5, 6, "#4aa8d8");
          rect(ctx, x + 15, y + 8, 5, 6, "#f2b94b");
          rect(ctx, x + 23, y + 8, 4, 6, "#e46d45");
          rect(ctx, x + 6, y + 19, 19, 3, "#fff4d2");
          break;
        case "cityTower":
          rect(ctx, x + 4, y + 4, 56, 76, "#172033");
          rect(ctx, x + 8, y + 8, 48, 68, "#9aa9b0");
          for (var tw = 0; tw < 3; tw += 1) {
            rect(ctx, x + 15 + tw * 13, y + 16, 7, 8, "#93d4e8");
            rect(ctx, x + 15 + tw * 13, y + 32, 7, 8, "#93d4e8");
            rect(ctx, x + 15 + tw * 13, y + 48, 7, 8, "#fff4d2");
          }
          rect(ctx, x + 25, y + 62, 14, 14, "#5c4a3d");
          break;
        case "mayorHall":
          rect(ctx, x + 2, y + 16, 92, 58, "#172033");
          rect(ctx, x + 7, y + 21, 82, 49, "#d9e7d5");
          rect(ctx, x, y + 6, 96, 18, "#172033");
          rect(ctx, x + 5, y + 3, 86, 18, "#6f86a8");
          rect(ctx, x + 40, y + 39, 16, 31, "#744428");
          rect(ctx, x + 18, y + 30, 12, 10, "#93d4e8");
          rect(ctx, x + 65, y + 30, 12, 10, "#93d4e8");
          break;
        case "styleShop":
          rect(ctx, x + 2, y + 18, 62, 43, "#172033");
          rect(ctx, x + 5, y + 21, 56, 37, "#fff4d2");
          rect(ctx, x + 5, y + 8, 56, 15, "#f08bb0");
          rect(ctx, x + 13, y + 30, 12, 18, "#4f76b9");
          rect(ctx, x + 35, y + 30, 12, 18, "#54b86b");
          break;
        case "jobBoard":
        case "guildBoard":
          rect(ctx, x + 3, y + 4, 26, 27, "#172033");
          rect(ctx, x + 5, y + 6, 22, 22, code === "jobBoard" ? "#d2a05d" : "#f2b94b");
          rect(ctx, x + 8, y + 10, 16, 2, "#172033");
          rect(ctx, x + 8, y + 15, 12, 2, "#172033");
          rect(ctx, x + 8, y + 20, 15, 2, "#172033");
          break;
        case "realEstate":
          rect(ctx, x + 2, y + 18, 66, 43, "#172033");
          rect(ctx, x + 5, y + 22, 60, 35, "#f7e7b2");
          rect(ctx, x + 0, y + 9, 70, 15, "#4f76b9");
          rect(ctx, x + 12, y + 31, 13, 10, "#93d4e8");
          rect(ctx, x + 42, y + 37, 12, 20, "#744428");
          break;
        case "stall":
          rect(ctx, x + 1, y + 14, 46, 27, "#172033");
          rect(ctx, x + 3, y + 17, 42, 21, "#d2a05d");
          rect(ctx, x + 0, y + 7, 48, 11, "#e46d45");
          rect(ctx, x + 8, y + 7, 8, 11, "#fff4d2");
          rect(ctx, x + 24, y + 7, 8, 11, "#fff4d2");
          rect(ctx, x + 10, y + 23, 24, 5, "#54b86b");
          break;
        case "fountain":
          rect(ctx, x + 4, y + 15, 40, 14, "#172033");
          rect(ctx, x + 7, y + 13, 34, 14, "#8a8f91");
          rect(ctx, x + 12, y + 10, 24, 9, "#4aa8d8");
          drawTinySpark(ctx, x + 24, y + 4, "#fff4d2", time);
          break;
        case "cityLamp":
          rect(ctx, x + 7, y + 7, 3, 22, "#172033");
          rect(ctx, x + 5, y + 3, 7, 6, "#f2b94b");
          rect(ctx, x + 4, y + 4, 9, 3, "#fff4d2");
          break;
        case "factory":
          rect(ctx, x + 1, y + 18, 94, 45, "#172033");
          rect(ctx, x + 4, y + 21, 88, 38, "#8a8f91");
          rect(ctx, x + 11, y + 9, 12, 18, "#59547c");
          rect(ctx, x + 31, y + 30, 11, 10, "#f2b94b");
          rect(ctx, x + 51, y + 30, 11, 10, "#f2b94b");
          rect(ctx, x + 72, y + 40, 12, 19, "#5c4a3d");
          break;
        case "station":
          rect(ctx, x + 1, y + 18, 86, 42, "#172033");
          rect(ctx, x + 5, y + 21, 78, 35, "#d9e7d5");
          rect(ctx, x + 0, y + 8, 88, 14, "#28364f");
          rect(ctx, x + 15, y + 33, 58, 4, "#172033");
          rect(ctx, x + 24, y + 42, 7, 14, "#744428");
          break;
        case "arena":
          rect(ctx, x + 2, y + 14, 92, 56, "#172033");
          rect(ctx, x + 6, y + 18, 84, 48, "#d2a05d");
          rect(ctx, x + 12, y + 24, 72, 9, "#e46d45");
          rect(ctx, x + 28, y + 43, 40, 16, "#6d4029");
          break;
        case "apartment":
          rect(ctx, x + 2, y + 5, 70, 68, "#172033");
          rect(ctx, x + 6, y + 9, 62, 60, "#b8cfbf");
          for (var aw = 0; aw < 4; aw += 1) {
            rect(ctx, x + 13 + aw * 13, y + 17, 7, 7, "#93d4e8");
            rect(ctx, x + 13 + aw * 13, y + 31, 7, 7, "#93d4e8");
            rect(ctx, x + 13 + aw * 13, y + 45, 7, 7, "#fff4d2");
          }
          rect(ctx, x + 31, y + 55, 12, 14, "#744428");
          break;
        case "ruinGate":
          rect(ctx, x + 2, y + 11, 60, 49, "#172033");
          rect(ctx, x + 6, y + 8, 12, 50, "#8f8372");
          rect(ctx, x + 46, y + 8, 12, 50, "#8f8372");
          rect(ctx, x + 14, y + 8, 36, 11, "#b9b0a0");
          rect(ctx, x + 23, y + 24, 18, 34, "#34313a");
          break;
        case "iceRock":
          rect(ctx, x + 3, y + 7, 13, 9, "#172033");
          rect(ctx, x + 4, y + 4, 10, 11, "#b8d4ed");
          rect(ctx, x + 7, y + 2, 5, 7, "#ffffff");
          break;
        case "lavaRock":
          rect(ctx, x + 2, y + 7, 14, 9, "#172033");
          rect(ctx, x + 3, y + 5, 12, 10, "#4b2a2a");
          rect(ctx, x + 6, y + 9, 6, 2, "#e46d45");
          break;
        case "palm":
          rect(ctx, x + 8, y + 10, 4, 21, "#9a663b");
          rect(ctx, x + 2, y + 5, 14, 5, "#3f944f");
          rect(ctx, x + 8, y + 2, 13, 5, "#54b86b");
          rect(ctx, x + 5, y + 8, 16, 4, "#2f8548");
          break;
      }
    },

    objectDepth: function (code, tileX, tileY) {
      var heights = {
        tree: 36, pine: 36, lab: 75, houseBlue: 64, houseRed: 64, shop: 64,
        healingStation: 50, caveMouth: 48, dock: 16, bookshelf: 32, table: 32,
        labDesk: 32, bedBlue: 32, bedRed: 32, healingBed: 32, healingCore: 32,
        shopCounter: 32, shelfGoods: 32, cityTower: 80, mayorHall: 74,
        styleShop: 62, realEstate: 62, stall: 42, fountain: 32, factory: 64,
        station: 60, arena: 70, apartment: 73, ruinGate: 60, palm: 32,
        jobBoard: 32, guildBoard: 32, cityLamp: 31
      };
      return tileY * TILE + (heights[code] || 16);
    },

    drawPlayer: function (ctx, x, y, dir, moving, running, time, avatar) {
      var outfit = avatar && avatar.outfit || "guardian";
      var palettes = {
        guardian: ["#386fd0", "#d9514e", "#172033"],
        ranger: ["#2f8548", "#f2b94b", "#4b3326"],
        courier: ["#e46d45", "#4aa8d8", "#172033"],
        night: ["#31324f", "#7a63d8", "#101521"],
        scholar: ["#fff4d2", "#6aa9c8", "#5c4a3d"],
        ember: ["#b94b31", "#f2b94b", "#3a2730"],
        aqua: ["#2778b9", "#9de8e6", "#172033"],
        crystal: ["#8a8f91", "#93d4e8", "#28364f"]
      };
      var p = palettes[outfit] || palettes.guardian;
      var step = moving ? Math.floor((time || 0) * (running ? 12 : 8)) % 4 : 0;
      var bob = moving && step % 2 ? 1 : 0;
      rect(ctx, x + 2, y + 16, 12, 4, "rgba(12, 21, 31, .32)");
      rect(ctx, x + 3, y + 3 + bob, 10, 13, "#172033");
      rect(ctx, x + 4, y + 4 + bob, 8, 11, p[0]);
      rect(ctx, x + 5, y + 0 + bob, 6, 6, p[2]);
      rect(ctx, x + 6, y + 1 + bob, 4, 4, "#f0c08f");
      rect(ctx, x + 3, y + bob, 10, 3, p[1]);
      var legA = step % 2 ? 2 : 0;
      rect(ctx, x + 4, y + 15, 3, 4 + legA, "#172033");
      rect(ctx, x + 9, y + 15, 3, 4 + (legA ? 0 : 2), "#172033");
      if (dir === "left") rect(ctx, x + 3, y + 6 + bob, 2, 5, "#f0c08f");
      if (dir === "right") rect(ctx, x + 11, y + 6 + bob, 2, 5, "#f0c08f");
    },

    drawRemotePlayer: function (ctx, remote, x, y, time) {
      var bob = Math.sin((time || 0) * 3 + remote.x) > .5 ? 1 : 0;
      rect(ctx, x + 2, y + 16, 12, 4, "rgba(12, 21, 31, .32)");
      rect(ctx, x + 3, y + 3 + bob, 10, 13, "#172033");
      rect(ctx, x + 4, y + 4 + bob, 8, 11, "#7a63d8");
      rect(ctx, x + 5, y + bob, 6, 6, "#172033");
      rect(ctx, x + 6, y + 1 + bob, 4, 4, "#f0c08f");
      rect(ctx, x + 3, y + bob, 10, 3, "#54b86b");
      rect(ctx, x + 4, y + 15, 3, 4, "#172033");
      rect(ctx, x + 9, y + 15, 3, 4, "#172033");
      var label = String(remote.name || "Oyuncu").slice(0, 12);
      ctx.font = "7px monospace";
      var width = Math.max(22, ctx.measureText(label).width + 6);
      rect(ctx, x + 7 - width / 2, y - 9, width, 8, "rgba(23, 32, 51, .78)");
      ctx.fillStyle = "#fff4d2";
      ctx.fillText(label, Math.round(x + 10 - width / 2), y - 3);
      if (remote.emote) {
        var emote = String(remote.emote).slice(0, 18);
        var emoteWidth = Math.max(34, ctx.measureText(emote).width + 8);
        rect(ctx, x + 7 - emoteWidth / 2, y - 22, emoteWidth, 10, "rgba(255, 244, 210, .9)");
        rect(ctx, x + 7, y - 12, 3, 3, "rgba(255, 244, 210, .9)");
        ctx.fillStyle = "#172033";
        ctx.fillText(emote, Math.round(x + 11 - emoteWidth / 2), y - 15);
      }
    },

    drawNpc: function (ctx, npc, x, y, time) {
      var colors = {
        professor: ["#fff4d2", "#6aa9c8"], elder: ["#d2a05d", "#63513c"],
        healer: ["#fff4d2", "#e46d45"], merchant: ["#f2b94b", "#7d5b42"],
        child: ["#f08bb0", "#4f76b9"], traveler: ["#6fb6d9", "#744428"],
        trainer: ["#54b86b", "#28364f"], trainer2: ["#8ed35f", "#6d4029"],
        ranger: ["#2f8548", "#8b5a37"], fisher: ["#4aa8d8", "#fff4d2"],
        collector: ["#f2d54a", "#59547c"], explorer: ["#8a8f91", "#e0c974"],
        rival: ["#e46d45", "#28364f"], sign: ["#d2a05d", "#744428"],
        mayor: ["#fff4d2", "#6f86a8"], stylist: ["#f08bb0", "#28364f"],
        broker: ["#f2b94b", "#4f76b9"], worker: ["#8a8f91", "#d2a05d"],
        clerk: ["#d9e7d5", "#6aa9c8"], guard: ["#c65642", "#172033"]
      }[npc.sprite || npc.type] || ["#fff4d2", "#4f76b9"];
      if (npc.type === "sign" || npc.sprite === "sign") {
        this.drawObject(ctx, "sign", x, y + 2, time);
        return;
      }
      var bob = Math.sin((time || 0) * 3 + npc.x) > .7 ? 1 : 0;
      rect(ctx, x + 2, y + 16, 12, 4, "rgba(12, 21, 31, .3)");
      rect(ctx, x + 3, y + 4 + bob, 10, 12, "#172033");
      rect(ctx, x + 4, y + 5 + bob, 8, 10, colors[0]);
      rect(ctx, x + 5, y + bob, 6, 6, "#172033");
      rect(ctx, x + 6, y + 1 + bob, 4, 4, "#f0c08f");
      rect(ctx, x + 4, y + 2 + bob, 8, 2, colors[1]);
      rect(ctx, x + 4, y + 15, 3, 4, colors[1]);
      rect(ctx, x + 9, y + 15, 3, 4, colors[1]);
    },

    drawCreature: function (ctx, creatureOrBase, x, y, scale, flip, time) {
      var base = creatureOrBase.id ? window.LUMA_DATA.creatures[creatureOrBase.id] : creatureOrBase;
      if (!base || !base.sprite) return;
      var colors = base.sprite.colors.slice();
      if (creatureOrBase.shiny) colors = ["#f2d86b", "#fff2a8", colors[0]];
      ctx.save();
      ctx.translate(x, y + Math.sin((time || 0) * 3) * 1.5);
      ctx.scale(flip ? -scale : scale, scale);
      if (flip) ctx.translate(-32, 0);
      var body = base.sprite.body;
      rect(ctx, 8, 24, 16, 5, "rgba(13, 27, 33, .24)");
      function eye(ex, ey) {
        rect(ctx, ex, ey, 2, 2, "#172033");
        rect(ctx, ex + 1, ey, 1, 1, "#fff4d2");
      }
      if (body === "sprout" || body === "deer") {
        rect(ctx, 8, 12, 18, 14, "#172033");
        rect(ctx, 10, 13, 14, 12, colors[0]);
        rect(ctx, 13, 6, 6, 8, colors[1]);
        rect(ctx, 9, 7, 5, 5, colors[1]);
        rect(ctx, 18, 7, 5, 5, colors[1]);
        eye(14, 16); eye(20, 16);
      } else if (body === "cat" || body === "fox") {
        rect(ctx, 7, 13, 18, 12, "#172033");
        rect(ctx, 9, 14, 14, 10, colors[0]);
        rect(ctx, 8, 9, 5, 6, colors[1]);
        rect(ctx, 19, 9, 5, 6, colors[1]);
        rect(ctx, 23, 17, 6, 4, colors[1]);
        eye(13, 17); eye(19, 17);
      } else if (body === "otter" || body === "drop") {
        rect(ctx, 8, 10, 17, 16, "#172033");
        rect(ctx, 10, 11, 13, 14, colors[0]);
        rect(ctx, 6, 15, 5, 8, colors[1]);
        rect(ctx, 22, 15, 5, 8, colors[1]);
        eye(14, 16); eye(19, 16);
      } else if (body === "beetle" || body === "crystal") {
        rect(ctx, 7, 12, 19, 13, "#172033");
        rect(ctx, 9, 13, 15, 11, colors[0]);
        rect(ctx, 12, 7, 8, 8, colors[1]);
        rect(ctx, 15, 4, 3, 8, colors[2]);
        eye(12, 17); eye(19, 17);
      } else if (body === "bird" || body === "bat") {
        rect(ctx, 9, 13, 14, 12, "#172033");
        rect(ctx, 11, 14, 10, 10, colors[0]);
        rect(ctx, 3, 14, 9, 5, colors[1]);
        rect(ctx, 21, 14, 9, 5, colors[1]);
        rect(ctx, 15, 9, 4, 5, colors[2]);
        eye(14, 17); eye(19, 17);
      } else if (body === "mouse" || body === "orb") {
        rect(ctx, 8, 11, 17, 15, "#172033");
        rect(ctx, 10, 12, 13, 13, colors[0]);
        rect(ctx, 7, 9, 6, 6, colors[1]);
        rect(ctx, 20, 9, 6, 6, colors[1]);
        eye(14, 17); eye(19, 17);
      } else if (body === "fish") {
        rect(ctx, 8, 13, 18, 10, "#172033");
        rect(ctx, 10, 14, 14, 8, colors[0]);
        rect(ctx, 3, 15, 7, 6, colors[1]);
        rect(ctx, 21, 10, 5, 5, colors[2]);
        eye(19, 16);
      } else if (["turtle", "frog", "snail"].indexOf(body) >= 0) {
        rect(ctx, 7, 14, 19, 11, "#172033");
        rect(ctx, 9, 15, 15, 9, colors[0]);
        rect(ctx, 13, 9, 10, 9, colors[1]);
        if (body === "snail") rect(ctx, 3, 12, 8, 8, colors[2]);
        if (body === "frog") {
          rect(ctx, 9, 10, 5, 5, colors[2]);
          rect(ctx, 20, 10, 5, 5, colors[2]);
        }
        eye(14, 17); eye(20, 17);
      } else if (["lizard", "serpent"].indexOf(body) >= 0) {
        rect(ctx, 6, 14, 20, 10, "#172033");
        rect(ctx, 8, 15, 16, 8, colors[0]);
        rect(ctx, 3, 17, 8, 4, colors[1]);
        rect(ctx, 22, 12, 6, 6, colors[2]);
        if (body === "serpent") rect(ctx, 2, 20, 22, 3, colors[1]);
        eye(18, 17); eye(23, 15);
      } else if (["moth", "mantis"].indexOf(body) >= 0) {
        rect(ctx, 10, 11, 12, 14, "#172033");
        rect(ctx, 12, 12, 8, 12, colors[0]);
        rect(ctx, 2, 11, 11, 10, colors[1]);
        rect(ctx, 19, 11, 11, 10, colors[1]);
        rect(ctx, 14, 6, 4, 6, colors[2]);
        if (body === "mantis") {
          rect(ctx, 5, 9, 4, 12, colors[2]);
          rect(ctx, 23, 9, 4, 12, colors[2]);
        }
        eye(14, 16); eye(18, 16);
      } else if (["golem", "rhino"].indexOf(body) >= 0) {
        rect(ctx, 6, 12, 21, 14, "#172033");
        rect(ctx, 8, 13, 17, 12, colors[0]);
        rect(ctx, 12, 8, 10, 7, colors[1]);
        rect(ctx, 16, 4, body === "rhino" ? 6 : 3, body === "rhino" ? 7 : 5, colors[2]);
        rect(ctx, 5, 19, 5, 5, colors[1]);
        rect(ctx, 23, 19, 5, 5, colors[1]);
        eye(13, 17); eye(20, 17);
      } else if (["crab", "scorpion"].indexOf(body) >= 0) {
        rect(ctx, 8, 14, 17, 11, "#172033");
        rect(ctx, 10, 15, 13, 9, colors[0]);
        rect(ctx, 2, 13, 8, 6, colors[1]);
        rect(ctx, 23, 13, 8, 6, colors[1]);
        if (body === "scorpion") {
          rect(ctx, 14, 8, 4, 7, colors[2]);
          rect(ctx, 16, 5, 5, 3, colors[2]);
        }
        eye(13, 17); eye(19, 17);
      } else if (["owl", "penguin"].indexOf(body) >= 0) {
        rect(ctx, 8, 9, 17, 17, "#172033");
        rect(ctx, 10, 10, 13, 15, colors[0]);
        rect(ctx, 12, 14, 9, 9, colors[1]);
        rect(ctx, 7, 13, 5, 9, colors[2]);
        rect(ctx, 21, 13, 5, 9, colors[2]);
        eye(13, 15); eye(19, 15);
      } else if (["rabbit", "wolf"].indexOf(body) >= 0) {
        rect(ctx, 8, 13, 18, 12, "#172033");
        rect(ctx, 10, 14, 14, 10, colors[0]);
        rect(ctx, 9, 6, 4, 9, colors[1]);
        rect(ctx, 20, 6, 4, 9, colors[1]);
        if (body === "wolf") rect(ctx, 23, 16, 7, 5, colors[2]);
        eye(14, 17); eye(20, 17);
      } else if (["jelly", "sprite", "star"].indexOf(body) >= 0) {
        rect(ctx, 9, 10, 16, 15, "#172033");
        rect(ctx, 11, 11, 12, 13, colors[0]);
        rect(ctx, 6, 15, 5, 4, colors[1]);
        rect(ctx, 22, 15, 5, 4, colors[1]);
        if (body === "star") {
          rect(ctx, 14, 5, 5, 7, colors[2]);
          rect(ctx, 14, 22, 5, 6, colors[2]);
        }
        if (body === "jelly") {
          rect(ctx, 11, 23, 2, 5, colors[1]);
          rect(ctx, 17, 23, 2, 5, colors[1]);
          rect(ctx, 22, 23, 2, 5, colors[1]);
        }
        eye(14, 16); eye(19, 16);
      } else if (["flower", "mushroom"].indexOf(body) >= 0) {
        rect(ctx, 9, 13, 16, 13, "#172033");
        rect(ctx, 11, 14, 12, 11, colors[0]);
        rect(ctx, 6, 6, 20, 10, colors[1]);
        rect(ctx, 13, 3, 6, 8, colors[2]);
        if (body === "flower") {
          rect(ctx, 3, 9, 7, 6, colors[2]);
          rect(ctx, 22, 9, 7, 6, colors[2]);
        }
        eye(14, 17); eye(19, 17);
      } else {
        rect(ctx, 8, 12, 18, 14, "#172033");
        rect(ctx, 10, 13, 14, 12, colors[0]);
        rect(ctx, 13, 8, 7, 7, colors[1]);
        rect(ctx, 22, 16, 6, 5, colors[2]);
        eye(14, 17); eye(20, 17);
      }
      var mark = base.sprite.mark;
      var variant = base.sprite.variant || 0;
      if (mark === "stripes") {
        rect(ctx, 11, 15, 3, 9, colors[2]);
        rect(ctx, 18, 15, 3, 9, colors[2]);
      } else if (mark === "spots") {
        rect(ctx, 12, 15, 2, 2, colors[2]);
        rect(ctx, 20, 19, 2, 2, colors[2]);
      } else if (mark === "horn") {
        rect(ctx, 15, 4, 3, 7, colors[2]);
      } else if (mark === "wings") {
        rect(ctx, 3, 14, 6, 6, colors[2]);
        rect(ctx, 23, 14, 6, 6, colors[2]);
      } else if (mark === "tail") {
        rect(ctx, 24, 18, 6 + variant % 4, 3, colors[1]);
      } else if (mark === "gem") {
        rect(ctx, 15, 13, 4, 4, "#fff4d2");
        rect(ctx, 16, 12, 2, 6, colors[2]);
      } else if (mark === "mask") {
        rect(ctx, 12, 16, 10, 3, colors[2]);
      } else if (mark === "crest") {
        rect(ctx, 12, 7, 2, 4 + variant % 3, colors[2]);
        rect(ctx, 18, 7, 2, 4 + (variant + 1) % 3, colors[2]);
      }
      ctx.restore();
    }
  };
})();
