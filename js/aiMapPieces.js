(function () {
  var L = window.LUMA = window.LUMA || {};
  var imageCache = {};

  function pieces() {
    return window.LUMA_DATA && window.LUMA_DATA.aiMapPieces || [];
  }

  function imageFor(piece) {
    if (!piece || !piece.source) return null;
    if (!imageCache[piece.source]) {
      var image = new Image();
      image.onload = function () { image.ready = true; };
      image.onerror = function () { image.failed = true; };
      image.src = piece.source;
      imageCache[piece.source] = image;
    }
    return imageCache[piece.source];
  }

  function preload() {
    pieces().forEach(function (piece) { imageFor(piece); });
  }

  function pieceForMap(map) {
    if (!map || !map.aiPiece) return null;
    var match = pieces().filter(function (piece) { return piece.number === map.aiPiece.number; })[0];
    return match || map.aiPiece;
  }

  L.AiMapPieces = {
    preload: preload,

    list: pieces,

    mapIdFor: function (number) {
      return "aiPiece" + String(number).padStart(3, "0");
    },

    drawBackdrop: function (ctx, map, camera) {
      var piece = pieceForMap(map);
      var image = imageFor(piece);
      if (!image || !image.ready || image.failed) return false;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        Math.round(-camera.x),
        Math.round(-camera.y),
        map.w * L.Asset.TILE,
        map.h * L.Asset.TILE
      );
      ctx.restore();
      return true;
    }
  };

  preload();
})();
