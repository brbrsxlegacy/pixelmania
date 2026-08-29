(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Battle) return;

  var CANVAS_W = 960;
  var CANVAS_H = 540;
  var FIELD_H = 392;

  var biomeAssets = {
    meadow: "assets/battle/biomes/meadow-village.png",
    lake: "assets/battle/biomes/crystal-lake.png",
    cave: "assets/battle/biomes/old-stone-cave.png",
    city: "assets/battle/biomes/luma-city-plaza.png",
    forest: "assets/battle/biomes/shadow-forest.png",
    lava: "assets/battle/biomes/lava-canyon.png",
    snow: "assets/battle/biomes/snow-ridge.png",
    factory: "assets/battle/biomes/factory-district.png",
    harbor: "assets/battle/biomes/harbor-coast.png",
    ruins: "assets/battle/biomes/ancient-ruins.png",
    garden: "assets/battle/biomes/botanical-garden.png",
    sky: "assets/battle/biomes/sky-tower.png"
  };

  var biomePalettes = {
    meadow: ["#8fd56f", "#5da85b", "#d5bc75", "#6cc7e5"],
    lake: ["#55bed8", "#248fb6", "#d6cf94", "#b9eef4"],
    cave: ["#505a66", "#252d39", "#8b806f", "#cad0d7"],
    city: ["#8895a4", "#343f51", "#d4bb78", "#ffe28a"],
    forest: ["#41583f", "#162538", "#644077", "#a8e077"],
    lava: ["#74312b", "#261723", "#ef6b2f", "#ffd067"],
    snow: ["#bed5e4", "#6689a4", "#f2f6ee", "#6db9dd"],
    factory: ["#68727e", "#232a34", "#e6b849", "#86c9dd"],
    harbor: ["#4aa3c0", "#1b5b78", "#ad7d48", "#f1dfae"],
    ruins: ["#797061", "#36313a", "#c7b084", "#77d1c0"],
    garden: ["#6bb869", "#2f6641", "#d6bf79", "#dd8eca"],
    sky: ["#79cdea", "#4a80b7", "#f6e4a3", "#ffffff"]
  };

  var elementColors = {
    "Alev": "#ff6a2f",
    "Su": "#47b9ff",
    "Yaprak": "#78d85e",
    "Kaya": "#b2966f",
    "Elektrik": "#ffd84b",
    "Normal": "#d8d1bf",
    "Ruzgar": "#76e0df",
    "Rüzgar": "#76e0df",
    "Golge": "#a477d9",
    "Gölge": "#a477d9",
    "Isik": "#ffe88a",
    "Işık": "#ffe88a"
  };

  function hasThree() {
    return !!window.THREE;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function disposeMaterial(material) {
    if (!material) return;
    if (material.map) material.map.dispose();
    material.dispose();
  }

  function createCanvas(width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function makeTexture(canvas) {
    var THREE = window.THREE;
    var texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function makeBiomeCanvas(biome) {
    var palette = biomePalettes[biome] || biomePalettes.meadow;
    var canvas = createCanvas(CANVAS_W, FIELD_H);
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    var sky = ctx.createLinearGradient(0, 0, 0, FIELD_H);
    sky.addColorStop(0, palette[3]);
    sky.addColorStop(0.45, palette[0]);
    sky.addColorStop(1, palette[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, FIELD_H);

    ctx.fillStyle = "rgba(255,255,255,.25)";
    for (var c = 0; c < 8; c += 1) {
      var cloudX = (c * 147 + 34) % CANVAS_W;
      var cloudY = 42 + (c % 3) * 32;
      ctx.fillRect(cloudX, cloudY, 42, 10);
      ctx.fillRect(cloudX + 18, cloudY - 8, 36, 12);
      ctx.fillRect(cloudX + 46, cloudY + 4, 28, 8);
    }

    ctx.fillStyle = "rgba(8,18,32,.14)";
    for (var m = 0; m < 9; m += 1) {
      var x = m * 128 - 30;
      var h = 62 + (m % 4) * 18;
      ctx.beginPath();
      ctx.moveTo(x, 178);
      ctx.lineTo(x + 82, 178 - h);
      ctx.lineTo(x + 176, 178);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = palette[1];
    ctx.fillRect(0, 205, CANVAS_W, FIELD_H - 205);

    ctx.fillStyle = palette[2];
    for (var p = 0; p < 72; p += 1) {
      var px = (p * 53 + 17) % CANVAS_W;
      var py = 230 + ((p * 29) % 132);
      ctx.fillRect(px, py, 18 + (p % 4) * 4, 4);
    }

    if (biome === "lava") {
      ctx.fillStyle = "rgba(255,91,30,.42)";
      for (var l = 0; l < 18; l += 1) ctx.fillRect((l * 71) % CANVAS_W, 262 + (l % 4) * 24, 46, 6);
    } else if (biome === "lake" || biome === "harbor") {
      ctx.fillStyle = "rgba(188,239,255,.55)";
      for (var w = 0; w < 28; w += 1) ctx.fillRect((w * 47) % CANVAS_W, 248 + (w % 6) * 18, 34, 4);
    } else if (biome === "cave" || biome === "factory" || biome === "city") {
      ctx.fillStyle = "rgba(245,226,134,.36)";
      for (var s = 0; s < 26; s += 1) ctx.fillRect((s * 61) % CANVAS_W, 232 + (s % 5) * 25, 10, 4);
    }

    return canvas;
  }

  function createCreatureCanvas(creature, flip, scale) {
    var canvas = createCanvas(256, 256);
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (creature && L.Asset && L.Asset.drawCreature) {
      ctx.save();
      var drawScale = scale || 4.25;
      L.Asset.drawCreature(ctx, creature, 94, 92, drawScale, !!flip, Date.now() / 1000);
      ctx.restore();
    }

    return canvas;
  }

  function makeCircleCanvas(color) {
    var canvas = createCanvas(32, 32);
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = color || "#ffffff";
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.68)";
    ctx.fillRect(15, 8, 4, 4);
    return canvas;
  }

  function creatureKey(creature, flip, scale) {
    if (!creature) return "none";
    return [
      creature.id,
      creature.displayName,
      creature.level,
      creature.hp,
      creature.maxHp,
      creature.status,
      flip ? "flip" : "front",
      scale || 1
    ].join("|");
  }

  function elementColor(creature) {
    return elementColors[creature && creature.element] || "#f2b94b";
  }

  function buildBattleBiome(battle) {
    return battle.currentBiome || "meadow";
  }

  function ThreeBattleView(battle) {
    this.battle = battle;
    this.ready = false;
    this.disposed = false;
    this.frame = 0;
    this.playerKey = "";
    this.enemyKey = "";
    this.biome = "";
    this.textures = [];
    this.materials = [];
    this.geometries = [];
    this.particles = [];
  }

  ThreeBattleView.prototype.init = function () {
    if (!hasThree() || !this.battle || !this.battle.screen) return false;
    var THREE = window.THREE;

    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance"
      });
    } catch (error) {
      return false;
    }

    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = "three-battle-layer";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer.domElement.style.pointerEvents = "none";
    this.battle.screen.insertBefore(this.renderer.domElement, this.battle.screen.firstChild);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-CANVAS_W / 2, CANVAS_W / 2, CANVAS_H / 2, -CANVAS_H / 2, 0.1, 1000);
    this.camera.position.set(0, 0, 20);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.createWorld();
    this.resize();
    window.addEventListener("resize", this.resizeBound = this.resize.bind(this));

    this.ready = true;
    this.battle.screen.classList.add("three-battle-ready");
    return true;
  };

  ThreeBattleView.prototype.trackTexture = function (texture) {
    this.textures.push(texture);
    return texture;
  };

  ThreeBattleView.prototype.trackMaterial = function (material) {
    this.materials.push(material);
    return material;
  };

  ThreeBattleView.prototype.trackGeometry = function (geometry) {
    this.geometries.push(geometry);
    return geometry;
  };

  ThreeBattleView.prototype.createWorld = function () {
    var THREE = window.THREE;
    this.biome = buildBattleBiome(this.battle);
    var bgTexture = this.trackTexture(makeTexture(makeBiomeCanvas(this.biome)));
    var bgMaterial = this.trackMaterial(new THREE.MeshBasicMaterial({ map: bgTexture }));
    var bgGeometry = this.trackGeometry(new THREE.PlaneGeometry(CANVAS_W, FIELD_H));
    this.backdrop = new THREE.Mesh(bgGeometry, bgMaterial);
    this.backdrop.position.set(0, CANVAS_H / 2 - FIELD_H / 2, -5);
    this.group.add(this.backdrop);

    this.loadBiomeImage(this.biome);
    this.createGround();
    this.createSprites();
    this.createAura();
  };

  ThreeBattleView.prototype.loadBiomeImage = function (biome) {
    var path = biomeAssets[biome];
    if (!path || !window.THREE.TextureLoader) return;
    var THREE = window.THREE;
    var self = this;
    var loader = new THREE.TextureLoader();
    loader.load(path, function (texture) {
      if (self.disposed || !self.backdrop) {
        texture.dispose();
        return;
      }
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
      if (self.backdrop.material.map) self.backdrop.material.map.dispose();
      self.backdrop.material.map = texture;
      self.backdrop.material.needsUpdate = true;
      self.textures.push(texture);
    });
  };

  ThreeBattleView.prototype.createGround = function () {
    var THREE = window.THREE;
    var shadowGeometry = this.trackGeometry(new THREE.CircleGeometry(1, 48));

    var playerGroundMat = this.trackMaterial(new THREE.MeshBasicMaterial({
      color: 0xc99b55,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    }));
    this.playerGround = new THREE.Mesh(shadowGeometry, playerGroundMat);
    this.playerGround.position.set(-245, -83, -1);
    this.playerGround.scale.set(164, 42, 1);
    this.group.add(this.playerGround);

    var enemyGroundMat = this.trackMaterial(new THREE.MeshBasicMaterial({
      color: 0xd3aa67,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    }));
    this.enemyGround = new THREE.Mesh(shadowGeometry, enemyGroundMat);
    this.enemyGround.position.set(245, 75, -1);
    this.enemyGround.scale.set(136, 34, 1);
    this.group.add(this.enemyGround);

    var shadowMat = this.trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x09111b,
      transparent: true,
      opacity: 0.26,
      depthWrite: false
    }));
    this.playerShadow = new THREE.Mesh(shadowGeometry, shadowMat.clone());
    this.playerShadow.position.set(-245, -100, 0);
    this.playerShadow.scale.set(128, 24, 1);
    this.materials.push(this.playerShadow.material);
    this.group.add(this.playerShadow);

    this.enemyShadow = new THREE.Mesh(shadowGeometry, shadowMat.clone());
    this.enemyShadow.position.set(245, 57, 0);
    this.enemyShadow.scale.set(104, 19, 1);
    this.materials.push(this.enemyShadow.material);
    this.group.add(this.enemyShadow);
  };

  ThreeBattleView.prototype.createSprites = function () {
    var THREE = window.THREE;
    this.playerMaterial = this.trackMaterial(new THREE.SpriteMaterial({ transparent: true }));
    this.enemyMaterial = this.trackMaterial(new THREE.SpriteMaterial({ transparent: true }));

    this.playerSprite = new THREE.Sprite(this.playerMaterial);
    this.enemySprite = new THREE.Sprite(this.enemyMaterial);

    this.playerSprite.position.set(-265, -44, 4);
    this.enemySprite.position.set(250, 125, 4);
    this.playerSprite.scale.set(250, 250, 1);
    this.enemySprite.scale.set(205, 205, 1);
    this.group.add(this.playerSprite);
    this.group.add(this.enemySprite);

    this.refreshSprites(true);
  };

  ThreeBattleView.prototype.createAura = function () {
    var THREE = window.THREE;
    var dotTexture = this.trackTexture(makeTexture(makeCircleCanvas("#ffffff")));
    var dotGeometry = this.trackGeometry(new THREE.PlaneGeometry(12, 12));
    this.auraGroup = new THREE.Group();
    this.group.add(this.auraGroup);

    for (var i = 0; i < 22; i += 1) {
      var mat = this.trackMaterial(new THREE.MeshBasicMaterial({
        map: dotTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      }));
      var mesh = new THREE.Mesh(dotGeometry, mat);
      mesh.userData = {
        side: i < 11 ? "player" : "enemy",
        phase: i * 0.57,
        radius: 38 + (i % 5) * 12,
        speed: 0.6 + (i % 4) * 0.18
      };
      this.auraGroup.add(mesh);
      this.particles.push(mesh);
    }
  };

  ThreeBattleView.prototype.refreshSprites = function (force) {
    var THREE = window.THREE;
    var player = this.battle.playerCreature ? this.battle.playerCreature() : null;
    var enemy = this.battle.enemy;
    var bossMode = !!(this.battle.trainer && (this.battle.trainer.boss || this.battle.trainer.giant || this.battle.trainer.storyBossId));
    var nextPlayerKey = creatureKey(player, false, 4.65);
    var nextEnemyKey = creatureKey(enemy, true, bossMode ? 5.65 : 4.75);

    if (force || nextPlayerKey !== this.playerKey) {
      this.playerKey = nextPlayerKey;
      if (this.playerMaterial.map) this.playerMaterial.map.dispose();
      this.playerMaterial.map = this.trackTexture(makeTexture(createCreatureCanvas(player, false, 4.65)));
      this.playerMaterial.needsUpdate = true;
    }

    if (force || nextEnemyKey !== this.enemyKey) {
      this.enemyKey = nextEnemyKey;
      if (this.enemyMaterial.map) this.enemyMaterial.map.dispose();
      this.enemyMaterial.map = this.trackTexture(makeTexture(createCreatureCanvas(enemy, true, bossMode ? 5.65 : 4.75)));
      this.enemyMaterial.needsUpdate = true;
      this.enemyBaseScale = bossMode ? 285 : 218;
      this.enemySprite.scale.set(this.enemyBaseScale, this.enemyBaseScale, 1);
      this.enemyGround.scale.set(bossMode ? 188 : 136, bossMode ? 45 : 34, 1);
      this.enemyShadow.scale.set(bossMode ? 150 : 104, bossMode ? 27 : 19, 1);
    }

    var playerTint = new THREE.Color(elementColor(player));
    var enemyTint = new THREE.Color(elementColor(enemy));
    for (var i = 0; i < this.particles.length; i += 1) {
      var particle = this.particles[i];
      particle.material.color.copy(particle.userData.side === "player" ? playerTint : enemyTint);
    }
  };

  ThreeBattleView.prototype.resize = function () {
    if (!this.renderer || !this.battle || !this.battle.screen) return;
    var rect = this.battle.screen.getBoundingClientRect();
    var width = Math.max(1, Math.floor(rect.width));
    var height = Math.max(1, Math.floor(rect.height));
    this.renderer.setSize(width, height, false);
  };

  ThreeBattleView.prototype.start = function () {
    var self = this;
    function tick(now) {
      if (self.disposed) return;
      self.frame = window.requestAnimationFrame(tick);
      self.render(now || 0);
    }
    this.frame = window.requestAnimationFrame(tick);
  };

  ThreeBattleView.prototype.render = function (now) {
    if (!this.ready || !this.battle || !this.battle.active || this.battle.screen.classList.contains("hidden")) {
      this.dispose();
      return;
    }

    this.resize();
    this.refreshSprites(false);

    var t = now / 1000;
    var playerHit = this.battle.flashSide === "player" ? 18 : 0;
    var enemyHit = this.battle.flashSide === "enemy" ? -18 : 0;
    var playerBob = Math.sin(t * 2.2) * 4;
    var enemyBob = Math.sin(t * 1.8 + 1.4) * 4;

    this.playerSprite.position.x = -265 + playerHit;
    this.playerSprite.position.y = -44 + playerBob;
    this.enemySprite.position.x = 250 + enemyHit;
    this.enemySprite.position.y = 125 + enemyBob;

    var bossPulse = document.body.classList.contains("boss-battle") ? 1 + Math.sin(t * 3.2) * 0.035 : 1;
    var enemyScale = (this.enemyBaseScale || 218) * bossPulse;
    this.enemySprite.scale.set(enemyScale, enemyScale, 1);

    this.playerGround.rotation.z = Math.sin(t * 0.7) * 0.015;
    this.enemyGround.rotation.z = Math.sin(t * 0.8 + 0.6) * 0.014;

    for (var i = 0; i < this.particles.length; i += 1) {
      var p = this.particles[i];
      var data = p.userData;
      var baseX = data.side === "player" ? -265 : 250;
      var baseY = data.side === "player" ? -10 : 132;
      var angle = t * data.speed + data.phase;
      var drift = Math.sin(t * 1.7 + data.phase) * 8;
      p.position.set(
        baseX + Math.cos(angle) * data.radius,
        baseY + Math.sin(angle * 1.35) * 18 + drift,
        2
      );
      p.scale.setScalar(clamp(0.8 + Math.sin(angle * 2) * 0.28, 0.45, 1.2));
      p.material.opacity = 0.18 + (Math.sin(angle + 1.2) + 1) * 0.16;
    }

    this.renderer.render(this.scene, this.camera);
  };

  ThreeBattleView.prototype.dispose = function () {
    if (this.disposed) return;
    this.disposed = true;
    if (this.frame) window.cancelAnimationFrame(this.frame);
    if (this.resizeBound) window.removeEventListener("resize", this.resizeBound);
    if (this.battle && this.battle.screen) this.battle.screen.classList.remove("three-battle-ready");
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    for (var i = 0; i < this.materials.length; i += 1) disposeMaterial(this.materials[i]);
    for (var g = 0; g < this.geometries.length; g += 1) this.geometries[g].dispose();
    for (var t = 0; t < this.textures.length; t += 1) {
      if (this.textures[t] && this.textures[t].dispose) this.textures[t].dispose();
    }
    if (this.renderer) this.renderer.dispose();
    if (this.battle && this.battle.threeBattleView === this) this.battle.threeBattleView = null;
  };

  function mountThreeBattle(battle) {
    if (!battle || !hasThree()) return;
    if (battle.threeBattleView) battle.threeBattleView.dispose();
    var view = new ThreeBattleView(battle);
    if (view.init()) {
      battle.threeBattleView = view;
      view.start();
    }
  }

  var originalStartCommon = L.Battle.prototype.startCommon;
  L.Battle.prototype.startCommon = function (message) {
    var result = originalStartCommon.call(this, message);
    mountThreeBattle(this);
    return result;
  };

  var originalEnd = L.Battle.prototype.end;
  L.Battle.prototype.end = function () {
    if (this.threeBattleView) this.threeBattleView.dispose();
    return originalEnd.call(this);
  };
})();
