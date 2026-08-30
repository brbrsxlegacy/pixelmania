(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Game || !window.document) return;

  var TILE = 16;
  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";
  var TERRAIN_ATLAS_URL = "assets/three/paper-terrain-atlas.png?v=paper3d-20260830";
  var SKY_TEXTURE_URL = "assets/three/paper-sky.png?v=paper3d-20260830";

  var tileStyles = {
    grass: { color: 0x63c25a, height: 0.12 },
    meadow: { color: 0x78d86b, height: 0.13 },
    forest: { color: 0x284c38, height: 0.2 },
    sandGrass: { color: 0xd7c17a, height: 0.12 },
    road: { color: 0xba8445, height: 0.16 },
    plaza: { color: 0xcaa76a, height: 0.16 },
    leafRoad: { color: 0x7a9b55, height: 0.16 },
    tallGrass: { color: 0x65d454, height: 0.32 },
    water: { color: 0x2497bd, height: 0.07, shine: 0x68e6ff },
    bridge: { color: 0x8b5b2d, height: 0.28 },
    cave: { color: 0x303847, height: 0.22 },
    caveFloor: { color: 0x5a6571, height: 0.2 },
    woodFloor: { color: 0x8a5a30, height: 0.18 },
    labFloor: { color: 0x8a97a4, height: 0.18 },
    clinicFloor: { color: 0xd8ebe6, height: 0.16 },
    shopFloor: { color: 0xd8b66a, height: 0.16 },
    roomWall: { color: 0x253044, height: 0.72 },
    rug: { color: 0x8d4158, height: 0.2 },
    cityStone: { color: 0x8fa2b5, height: 0.18 },
    asphalt: { color: 0x343b4f, height: 0.16 },
    marketTile: { color: 0xc4a369, height: 0.16 },
    gardenTile: { color: 0x71c65d, height: 0.14 },
    desert: { color: 0xd7bd76, height: 0.12 },
    snow: { color: 0xd8edf2, height: 0.13 },
    lava: { color: 0xb23b25, height: 0.08, shine: 0xff7a2f },
    swamp: { color: 0x3d6952, height: 0.1 },
    ruinFloor: { color: 0x777165, height: 0.17 }
  };

  var themes = {
    meadow: { sky: 0x8fd8f2, fog: 0xb7e4f2, sun: 0xfff0bd, ambient: 0x91a6c0 },
    city: { sky: 0x9db3c8, fog: 0xb7c9d8, sun: 0xffdda3, ambient: 0xa5aeb8 },
    cave: { sky: 0x202838, fog: 0x2a3040, sun: 0x97c5ff, ambient: 0x667286 },
    water: { sky: 0x7fd6ed, fog: 0xa9f0ff, sun: 0xf8f6d0, ambient: 0x8fb7c9 },
    desert: { sky: 0xf0d69a, fog: 0xebd8a8, sun: 0xffdf8a, ambient: 0xb59b72 },
    snow: { sky: 0xc7e8f5, fog: 0xe1f8ff, sun: 0xffffff, ambient: 0xa8c6d5 },
    lava: { sky: 0x612735, fog: 0x43242c, sun: 0xff7742, ambient: 0x9a5042 },
    shadow: { sky: 0x172033, fog: 0x222238, sun: 0x9c78ff, ambient: 0x69647e },
    garden: { sky: 0xa3e6cc, fog: 0xcbf5df, sun: 0xfff2b6, ambient: 0x90b89c }
  };

  var elementPalette = {
    yaprak: { main: 0x65bf55, dark: 0x2f6b38, light: 0xb8ef70 },
    alev: { main: 0xdf6532, dark: 0x78302b, light: 0xffbd53 },
    su: { main: 0x45aee0, dark: 0x226b9c, light: 0x9eeaff },
    kaya: { main: 0x9a8468, dark: 0x514638, light: 0xd5c29b },
    elektrik: { main: 0xefc734, dark: 0x59451e, light: 0xffef7a },
    ruzgar: { main: 0x72d6d1, dark: 0x2f6d75, light: 0xc6ffff },
    golge: { main: 0x7a5bb5, dark: 0x30244d, light: 0xc29aff },
    isik: { main: 0xf2d76a, dark: 0x776037, light: 0xfff5b2 },
    normal: { main: 0xc9bfae, dark: 0x676052, light: 0xf0e8d4 }
  };

  var buildingStyles = {
    houseBlue: { w: 3.2, d: 2.8, h: 1.1, wall: 0x8f795e, roof: 0x426d91, trim: 0xd7c99e, door: 0x493221 },
    houseRed: { w: 3.2, d: 2.8, h: 1.1, wall: 0x9a7a5a, roof: 0xa04a3c, trim: 0xe0c292, door: 0x4c2b20 },
    shop: { w: 3.8, d: 3, h: 1.15, wall: 0xb88a55, roof: 0x244f7d, trim: 0xf5ead0, door: 0x51351e, awning: 0xf2f5ff },
    lab: { w: 4.6, d: 3.4, h: 1.25, wall: 0x7bafb0, roof: 0x315f69, trim: 0xd8f5ef, door: 0x253044 },
    healingStation: { w: 4.2, d: 3.1, h: 1.2, wall: 0xe7efe8, roof: 0x62a7a5, trim: 0xf9faf5, door: 0x385363, cross: 0xb94539 },
    cityTower: { w: 3.8, d: 3.2, h: 1.9, wall: 0x8b9bb0, roof: 0x30394d, trim: 0xf0d36f, door: 0x27334a },
    mayorHall: { w: 5.1, d: 3.5, h: 1.5, wall: 0xc1a16c, roof: 0x384862, trim: 0xf0d36f, door: 0x3a2820 },
    styleShop: { w: 3.8, d: 3, h: 1.15, wall: 0xae7aa3, roof: 0x5c3b7a, trim: 0xf2d4ef, door: 0x39203f },
    realEstate: { w: 3.8, d: 3, h: 1.15, wall: 0xc6a66f, roof: 0x7c5d2f, trim: 0xf8e2a8, door: 0x483119 },
    factory: { w: 4.8, d: 3.6, h: 1.35, wall: 0x65707c, roof: 0x313746, trim: 0xe4b950, door: 0x252b36 },
    station: { w: 5, d: 3.3, h: 1.2, wall: 0x3f6691, roof: 0x22374f, trim: 0xf4d77a, door: 0x1f2b3b },
    arena: { w: 5.2, d: 3.8, h: 1.45, wall: 0x9b5544, roof: 0x2d3142, trim: 0xf0c45f, door: 0x241b1d },
    apartment: { w: 3.7, d: 3.2, h: 2.1, wall: 0x8b939d, roof: 0x263141, trim: 0xe2e9ef, door: 0x222b39 }
  };

  var terrainTextureSlots = {
    grass: [0, 0], meadow: [0, 0], gardenTile: [0, 0],
    forest: [1, 0], sandGrass: [2, 0], desert: [2, 0], road: [3, 0],
    plaza: [0, 1], marketTile: [0, 1], leafRoad: [1, 1], tallGrass: [2, 1], water: [3, 1],
    cave: [0, 2], caveFloor: [0, 2], cityStone: [1, 2], labFloor: [1, 2], clinicFloor: [1, 2], asphalt: [2, 2],
    woodFloor: [3, 2], shopFloor: [3, 2], bridge: [3, 2], roomWall: [2, 2], rug: [3, 2],
    snow: [0, 3], lava: [1, 3], swamp: [2, 3], ruinFloor: [3, 3]
  };

  function normalize(value) {
    return String(value || "normal")
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
  }

  function loadThree(callback) {
    if (window.THREE) {
      callback(window.THREE);
      return;
    }
    if (!window.__pixelmaniaThreePromise) {
      window.__pixelmaniaThreePromise = import(THREE_URL).then(function (module) {
        window.THREE = module;
        return module;
      });
    }
    window.__pixelmaniaThreePromise.then(callback).catch(function (error) {
      console.warn("Three.js world renderer could not load.", error);
    });
  }

  function hash2(x, y, salt) {
    var n = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    return (n ^ (n >>> 16)) >>> 0;
  }

  function tileStyle(code) {
    return tileStyles[code] || tileStyles.grass;
  }

  function detectTheme(map) {
    var id = normalize((map && map.id) + " " + (map && map.name));
    if (id.indexOf("lav") >= 0 || id.indexOf("kor") >= 0) return themes.lava;
    if (id.indexOf("magara") >= 0 || id.indexOf("maden") >= 0 || id.indexOf("tas") >= 0) return themes.cave;
    if (id.indexOf("liman") >= 0 || id.indexOf("gol") >= 0 || id.indexOf("sahil") >= 0 || id.indexOf("kiyi") >= 0) return themes.water;
    if (id.indexOf("kum") >= 0 || id.indexOf("cukur") >= 0) return themes.desert;
    if (id.indexOf("buz") >= 0 || id.indexOf("kutup") >= 0) return themes.snow;
    if (id.indexOf("golge") >= 0 || id.indexOf("harabe") >= 0) return themes.shadow;
    if (id.indexOf("sehir") >= 0 || id.indexOf("merkez") >= 0 || id.indexOf("istasyon") >= 0 || id.indexOf("arena") >= 0) return themes.city;
    if (id.indexOf("bahce") >= 0 || id.indexOf("ova") >= 0) return themes.garden;
    return themes.meadow;
  }

  function worldX(map, tileX) {
    return tileX - map.w / 2;
  }

  function worldZ(map, tileY) {
    return tileY - map.h / 2;
  }

  function directionAngle(dir) {
    if (dir === "up") return Math.PI;
    if (dir === "left") return Math.PI / 2;
    if (dir === "right") return -Math.PI / 2;
    return 0;
  }

  function baseForCreature(id) {
    if (L.Creatures && L.Creatures.getBase) return L.Creatures.getBase(id);
    var list = L.Creatures && L.Creatures.list || [];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function elementForCreature(creature) {
    var element = creature && creature.element;
    if (!element && creature && creature.creatureId) {
      var base = baseForCreature(creature.creatureId);
      element = base && base.element;
    }
    if (!element && creature && creature.id) {
      var ownBase = baseForCreature(creature.id);
      element = ownBase && ownBase.element;
    }
    var key = normalize(element || "normal");
    return elementPalette[key] ? key : "normal";
  }

  function World3DView(game, THREE) {
    this.game = game;
    this.THREE = THREE;
    this.frame = game.canvas && game.canvas.parentElement;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.mapRoot = null;
    this.actorRoot = null;
    this.actorCache = {};
    this.materials = {};
    this.tileMaterials = {};
    this.terrainTextures = {};
    this.spriteTextures = {};
    this.terrainAtlas = null;
    this.skyTexture = null;
    this.skyDome = null;
    this.textureVersion = 0;
    this.mapKey = "";
    this.width = 0;
    this.height = 0;
    this.dummy = new THREE.Object3D();
    this.sun = null;
    this.ready = false;
    this.init();
  }

  World3DView.prototype.init = function () {
    var THREE = this.THREE;
    if (!this.frame) return;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(1.35, window.devicePixelRatio || 1));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap || THREE.BasicShadowMap;
      this.canvas = this.renderer.domElement;
      this.canvas.className = "three-world-layer";
      this.canvas.setAttribute("aria-hidden", "true");
      this.frame.appendChild(this.canvas);
      this.frame.classList.add("world-three-ready");

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 140);
      this.camera.position.set(0, 11, 13);

      this.mapRoot = new THREE.Group();
      this.actorRoot = new THREE.Group();
      this.scene.add(this.mapRoot);
      this.scene.add(this.actorRoot);

      var ambient = new THREE.HemisphereLight(0xf3f8ff, 0x45523f, 0.85);
      this.scene.add(ambient);

      this.sun = new THREE.DirectionalLight(0xfff0c8, 1.6);
      this.sun.position.set(-10, 18, 9);
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.width = 1024;
      this.sun.shadow.mapSize.height = 1024;
      this.sun.shadow.camera.left = -22;
      this.sun.shadow.camera.right = 22;
      this.sun.shadow.camera.top = 22;
      this.sun.shadow.camera.bottom = -22;
      this.scene.add(this.sun);
      this.loadPaperTextures();
      this.loadPaperSky();

      this.resize();
      window.addEventListener("resize", this.resize.bind(this), { passive: true });
      this.ready = true;
      window.PIXELMANIA_WORLD_3D_READY = true;
    } catch (error) {
      console.warn("Three.js world renderer failed to start.", error);
      if (this.frame) this.frame.classList.remove("world-three-ready");
    }
  };

  World3DView.prototype.resize = function () {
    if (!this.renderer || !this.frame) return;
    var rect = this.frame.getBoundingClientRect();
    var width = Math.max(1, Math.floor(rect.width));
    var height = Math.max(1, Math.floor(rect.height));
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  World3DView.prototype.mat = function (color, options) {
    var key = color + "|" + (options && options.emissive || 0) + "|" + (options && options.transparent ? 1 : 0);
    if (!this.materials[key]) {
      var params = {
        color: color,
        roughness: options && options.roughness != null ? options.roughness : 0.78,
        metalness: options && options.metalness != null ? options.metalness : 0.03,
        flatShading: true
      };
      if (options && options.emissive) {
        params.emissive = options.emissive;
        params.emissiveIntensity = options.emissiveIntensity || 0.35;
      }
      if (options && options.transparent) {
        params.transparent = true;
        params.opacity = options.opacity == null ? 0.86 : options.opacity;
      }
      this.materials[key] = new this.THREE.MeshStandardMaterial(params);
    }
    return this.materials[key];
  };

  World3DView.prototype.loadPaperTextures = function () {
    if (!window.Image) return;
    var image = new Image();
    var self = this;
    image.onload = function () {
      self.terrainAtlas = image;
      self.terrainTextures = {};
      self.tileMaterials = {};
      self.textureVersion += 1;
      self.mapKey = "";
    };
    image.onerror = function () {
      console.warn("Paper terrain texture could not load.");
    };
    image.src = TERRAIN_ATLAS_URL;
  };

  World3DView.prototype.loadPaperSky = function () {
    var self = this;
    var loader = new this.THREE.TextureLoader();
    loader.load(SKY_TEXTURE_URL, function (texture) {
      self.configurePixelTexture(texture);
      if (self.THREE.SRGBColorSpace) texture.colorSpace = self.THREE.SRGBColorSpace;
      self.skyTexture = texture;
      self.buildSkyDome();
    }, undefined, function () {
      console.warn("Paper sky texture could not load.");
    });
  };

  World3DView.prototype.configurePixelTexture = function (texture) {
    texture.magFilter = this.THREE.NearestFilter;
    texture.minFilter = this.THREE.NearestFilter;
    texture.wrapS = this.THREE.RepeatWrapping;
    texture.wrapT = this.THREE.RepeatWrapping;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  };

  World3DView.prototype.buildSkyDome = function () {
    if (!this.scene || !this.skyTexture) return;
    if (this.skyDome) this.scene.remove(this.skyDome);
    var geometry = new this.THREE.SphereGeometry(70, 32, 16);
    var material = new this.THREE.MeshBasicMaterial({ map: this.skyTexture, side: this.THREE.BackSide, fog: false });
    this.skyDome = new this.THREE.Mesh(geometry, material);
    this.skyDome.rotation.y = Math.PI;
    this.scene.add(this.skyDome);
  };

  World3DView.prototype.makeAtlasTexture = function (code) {
    if (!this.terrainAtlas) return null;
    var key = code || "grass";
    if (this.terrainTextures[key]) return this.terrainTextures[key];
    var slot = terrainTextureSlots[key] || terrainTextureSlots.grass;
    var image = this.terrainAtlas;
    var cellW = image.width / 4;
    var cellH = image.height / 4;
    var canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, slot[0] * cellW, slot[1] * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    var texture = new this.THREE.CanvasTexture(canvas);
    this.configurePixelTexture(texture);
    this.terrainTextures[key] = texture;
    return texture;
  };

  World3DView.prototype.tileMat = function (code, style, options) {
    var texture = this.makeAtlasTexture(code);
    var key = "tile|" + code + "|" + this.textureVersion + "|" + (options && options.emissive || 0) + "|" + (options && options.transparent ? 1 : 0);
    if (!this.tileMaterials[key]) {
      var params = {
        color: texture ? 0xffffff : style.color,
        roughness: options && options.roughness != null ? options.roughness : 0.82,
        metalness: 0.02,
        flatShading: true
      };
      if (texture) params.map = texture;
      if (options && options.emissive) {
        params.emissive = options.emissive;
        params.emissiveIntensity = options.emissiveIntensity || 0.35;
      }
      if (options && options.transparent) {
        params.transparent = true;
        params.opacity = options.opacity == null ? 0.9 : options.opacity;
      }
      this.tileMaterials[key] = new this.THREE.MeshStandardMaterial(params);
    }
    return this.tileMaterials[key];
  };
  World3DView.prototype.prepare = function (mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  World3DView.prototype.clearGroup = function (group) {
    while (group.children.length) group.remove(group.children[0]);
  };

  World3DView.prototype.addCube = function (parent, sx, sy, sz, color, x, y, z, options) {
    var mesh = new this.THREE.Mesh(new this.THREE.BoxGeometry(1, 1, 1), this.mat(color, options));
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x || 0, (y || 0) + sy / 2, z || 0);
    parent.add(this.prepare(mesh));
    return mesh;
  };

  World3DView.prototype.addCylinder = function (parent, radius, height, color, x, y, z, segments, options) {
    var mesh = new this.THREE.Mesh(new this.THREE.CylinderGeometry(radius, radius, height, segments || 10), this.mat(color, options));
    mesh.position.set(x || 0, (y || 0) + height / 2, z || 0);
    parent.add(this.prepare(mesh));
    return mesh;
  };

  World3DView.prototype.addCone = function (parent, radius, height, color, x, y, z, segments, options) {
    var mesh = new this.THREE.Mesh(new this.THREE.ConeGeometry(radius, height, segments || 8), this.mat(color, options));
    mesh.position.set(x || 0, (y || 0) + height / 2, z || 0);
    parent.add(this.prepare(mesh));
    return mesh;
  };

  World3DView.prototype.addSphere = function (parent, radius, color, x, y, z, options) {
    var mesh = new this.THREE.Mesh(new this.THREE.DodecahedronGeometry(radius, 1), this.mat(color, options));
    mesh.position.set(x || 0, y || 0, z || 0);
    parent.add(this.prepare(mesh));
    return mesh;
  };

  World3DView.prototype.build = function (map) {
    if (!map) return;
    var theme = detectTheme(map);
    this.scene.background = new this.THREE.Color(theme.sky);
    this.scene.fog = new this.THREE.Fog(theme.fog, 18, 48);
    if (this.sun) {
      this.sun.color.setHex(theme.sun);
      this.sun.intensity = 1.55;
    }

    this.clearGroup(this.mapRoot);
    this.clearGroup(this.actorRoot);
    this.actorCache = {};
    this.buildGround(map);
    this.buildDecorations(map);
    this.buildBorder(map);
    this.mapKey = map.id + "|" + map.w + "|" + map.h + "|" + map.ground.length + "|" + map.decoration.length + "|" + this.textureVersion;
  };

  World3DView.prototype.buildGround = function (map) {
    var THREE = this.THREE;
    var groups = {};
    for (var y = 0; y < map.h; y += 1) {
      for (var x = 0; x < map.w; x += 1) {
        var code = map.ground[y * map.w + x] || "grass";
        if (!groups[code]) groups[code] = [];
        groups[code].push({ x: x, y: y });
      }
    }

    Object.keys(groups).forEach(function (code) {
      var style = tileStyle(code);
      var geometry = new THREE.BoxGeometry(1.01, style.height, 1.01);
      var materialOptions = style.shine ? { emissive: style.shine, emissiveIntensity: code === "lava" ? 0.55 : 0.14, roughness: 0.38, transparent: code === "water", opacity: 0.86 } : {};
      var mesh = new THREE.InstancedMesh(geometry, this.tileMat(code, style, materialOptions), groups[code].length);
      mesh.userData.tileCode = code;
      mesh.receiveShadow = true;
      for (var i = 0; i < groups[code].length; i += 1) {
        var tile = groups[code][i];
        var wobble = code === "water" ? Math.sin((tile.x + tile.y) * 0.7) * 0.012 : 0;
        this.dummy.position.set(worldX(map, tile.x) + 0.5, style.height / 2 + wobble, worldZ(map, tile.y) + 0.5);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.mapRoot.add(mesh);
    }, this);

    this.buildTerrainDetails(map);
  };

  World3DView.prototype.buildTerrainDetails = function (map) {
    var detailRoot = new this.THREE.Group();
    for (var y = 1; y < map.h - 1; y += 1) {
      for (var x = 1; x < map.w - 1; x += 1) {
        var code = map.ground[y * map.w + x] || "grass";
        var blocked = map.collision && map.collision[y * map.w + x];
        var h = hash2(x, y, 3);
        if (blocked || h % 9 > 1) continue;
        var wx = worldX(map, x) + 0.5 + ((h % 11) - 5) * 0.025;
        var wz = worldZ(map, y) + 0.5 + (((h >> 4) % 11) - 5) * 0.025;
        if (code === "grass" || code === "meadow" || code === "gardenTile" || code === "tallGrass") {
          this.addCube(detailRoot, 0.08, 0.28 + (h % 4) * 0.03, 0.08, h % 2 ? 0x9be071 : 0x4fa747, wx, 0.12, wz);
        } else if (code === "road" || code === "desert" || code === "plaza") {
          this.addSphere(detailRoot, 0.08, h % 2 ? 0xa0744a : 0xd2b575, wx, 0.23, wz);
        } else if (code === "water" || code === "swamp") {
          this.addCube(detailRoot, 0.34, 0.02, 0.04, 0xb9f8ff, wx, 0.12, wz, { emissive: 0x75eaff, emissiveIntensity: 0.2, transparent: true, opacity: 0.7 });
        }
      }
    }
    this.mapRoot.add(detailRoot);
  };

  World3DView.prototype.buildDecorations = function (map) {
    for (var y = 0; y < map.h; y += 1) {
      for (var x = 0; x < map.w; x += 1) {
        var code = map.decoration[y * map.w + x];
        if (!code) continue;
        var object = this.makeDecoration(code, map, x, y);
        if (object) this.mapRoot.add(object);
      }
    }
    map.items.forEach(function (item) {
      if (this.game.state && this.game.state.collectedItems && this.game.state.collectedItems[item.id]) return;
      if (item.hidden) return;
      var chest = this.makeDecoration("chest", map, item.x, item.y);
      if (chest) this.mapRoot.add(chest);
    }, this);
  };

  World3DView.prototype.makeDecoration = function (code, map, x, y) {
    if (buildingStyles[code]) return this.makeBuilding(code, map, x, y);
    if (code === "tree") return this.makeTree(map, x, y, false);
    if (code === "pine") return this.makeTree(map, x, y, true);
    if (code === "palm") return this.makePalm(map, x, y);
    if (code === "sign" || code === "guildBoard" || code === "jobBoard") return this.makeSign(map, x, y);
    if (code === "well" || code === "fountain") return this.makeWell(map, x, y, code === "fountain");
    if (code === "cityLamp") return this.makeLamp(map, x, y);
    if (code === "flowerPink" || code === "flowerYellow" || code === "mushroom") return this.makeFlower(map, x, y, code);
    if (code === "rock" || code === "lavaRock" || code === "iceRock" || code === "caveWall") return this.makeRock(map, x, y, code);
    if (code === "caveMouth" || code === "ruinGate") return this.makeGate(map, x, y, code);
    if (code === "crystalBlue" || code === "crystalPink") return this.makeCrystal(map, x, y, code);
    if (code === "chest") return this.makeChest(map, x, y);
    if (code === "bookshelf" || code === "shelfGoods" || code === "table" || code === "labDesk" || code === "shopCounter") return this.makeFurniture(map, x, y, code);
    if (code === "bedBlue" || code === "bedRed" || code === "healingBed" || code === "healingCore") return this.makeFurniture(map, x, y, code);
    if (code === "dock" || code === "log") return this.makeDock(map, x, y, code);
    if (code === "stall") return this.makeStall(map, x, y);
    return null;
  };

  World3DView.prototype.makeBuilding = function (code, map, x, y) {
    var cfg = buildingStyles[code];
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + cfg.w / 2, 0.15, worldZ(map, y) + cfg.d / 2);
    this.addCube(g, cfg.w, cfg.h, cfg.d, cfg.wall, 0, 0, 0);
    this.addCube(g, cfg.w + 0.28, 0.28, cfg.d + 0.22, cfg.roof, 0, cfg.h, 0);
    this.addCube(g, cfg.w * 0.9, 0.18, 0.2, cfg.trim, 0, cfg.h + 0.3, -cfg.d * 0.36);
    this.addCube(g, 0.42, 0.66, 0.08, cfg.door, 0, 0.02, cfg.d / 2 + 0.04);
    this.addCube(g, 0.42, 0.32, 0.06, cfg.trim, -cfg.w * 0.28, 0.62, cfg.d / 2 + 0.05);
    this.addCube(g, 0.42, 0.32, 0.06, cfg.trim, cfg.w * 0.28, 0.62, cfg.d / 2 + 0.05);
    if (cfg.awning) this.addCube(g, cfg.w * 0.92, 0.18, 0.46, cfg.awning, 0, 0.88, cfg.d / 2 + 0.15);
    if (cfg.cross) {
      this.addCube(g, 0.18, 0.55, 0.08, cfg.cross, 0, 0.82, cfg.d / 2 + 0.08);
      this.addCube(g, 0.55, 0.18, 0.08, cfg.cross, 0, 1, cfg.d / 2 + 0.09);
    }
    if (code === "lab") {
      this.addSphere(g, 0.36, 0xaee7ec, cfg.w * 0.27, cfg.h + 0.56, -cfg.d * 0.2, { emissive: 0x65e4ef, emissiveIntensity: 0.18, transparent: true, opacity: 0.84 });
      this.addCylinder(g, 0.08, 0.8, 0x263141, -cfg.w * 0.35, cfg.h + 0.2, -cfg.d * 0.24, 8);
    }
    if (code === "factory") {
      this.addCube(g, 0.42, 1.2, 0.42, 0x252b36, cfg.w * 0.36, cfg.h + 0.1, -cfg.d * 0.25);
      this.addSphere(g, 0.18, 0xd6dde8, cfg.w * 0.36, cfg.h + 1.48, -cfg.d * 0.25, { transparent: true, opacity: 0.65 });
    }
    if (code === "cityTower" || code === "mayorHall") {
      this.addCylinder(g, 0.38, 0.9, cfg.trim, 0, cfg.h + 0.28, -cfg.d * 0.12, 6);
      this.addCone(g, 0.52, 0.7, cfg.roof, 0, cfg.h + 1.12, -cfg.d * 0.12, 6);
    }
    return g;
  };

  World3DView.prototype.makeTree = function (map, x, y, pine) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.8, 0.14, worldZ(map, y) + 0.8);
    this.addCube(g, 0.22, 0.72, 0.22, 0x5b3d24, 0, 0, 0);
    if (pine) {
      this.addCone(g, 0.8, 1.1, 0x244f38, 0, 0.55, 0, 7);
      this.addCone(g, 0.6, 0.9, 0x2f6a42, 0, 1.1, 0, 7);
    } else {
      this.addSphere(g, 0.74, 0x3f8f42, 0, 1.0, 0);
      this.addSphere(g, 0.48, 0x61ba50, -0.28, 1.15, 0.18);
    }
    return g;
  };

  World3DView.prototype.makePalm = function (map, x, y) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.14, worldZ(map, y) + 0.5);
    this.addCylinder(g, 0.12, 1.05, 0x7c5532, 0, 0, 0, 8);
    for (var i = 0; i < 4; i += 1) {
      var leaf = this.addCube(g, 0.18, 0.08, 1.05, 0x4ba34a, 0, 1.02, 0);
      leaf.rotation.y = i * Math.PI / 2;
      leaf.rotation.x = 0.35;
    }
    return g;
  };

  World3DView.prototype.makeSign = function (map, x, y) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.17, worldZ(map, y) + 0.5);
    this.addCube(g, 0.12, 0.55, 0.12, 0x4b3220, -0.16, 0, 0);
    this.addCube(g, 0.12, 0.55, 0.12, 0x4b3220, 0.16, 0, 0);
    this.addCube(g, 0.7, 0.38, 0.08, 0xc29254, 0, 0.48, 0.02);
    return g;
  };

  World3DView.prototype.makeWell = function (map, x, y, fountain) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.17, worldZ(map, y) + 0.5);
    this.addCylinder(g, 0.45, 0.32, fountain ? 0x9aa9b5 : 0x83705c, 0, 0, 0, 12);
    this.addCylinder(g, 0.32, 0.08, 0x43a9d4, 0, 0.34, 0, 12, { emissive: 0x55dfff, emissiveIntensity: 0.18, transparent: true, opacity: 0.8 });
    if (fountain) this.addCone(g, 0.18, 0.6, 0x87d8f4, 0, 0.35, 0, 12, { emissive: 0x55dfff, emissiveIntensity: 0.18, transparent: true, opacity: 0.74 });
    return g;
  };

  World3DView.prototype.makeLamp = function (map, x, y) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.15, worldZ(map, y) + 0.5);
    this.addCylinder(g, 0.05, 0.9, 0x233044, 0, 0, 0, 8);
    this.addCube(g, 0.28, 0.22, 0.28, 0xf4d15c, 0, 0.86, 0, { emissive: 0xf6d05a, emissiveIntensity: 0.7 });
    return g;
  };

  World3DView.prototype.makeFlower = function (map, x, y, code) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.15, worldZ(map, y) + 0.5);
    var color = code === "flowerYellow" ? 0xf3d64d : (code === "mushroom" ? 0xba4a74 : 0xd86ab0);
    this.addCube(g, 0.06, 0.28, 0.06, 0x3d8f46, 0, 0, 0);
    this.addSphere(g, 0.11, color, 0, 0.34, 0);
    return g;
  };

  World3DView.prototype.makeRock = function (map, x, y, code) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.52, 0.18, worldZ(map, y) + 0.52);
    var color = code === "lavaRock" ? 0x552d2a : (code === "iceRock" ? 0x9ddbed : 0x6d6d69);
    var glow = code === "lavaRock" ? 0xff613a : (code === "iceRock" ? 0x82e7ff : 0);
    this.addSphere(g, code === "caveWall" ? 0.62 : 0.36, color, 0, 0.34, 0, glow ? { emissive: glow, emissiveIntensity: 0.15 } : null);
    if (code === "caveWall") this.addCube(g, 0.85, 0.65, 0.18, 0x252c39, 0, 0.1, -0.28);
    return g;
  };

  World3DView.prototype.makeGate = function (map, x, y, code) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.9, 0.2, worldZ(map, y) + 0.9);
    this.addCube(g, 0.38, 1.15, 0.38, 0x3a3140, -0.42, 0, 0);
    this.addCube(g, 0.38, 1.15, 0.38, 0x3a3140, 0.42, 0, 0);
    this.addCube(g, 1.18, 0.32, 0.36, code === "ruinGate" ? 0x8f7961 : 0x202839, 0, 1.0, 0);
    this.addCube(g, 0.56, 0.8, 0.05, code === "ruinGate" ? 0x2f394b : 0x05070f, 0, 0.05, 0.19);
    return g;
  };

  World3DView.prototype.makeCrystal = function (map, x, y, code) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.17, worldZ(map, y) + 0.5);
    var color = code === "crystalPink" ? 0xda79d6 : 0x55c7f0;
    this.addCone(g, 0.24, 0.82, color, 0, 0, 0, 5, { emissive: color, emissiveIntensity: 0.35, transparent: true, opacity: 0.9 });
    return g;
  };

  World3DView.prototype.makeChest = function (map, x, y) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.17, worldZ(map, y) + 0.5);
    this.addCube(g, 0.62, 0.38, 0.48, 0x76502b, 0, 0, 0);
    this.addCube(g, 0.68, 0.1, 0.5, 0xe0b850, 0, 0.35, 0);
    return g;
  };

  World3DView.prototype.makeFurniture = function (map, x, y, code) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.16, worldZ(map, y) + 0.5);
    if (code.indexOf("bed") >= 0 || code === "healingBed") {
      this.addCube(g, 0.9, 0.26, 1.25, code === "bedRed" ? 0x8f3e4e : 0x3d6791, 0, 0, 0);
      this.addCube(g, 0.78, 0.12, 0.35, 0xf2ead7, 0, 0.25, -0.38);
      return g;
    }
    if (code === "healingCore") {
      this.addSphere(g, 0.35, 0x72efd6, 0, 0.52, 0, { emissive: 0x55ffd5, emissiveIntensity: 0.55 });
      return g;
    }
    if (code === "table" || code === "labDesk" || code === "shopCounter") {
      this.addCube(g, code === "labDesk" ? 1.25 : 0.9, 0.32, 0.72, code === "labDesk" ? 0x586c7c : 0x76502b, 0, 0.22, 0);
      this.addCube(g, 0.18, 0.45, 0.18, 0x493221, -0.28, 0, -0.2);
      this.addCube(g, 0.18, 0.45, 0.18, 0x493221, 0.28, 0, 0.2);
      return g;
    }
    this.addCube(g, 0.76, 0.95, 0.36, code === "shelfGoods" ? 0x7b5541 : 0x5a422d, 0, 0, 0);
    this.addCube(g, 0.62, 0.12, 0.4, code === "shelfGoods" ? 0xf0c866 : 0x8f7450, 0, 0.62, 0.02);
    return g;
  };

  World3DView.prototype.makeDock = function (map, x, y, code) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.5, 0.19, worldZ(map, y) + 0.5);
    this.addCube(g, code === "dock" ? 1.1 : 0.9, 0.18, code === "dock" ? 0.72 : 0.22, 0x76502b, 0, 0, 0);
    return g;
  };

  World3DView.prototype.makeStall = function (map, x, y) {
    var g = new this.THREE.Group();
    g.position.set(worldX(map, x) + 0.7, 0.16, worldZ(map, y) + 0.7);
    this.addCube(g, 1.25, 0.45, 0.8, 0x8c5b33, 0, 0, 0);
    this.addCube(g, 1.4, 0.18, 0.92, 0xe0b84a, 0, 0.55, 0);
    return g;
  };

  World3DView.prototype.buildBorder = function (map) {
    var g = new this.THREE.Group();
    var wallColor = 0x172033;
    this.addCube(g, map.w, 0.8, 0.5, wallColor, 0, 0, -map.h / 2 - 0.25);
    this.addCube(g, map.w, 0.8, 0.5, wallColor, 0, 0, map.h / 2 + 0.25);
    this.addCube(g, 0.5, 0.8, map.h, wallColor, -map.w / 2 - 0.25, 0, 0);
    this.addCube(g, 0.5, 0.8, map.h, wallColor, map.w / 2 + 0.25, 0, 0);
    this.mapRoot.add(g);
  };

  World3DView.prototype.makeHumanoid = function (palette) {
    var g = new this.THREE.Group();
    var skin = palette.skin || 0xe2b68d;
    var hair = palette.hair || 0x3a2a22;
    var body = palette.body || 0x315b8f;
    var trim = palette.trim || 0xf2d56b;
    this.addCube(g, 0.36, 0.48, 0.22, body, 0, 0.26, 0);
    this.addCube(g, 0.26, 0.14, 0.18, 0x243141, -0.09, 0, 0);
    this.addCube(g, 0.26, 0.14, 0.18, 0x243141, 0.09, 0, 0);
    this.addCube(g, 0.38, 0.12, 0.24, trim, 0, 0.69, 0);
    this.addCube(g, 0.34, 0.34, 0.28, skin, 0, 0.78, 0);
    this.addCube(g, 0.38, 0.16, 0.3, hair, 0, 1.02, -0.03);
    this.addCube(g, 0.07, 0.07, 0.04, 0x05070f, -0.07, 0.87, 0.16);
    this.addCube(g, 0.07, 0.07, 0.04, 0x05070f, 0.07, 0.87, 0.16);
    return g;
  };

  World3DView.prototype.npcPalette = function (npc) {
    var key = npc && (npc.sprite || npc.type || npc.action) || "";
    var palettes = {
      professor: { body: 0xf0efe1, hair: 0xd4d7db, trim: 0x48b1a6 },
      elder: { body: 0x7a8f58, hair: 0xe0d6c0, trim: 0xd6b260 },
      healer: { body: 0xd9f3ef, hair: 0xdb98a5, trim: 0x4fb1a4 },
      merchant: { body: 0xc28a45, hair: 0x463026, trim: 0xf0d060 },
      child: { body: 0x7d68d0, hair: 0x52311f, trim: 0xf4d56c },
      traveler: { body: 0x416b87, hair: 0x2f2b28, trim: 0xbfd7e9 },
      trainer: { body: 0x9c3d4d, hair: 0x33231d, trim: 0xf2d76a },
      trainer2: { body: 0x4a6bb0, hair: 0x2a1f1a, trim: 0xe7e7f0 },
      collector: { body: 0x6b5488, hair: 0x4b3220, trim: 0xeac86a },
      ranger: { body: 0x447b4a, hair: 0x31251d, trim: 0x9ed06c },
      fisher: { body: 0x3b78a0, hair: 0xc2a66a, trim: 0xf1f7ff },
      explorer: { body: 0xa46f38, hair: 0x33251d, trim: 0x71d0dc },
      rival: { body: 0x293d68, hair: 0x674426, trim: 0xf3d95d },
      clerk: { body: 0x315e87, hair: 0x2c2521, trim: 0xf0e5c8 },
      stylist: { body: 0x944a91, hair: 0xe4a1d8, trim: 0xffe181 },
      broker: { body: 0x7d6240, hair: 0x2e241e, trim: 0xf1d487 },
      mayor: { body: 0x283b57, hair: 0xf1e5ca, trim: 0xf2d35b },
      worker: { body: 0x4b6c91, hair: 0xf0be48, trim: 0xf0be48 },
      guard: { body: 0x5a313c, hair: 0x25242b, trim: 0xe5c55c },
      sign: { body: 0xc29254, hair: 0x4b3220, trim: 0xc29254 }
    };
    return palettes[key] || { body: 0x52677c, hair: 0x3a2a22, trim: 0xd9c27a };
  };

  World3DView.prototype.makeLuma = function (creature) {
    var key = elementForCreature(creature);
    var palette = elementPalette[key] || elementPalette.normal;
    var g = new this.THREE.Group();
    this.addSphere(g, 0.28, palette.main, 0, 0.42, 0, { emissive: palette.light, emissiveIntensity: 0.08 });
    this.addSphere(g, 0.18, palette.light, 0.23, 0.52, 0.08);
    this.addSphere(g, 0.18, palette.light, -0.23, 0.52, 0.08);
    this.addCone(g, 0.16, 0.36, palette.dark, 0.26, 0.72, 0, 5);
    this.addCone(g, 0.16, 0.36, palette.dark, -0.26, 0.72, 0, 5);
    if (key === "elektrik") this.addCone(g, 0.1, 0.5, palette.light, 0, 0.86, -0.16, 4, { emissive: palette.light, emissiveIntensity: 0.4 });
    if (key === "alev") this.addCone(g, 0.16, 0.55, palette.light, 0.05, 0.84, -0.18, 7, { emissive: palette.light, emissiveIntensity: 0.35 });
    if (key === "su") this.addSphere(g, 0.13, palette.light, 0, 0.78, -0.17, { transparent: true, opacity: 0.8 });
    if (key === "kaya") this.addSphere(g, 0.16, palette.dark, 0, 0.8, -0.16);
    if (key === "yaprak") this.addCube(g, 0.32, 0.07, 0.16, palette.light, 0, 0.82, -0.12);
    if (key === "golge") this.addSphere(g, 0.12, palette.dark, 0.02, 0.82, -0.16, { emissive: palette.light, emissiveIntensity: 0.25 });
    if (key === "isik") this.addSphere(g, 0.12, palette.light, 0, 0.82, -0.16, { emissive: palette.light, emissiveIntensity: 0.45 });
    g.userData.element = key;
    return g;
  };

  World3DView.prototype.artStatusKey = function () {
    if (!L.ArtPack || !L.ArtPack.status) return "fallback";
    var status = L.ArtPack.status();
    return [status.characters ? 1 : 0, status.lumas ? 1 : 0, status.buildings ? 1 : 0].join("");
  };

  World3DView.prototype.makePaperSprite = function (width, height) {
    var material = new this.THREE.SpriteMaterial({ color: 0xffffff, transparent: true, alphaTest: 0.08, depthWrite: false });
    var sprite = new this.THREE.Sprite(material);
    sprite.scale.set(width, height, 1);
    sprite.userData.paperSprite = true;
    sprite.userData.paperWidth = width;
    sprite.userData.paperHeight = height;
    return sprite;
  };

  World3DView.prototype.spriteTexture = function (key, width, height, draw) {
    var cacheKey = key + "|" + this.artStatusKey();
    if (this.spriteTextures[cacheKey]) return this.spriteTextures[cacheKey];
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
    var texture = new this.THREE.CanvasTexture(canvas);
    texture.magFilter = this.THREE.NearestFilter;
    texture.minFilter = this.THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    this.spriteTextures[cacheKey] = texture;
    return texture;
  };

  World3DView.prototype.setSpriteTexture = function (sprite, texture) {
    if (!sprite || !sprite.material || !texture) return;
    if (sprite.material.map === texture) return;
    sprite.material.map = texture;
    sprite.material.needsUpdate = true;
  };

  World3DView.prototype.playerSpriteTexture = function (game) {
    var avatar = game.state && game.state.avatar || {};
    var outfit = avatar.outfit || "guardian";
    var dir = game.player && game.player.dir || "down";
    var moving = !!(game.player && game.player.moving);
    var running = !!(game.player && game.player.running);
    var frame = moving ? Math.floor((game.time || 0) * (running ? 11 : 8)) % 4 : 0;
    var key = ["player", outfit, dir, moving ? 1 : 0, running ? 1 : 0, frame].join(":");
    return this.spriteTexture(key, 64, 72, function (ctx) {
      if (L.Asset && L.Asset.drawPlayer) L.Asset.drawPlayer(ctx, 25, 38, dir, moving, running, game.time || 0, avatar);
    });
  };

  World3DView.prototype.npcSpriteTexture = function (npc, time, index) {
    var key = ["npc", npc && (npc.id || npc.name || npc.sprite || npc.type) || index, npc && (npc.sprite || npc.type) || "person", Math.floor((time || 0) * 3) % 3].join(":");
    return this.spriteTexture(key, 64, 72, function (ctx) {
      if (L.Asset && L.Asset.drawNpc) L.Asset.drawNpc(ctx, npc, 25, 38, time || 0);
    });
  };

  World3DView.prototype.remoteSpriteTexture = function (remote, time) {
    var key = ["remote", remote && (remote.id || remote.name) || "player", remote && remote.dir || "down", Math.floor((time || 0) * 3) % 3].join(":");
    return this.spriteTexture(key, 96, 80, function (ctx) {
      if (L.Asset && L.Asset.drawRemotePlayer) L.Asset.drawRemotePlayer(ctx, remote, 40, 44, time || 0);
    });
  };

  World3DView.prototype.creatureSpriteTexture = function (creature, time, index) {
    var id = creature && (creature.id || creature.creatureId) || "unknown";
    var shiny = creature && creature.shiny ? 1 : 0;
    var key = ["luma", id, shiny, Math.floor((time || 0) * 3 + (index || 0)) % 4].join(":");
    return this.spriteTexture(key, 72, 72, function (ctx) {
      if (L.Asset && L.Asset.drawCreature) L.Asset.drawCreature(ctx, creature, 14, 13, 1.28, false, time || 0);
    });
  };

  World3DView.prototype.placeTileSprite = function (actor, map, x, y, bob) {
    actor.position.set(worldX(map, x) + 0.5, (actor.userData.paperHeight || 1.1) * 0.52 + (bob || 0), worldZ(map, y) + 0.5);
  };

  World3DView.prototype.placePointSprite = function (actor, map, tileX, tileY, bob) {
    actor.position.set(worldX(map, tileX), (actor.userData.paperHeight || 1.1) * 0.52 + (bob || 0), worldZ(map, tileY));
  };
  World3DView.prototype.ensureActor = function (key, factory) {
    var actor = this.actorCache[key];
    if (!actor) {
      actor = factory.call(this);
      this.actorCache[key] = actor;
      this.actorRoot.add(actor);
    }
    actor.userData.live = true;
    return actor;
  };

  World3DView.prototype.markActorsDead = function () {
    Object.keys(this.actorCache).forEach(function (key) {
      this.actorCache[key].userData.live = false;
    }, this);
  };

  World3DView.prototype.pruneActors = function () {
    Object.keys(this.actorCache).forEach(function (key) {
      var actor = this.actorCache[key];
      if (actor.userData.live) return;
      this.actorRoot.remove(actor);
      delete this.actorCache[key];
    }, this);
  };

  World3DView.prototype.setActorTile = function (actor, map, x, y, dir, bob) {
    if (actor.userData && actor.userData.paperSprite) {
      this.placeTileSprite(actor, map, x, y, bob);
      return;
    }
    actor.position.set(worldX(map, x) + 0.5, bob || 0.18, worldZ(map, y) + 0.5);
    actor.rotation.y = directionAngle(dir);
  };

  World3DView.prototype.syncActors = function (game) {
    var map = game.map;
    if (!map) return;
    this.markActorsDead();

    var player = this.ensureActor("player", function () {
      return this.makePaperSprite(0.95, 1.35);
    });
    this.setSpriteTexture(player, this.playerSpriteTexture(game));
    var playerTileX = (game.player.x + game.player.w / 2) / TILE;
    var playerTileY = (game.player.y + game.player.h) / TILE;
    this.placePointSprite(player, map, playerTileX, playerTileY, Math.sin(game.time * 10) * 0.015);

    (game.npcs.current || []).forEach(function (npc, index) {
      var isSign = npc.type === "sign" || npc.sprite === "sign";
      var actor = this.ensureActor("npc:" + (npc.id || index), function () {
        if (isSign) return this.makeSign({ w: 2, h: 2 }, 1, 1);
        return this.makePaperSprite(0.95, 1.35);
      });
      if (isSign) {
        this.setActorTile(actor, map, npc.x, npc.y, npc.dir, 0.18);
      } else {
        this.setSpriteTexture(actor, this.npcSpriteTexture(npc, game.time, index));
        this.placeTileSprite(actor, map, npc.x, npc.y, Math.sin(game.time * 3 + index) * 0.008);
      }
    }, this);

    if (game.roamers && game.roamers.current) {
      game.roamers.current.forEach(function (roamer, index) {
        var base = baseForCreature(roamer.creatureId) || { id: roamer.creatureId };
        var actor = this.ensureActor("roamer:" + index + ":" + roamer.creatureId, function () {
          return this.makePaperSprite(0.9, 0.9);
        });
        this.setSpriteTexture(actor, this.creatureSpriteTexture(base, game.time, index));
        this.placePointSprite(actor, map, roamer.x / TILE, roamer.y / TILE, Math.sin(game.time * 5 + index) * 0.035);
      }, this);
    }

    if (game.followerCreature && game.follower) {
      var followerCreature = game.followerCreature();
      if (followerCreature) {
        var follower = this.ensureActor("follower:" + followerCreature.id, function () {
          return this.makePaperSprite(0.74, 0.74);
        });
        this.setSpriteTexture(follower, this.creatureSpriteTexture(followerCreature, game.time, 11));
        this.placePointSprite(follower, map, game.follower.x / TILE, game.follower.y / TILE, Math.sin(game.time * 7) * 0.025);
      }
    }

    if (game.multiplayer && game.multiplayer.sameMapPlayers) {
      game.multiplayer.sameMapPlayers(map.id).forEach(function (remote, index) {
        var actor = this.ensureActor("remote:" + remote.id, function () {
          return this.makePaperSprite(1.08, 1.38);
        });
        this.setSpriteTexture(actor, this.remoteSpriteTexture(remote, game.time));
        this.placePointSprite(actor, map, remote.x / TILE, remote.y / TILE, Math.sin(game.time * 5 + index) * 0.015);
      }, this);
    }

    this.pruneActors();
  };
  World3DView.prototype.updateCamera = function (game) {
    var map = game.map;
    var tx = (game.player.x + game.player.w / 2) / TILE - map.w / 2;
    var tz = (game.player.y + game.player.h / 2) / TILE - map.h / 2;
    var desired = {
      x: tx,
      y: 7.8,
      z: tz + 9.6
    };
    var lerp = 0.12;
    this.camera.position.x += (desired.x - this.camera.position.x) * lerp;
    this.camera.position.y += (desired.y - this.camera.position.y) * lerp;
    this.camera.position.z += (desired.z - this.camera.position.z) * lerp;
    this.camera.lookAt(tx, 0.65, tz - 2.25);
  };

  World3DView.prototype.animateWater = function (game) {
    this.mapRoot.children.forEach(function (child) {
      if (!child.isInstancedMesh) return;
      var code = child.userData && child.userData.tileCode;
      if (code !== "water" && code !== "lava") return;
      child.position.y = Math.sin(game.time * 2.2) * 0.035;
    });
  };

  World3DView.prototype.render = function (game) {
    if (!this.ready || !this.renderer || !this.scene || !game.map) return;
    this.resize();
    var hidden = game.mode === "battle";
    this.canvas.style.opacity = hidden ? "0" : "1";
    if (hidden) return;
    var key = game.map.id + "|" + game.map.w + "|" + game.map.h + "|" + game.map.ground.length + "|" + game.map.decoration.length + "|" + this.textureVersion;
    if (key !== this.mapKey) this.build(game.map);
    this.syncActors(game);
    this.updateCamera(game);
    this.animateWater(game);
    if (this.skyDome) this.skyDome.position.copy(this.camera.position);
    this.renderer.render(this.scene, this.camera);
  };

  function ensureWorld3D(game) {
    if (game.world3d || game.__world3dLoading) return;
    game.__world3dLoading = true;
    loadThree(function (THREE) {
      game.__world3dLoading = false;
      if (!game.world3d) game.world3d = new World3DView(game, THREE);
    });
  }

  var originalRender = L.Game.prototype.render;
  L.Game.prototype.render = function () {
    originalRender.apply(this, arguments);
    ensureWorld3D(this);
    if (this.world3d) this.world3d.render(this);
  };
})();
