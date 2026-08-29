(function () {
  var L = window.LUMA = window.LUMA || {};
  if (!L.Battle) return;

  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";

  var biomeConfig = {
    meadow: { sky: 0x8fd8f2, fog: 0x8fd8f2, ground: 0x62b85d, path: 0xc9a661, accent: 0x75d66a, deco: "tree" },
    lake: { sky: 0x8de6ff, fog: 0xa3efff, ground: 0x55bed8, path: 0xd8c17c, accent: 0x71e5ff, deco: "water" },
    cave: { sky: 0x283040, fog: 0x222836, ground: 0x525b65, path: 0x8e7a62, accent: 0x9aa4ad, deco: "rock" },
    city: { sky: 0x9ab0c4, fog: 0xaec4d8, ground: 0x8d98a5, path: 0xd4bb78, accent: 0xffd86a, deco: "lamp" },
    forest: { sky: 0x263d49, fog: 0x203344, ground: 0x315a3f, path: 0x6c4c68, accent: 0x9dd467, deco: "tree" },
    lava: { sky: 0x6a2630, fog: 0x341725, ground: 0x74312b, path: 0x372231, accent: 0xff7142, deco: "lava" },
    snow: { sky: 0xcde8f5, fog: 0xdff7ff, ground: 0xbad4e2, path: 0xf0f5ef, accent: 0x7db5d8, deco: "crystal" },
    factory: { sky: 0x647484, fog: 0x475667, ground: 0x5c6672, path: 0x303a49, accent: 0xe6bb4d, deco: "gear" },
    harbor: { sky: 0x74d3e5, fog: 0x99e6f2, ground: 0x449bb7, path: 0xb98552, accent: 0xf1d38c, deco: "water" },
    ruins: { sky: 0x857c70, fog: 0x756e64, ground: 0x6d665d, path: 0xc0a46d, accent: 0x76d0bd, deco: "rock" },
    garden: { sky: 0xa1e3d4, fog: 0xb9efe1, ground: 0x68b85f, path: 0xd2b96e, accent: 0xde83c9, deco: "flower" },
    sky: { sky: 0x88dff5, fog: 0xbdf5ff, ground: 0x77abd8, path: 0xf2dda2, accent: 0xffffff, deco: "cloud" }
  };

  var elementPalette = {
    alev: { main: 0xd85a32, dark: 0x7a2e2d, light: 0xffc45a, glow: 0xff6a2f },
    su: { main: 0x45aee0, dark: 0x226b9c, light: 0xa5ecff, glow: 0x58d6ff },
    yaprak: { main: 0x64bc55, dark: 0x2f6b38, light: 0xb7f070, glow: 0x82e66a },
    kaya: { main: 0x9a8368, dark: 0x544737, light: 0xd3c19b, glow: 0xd6b37b },
    elektrik: { main: 0xf0c735, dark: 0x59451e, light: 0xffee77, glow: 0xffdf4c },
    normal: { main: 0xc9bfae, dark: 0x676052, light: 0xf0e8d4, glow: 0xe8dcc6 },
    ruzgar: { main: 0x72d6d1, dark: 0x2f6d75, light: 0xc7ffff, glow: 0x9af7ef },
    golge: { main: 0x7a5bb5, dark: 0x30244d, light: 0xc69aff, glow: 0xa978ff },
    isik: { main: 0xf2d76a, dark: 0x776037, light: 0xfff6b2, glow: 0xffec91 }
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

  function getElement(creature) {
    var key = normalize(creature && creature.element);
    if (key === "isik") return "isik";
    if (key === "golge") return "golge";
    if (key === "ruzgar") return "ruzgar";
    return elementPalette[key] ? key : "normal";
  }

  function getBiome(battle) {
    var key = battle && battle.currentBiome || "meadow";
    return biomeConfig[key] ? key : "meadow";
  }

  function creatureKey(creature, enemy) {
    if (!creature) return "empty";
    return [creature.id, creature.displayName, creature.element, creature.level, creature.hp, creature.maxHp, enemy ? 1 : 0].join("|");
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
      console.warn("Three.js battle renderer could not load.", error);
    });
  }

  function setupRenderer(renderer, THREE) {
    renderer.setPixelRatio(Math.min(1.45, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap || THREE.PCFShadowMap;
    }
    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    if ("outputEncoding" in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    if ("toneMapping" in renderer && THREE.ACESFilmicToneMapping) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    }
  }

  function mat(THREE, color, emissive, opacity) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.72,
      metalness: 0.03,
      emissive: emissive || 0x000000,
      emissiveIntensity: emissive ? 0.24 : 0,
      transparent: opacity < 1,
      opacity: opacity == null ? 1 : opacity,
      flatShading: true
    });
  }

  function basic(THREE, color, opacity) {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: opacity < 1,
      opacity: opacity == null ? 1 : opacity,
      depthWrite: opacity == null || opacity >= 1
    });
  }

  function addMesh(view, parent, geometry, material, x, y, z, cast) {
    var mesh = new view.THREE.Mesh(geometry, material);
    mesh.position.set(x || 0, y || 0, z || 0);
    mesh.castShadow = cast !== false;
    mesh.receiveShadow = true;
    parent.add(mesh);
    view.meshes.push(mesh);
    return mesh;
  }

  function setScale(mesh, x, y, z) {
    mesh.scale.set(x, y, z);
    return mesh;
  }

  function VoxelBattleView(battle, THREE) {
    this.battle = battle;
    this.THREE = THREE;
    this.meshes = [];
    this.materials = [];
    this.geometries = [];
    this.playerKey = "";
    this.enemyKey = "";
    this.disposed = false;
    this.ready = false;
    this.frame = 0;
  }

  VoxelBattleView.prototype.ownMat = function (material) {
    this.materials.push(material);
    return material;
  };

  VoxelBattleView.prototype.ownGeo = function (geometry) {
    this.geometries.push(geometry);
    return geometry;
  };

  VoxelBattleView.prototype.init = function () {
    if (!this.battle || !this.battle.screen) return false;
    var THREE = this.THREE;
    try {
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      return false;
    }

    setupRenderer(this.renderer, THREE);
    this.renderer.domElement.className = "three-battle-layer three-battle-real";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer.domElement.style.pointerEvents = "none";
    this.battle.screen.insertBefore(this.renderer.domElement, this.battle.screen.firstChild);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 80);
    this.camera.position.set(0, 5.8, 12.5);
    this.camera.lookAt(0, 1.25, 0);

    this.world = new THREE.Group();
    this.actors = new THREE.Group();
    this.fx = new THREE.Group();
    this.scene.add(this.world, this.actors, this.fx);

    this.buildLights();
    this.buildWorld();
    this.refreshModels(true);
    this.resize();
    this.resizeBound = this.resize.bind(this);
    window.addEventListener("resize", this.resizeBound);
    this.battle.screen.classList.add("three-battle-ready", "three-battle-real-ready");
    this.ready = true;
    window.PIXELMANIA_BATTLE_3D_READY = true;
    return true;
  };

  VoxelBattleView.prototype.buildLights = function () {
    var THREE = this.THREE;
    this.scene.add(new THREE.HemisphereLight(0xdff7ff, 0x24351f, 1.65));
    var sun = new THREE.DirectionalLight(0xffedbd, 2.9);
    sun.position.set(-5, 9, 7);
    sun.castShadow = true;
    if (sun.shadow) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -8;
      sun.shadow.camera.right = 8;
      sun.shadow.camera.top = 8;
      sun.shadow.camera.bottom = -8;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 28;
    }
    this.sun = sun;
    this.scene.add(sun);
  };

  VoxelBattleView.prototype.buildWorld = function () {
    var THREE = this.THREE;
    var biome = getBiome(this.battle);
    var cfg = biomeConfig[biome];
    this.biome = biome;
    this.scene.background = new THREE.Color(cfg.sky);
    this.scene.fog = new THREE.Fog(cfg.fog, 13, 32);

    var floorMat = this.ownMat(mat(THREE, cfg.ground));
    var pathMat = this.ownMat(mat(THREE, cfg.path));
    var accentMat = this.ownMat(mat(THREE, cfg.accent, cfg.deco === "lava" ? cfg.accent : 0x000000));
    var darkMat = this.ownMat(mat(THREE, 0x172033));
    var floorGeo = this.ownGeo(new THREE.BoxGeometry(15.8, 0.28, 8.8));
    var pathGeo = this.ownGeo(new THREE.BoxGeometry(5.4, 0.05, 1.2));
    var hillGeo = this.ownGeo(new THREE.ConeGeometry(1, 1.8, 4));

    addMesh(this, this.world, floorGeo, floorMat, 0, -0.18, 0, false);
    setScale(addMesh(this, this.world, pathGeo, pathMat, -3.5, 0.02, 1.18, false), 1.2, 1, 1.05);
    setScale(addMesh(this, this.world, pathGeo, pathMat, 3.55, 0.02, -1.18, false), 1, 1, 0.92);
    setScale(addMesh(this, this.world, pathGeo, darkMat, 0, -0.01, 3.92, false), 3, 1, 0.18);

    for (var h = 0; h < 9; h += 1) {
      var hill = addMesh(this, this.world, hillGeo, this.ownMat(mat(THREE, cfg.accent, 0x000000, 0.42)), -7 + h * 1.8, 1.2, -5.15, false);
      hill.rotation.y = Math.PI / 4;
      hill.scale.set(1.5 + (h % 3) * 0.35, 1.1 + (h % 2) * 0.35, 0.48);
    }

    this.buildDecor(cfg);
    this.buildRings(cfg);
  };

  VoxelBattleView.prototype.buildDecor = function (cfg) {
    var THREE = this.THREE;
    var trunk = this.ownMat(mat(THREE, 0x7b5838));
    var leaf = this.ownMat(mat(THREE, cfg.accent));
    var rock = this.ownMat(mat(THREE, 0x6c6570));
    var glow = this.ownMat(mat(THREE, cfg.accent, cfg.accent));
    var stemGeo = this.ownGeo(new THREE.BoxGeometry(0.18, 0.68, 0.18));
    var cubeGeo = this.ownGeo(new THREE.BoxGeometry(0.46, 0.46, 0.46));
    var coneGeo = this.ownGeo(new THREE.ConeGeometry(0.36, 0.84, 5));
    var cylGeo = this.ownGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 24));

    var spots = [
      [-6.4, 0, -2.8], [-5.5, 0, 2.9], [-2.1, 0, -3.4], [0.4, 0, -3.75],
      [2.0, 0, 2.8], [5.8, 0, 2.35], [6.5, 0, -2.4], [0.0, 0, 3.35]
    ];

    for (var i = 0; i < spots.length; i += 1) {
      var x = spots[i][0];
      var z = spots[i][2];
      if (cfg.deco === "tree" || cfg.deco === "flower") {
        addMesh(this, this.world, stemGeo, trunk, x, 0.32, z, true);
        var crown = addMesh(this, this.world, coneGeo, leaf, x, 0.95, z, true);
        crown.rotation.y = i * 0.7;
        if (cfg.deco === "flower") setScale(crown, 0.8, 0.8, 0.8);
      } else if (cfg.deco === "water") {
        var pool = addMesh(this, this.world, cylGeo, glow, x, 0.04, z, false);
        pool.scale.set(1.45, 1, 0.85);
      } else if (cfg.deco === "lava") {
        var lava = addMesh(this, this.world, cylGeo, glow, x, 0.05, z, false);
        lava.scale.set(1.25, 1, 0.72);
      } else if (cfg.deco === "lamp") {
        addMesh(this, this.world, stemGeo, rock, x, 0.45, z, true);
        setScale(addMesh(this, this.world, cubeGeo, glow, x, 0.93, z, false), 0.45, 0.35, 0.45);
      } else if (cfg.deco === "crystal") {
        var crystal = addMesh(this, this.world, coneGeo, glow, x, 0.6, z, true);
        crystal.rotation.z = 0.2;
      } else if (cfg.deco === "gear") {
        var gear = addMesh(this, this.world, cubeGeo, rock, x, 0.22, z, true);
        gear.rotation.y = i * 0.6;
        gear.scale.set(0.8, 0.3, 0.8);
      } else {
        setScale(addMesh(this, this.world, cubeGeo, rock, x, 0.22, z, true), 0.9, 0.5, 0.7);
      }
    }
  };

  VoxelBattleView.prototype.buildRings = function (cfg) {
    var THREE = this.THREE;
    var ringGeo = this.ownGeo(new THREE.TorusGeometry(1.62, 0.035, 8, 60));
    var ringMat = this.ownMat(basic(THREE, cfg.accent, 0.42));
    this.playerRing = addMesh(this, this.world, ringGeo, ringMat, -3.6, 0.09, 1.15, false);
    this.enemyRing = addMesh(this, this.world, ringGeo, ringMat.clone(), 3.55, 0.1, -1.1, false);
    this.materials.push(this.enemyRing.material);
    this.playerRing.rotation.x = Math.PI / 2;
    this.enemyRing.rotation.x = Math.PI / 2;
    this.enemyRing.scale.set(0.92, 0.92, 0.92);
  };

  VoxelBattleView.prototype.refreshModels = function (force) {
    var player = this.battle.playerCreature ? this.battle.playerCreature() : null;
    var enemy = this.battle.enemy;
    var boss = !!(this.battle.trainer && (this.battle.trainer.boss || this.battle.trainer.giant || this.battle.trainer.storyBossId));
    var playerKey = creatureKey(player, false);
    var enemyKey = creatureKey(enemy, true) + "|" + boss;

    if (force || playerKey !== this.playerKey) {
      this.playerKey = playerKey;
      if (this.playerModel) this.actors.remove(this.playerModel);
      this.playerModel = this.makeCreature(player, false, false);
      this.playerModel.position.set(-3.6, 0.03, 1.15);
      this.playerModel.rotation.y = -0.32;
      this.actors.add(this.playerModel);
    }

    if (force || enemyKey !== this.enemyKey) {
      this.enemyKey = enemyKey;
      if (this.enemyModel) this.actors.remove(this.enemyModel);
      this.enemyModel = this.makeCreature(enemy, true, boss);
      this.enemyModel.position.set(3.55, 0.04, -1.08);
      this.enemyModel.rotation.y = Math.PI + 0.34;
      this.actors.add(this.enemyModel);
    }
  };

  VoxelBattleView.prototype.makeCreature = function (creature, enemy, boss) {
    var THREE = this.THREE;
    var key = getElement(creature);
    var palette = elementPalette[key] || elementPalette.normal;
    var g = new THREE.Group();
    var main = this.ownMat(mat(THREE, palette.main, key === "alev" || key === "elektrik" || key === "isik" ? palette.glow : 0x000000));
    var dark = this.ownMat(mat(THREE, palette.dark));
    var light = this.ownMat(mat(THREE, palette.light, key === "isik" ? palette.glow : 0x000000));
    var black = this.ownMat(mat(THREE, 0x101521));
    var white = this.ownMat(mat(THREE, 0xfff7de));
    var boxBody = this.ownGeo(new THREE.BoxGeometry(1.18, 0.85, 1.05));
    var boxHead = this.ownGeo(new THREE.BoxGeometry(0.86, 0.72, 0.78));
    var boxLeg = this.ownGeo(new THREE.BoxGeometry(0.25, 0.48, 0.28));
    var boxSmall = this.ownGeo(new THREE.BoxGeometry(0.18, 0.18, 0.12));
    var cone = this.ownGeo(new THREE.ConeGeometry(0.24, 0.7, 4));
    var tailGeo = this.ownGeo(new THREE.BoxGeometry(0.22, 0.22, 0.78));

    addMesh(this, g, boxBody, main, 0, 0.82, 0, true);
    addMesh(this, g, boxHead, main, 0, 1.48, 0.2, true);
    addMesh(this, g, boxLeg, dark, -0.38, 0.28, 0.34, true);
    addMesh(this, g, boxLeg, dark, 0.38, 0.28, 0.34, true);
    addMesh(this, g, boxLeg, dark, -0.38, 0.28, -0.32, true);
    addMesh(this, g, boxLeg, dark, 0.38, 0.28, -0.32, true);
    addMesh(this, g, boxSmall, white, -0.18, 1.55, 0.61, false);
    addMesh(this, g, boxSmall, white, 0.18, 1.55, 0.61, false);
    setScale(addMesh(this, g, boxSmall, black, -0.18, 1.55, 0.68, false), 0.55, 0.7, 0.7);
    setScale(addMesh(this, g, boxSmall, black, 0.18, 1.55, 0.68, false), 0.55, 0.7, 0.7);

    var tail = addMesh(this, g, tailGeo, dark, 0, 0.95, -0.72, true);
    tail.rotation.x = -0.35;

    if (key === "alev") {
      this.addFlame(g, -0.25, 2.02, 0.17, palette);
      this.addFlame(g, 0.25, 2.02, 0.17, palette);
      this.addFlame(g, 0, 1.08, -1.18, palette);
    } else if (key === "su") {
      setScale(addMesh(this, g, new THREE.SphereGeometry(0.28, 14, 8), light, -0.55, 1.2, 0.0, true), 0.55, 1.0, 0.18);
      setScale(addMesh(this, g, new THREE.SphereGeometry(0.28, 14, 8), light, 0.55, 1.2, 0.0, true), 0.55, 1.0, 0.18);
    } else if (key === "yaprak") {
      var leafA = addMesh(this, g, cone, light, -0.28, 2.05, 0.1, true);
      var leafB = addMesh(this, g, cone, light, 0.28, 2.05, 0.1, true);
      leafA.rotation.z = 0.38;
      leafB.rotation.z = -0.38;
    } else if (key === "elektrik") {
      this.addBolt(g, -0.34, 2.0, 0.1, palette);
      this.addBolt(g, 0.34, 2.0, 0.1, palette);
    } else if (key === "kaya") {
      var spike = addMesh(this, g, cone, light, 0, 2.02, 0.05, true);
      spike.rotation.z = Math.PI;
      setScale(spike, 1.2, 1.1, 1.2);
    } else if (key === "ruzgar") {
      var wingA = addMesh(this, g, new THREE.BoxGeometry(0.18, 0.62, 0.9), light, -0.72, 1.08, -0.05, true);
      var wingB = addMesh(this, g, new THREE.BoxGeometry(0.18, 0.62, 0.9), light, 0.72, 1.08, -0.05, true);
      wingA.rotation.z = 0.25;
      wingB.rotation.z = -0.25;
    } else if (key === "golge") {
      var hornA = addMesh(this, g, cone, dark, -0.3, 2.0, 0.18, true);
      var hornB = addMesh(this, g, cone, dark, 0.3, 2.0, 0.18, true);
      hornA.rotation.z = 0.5;
      hornB.rotation.z = -0.5;
    } else if (key === "isik") {
      var halo = addMesh(this, g, new THREE.TorusGeometry(0.42, 0.04, 8, 32), light, 0, 2.2, 0.05, false);
      halo.rotation.x = Math.PI / 2;
    } else {
      var earA = addMesh(this, g, cone, dark, -0.32, 1.98, 0.1, true);
      var earB = addMesh(this, g, cone, dark, 0.32, 1.98, 0.1, true);
      earA.rotation.z = 0.35;
      earB.rotation.z = -0.35;
    }

    var scale = boss ? 1.65 : enemy ? 1.2 : 1.35;
    g.scale.set(scale, scale, scale);
    g.userData.baseScale = scale;
    g.userData.element = key;
    return g;
  };

  VoxelBattleView.prototype.addFlame = function (parent, x, y, z, palette) {
    var THREE = this.THREE;
    var outer = this.ownMat(mat(THREE, palette.glow, palette.glow));
    var inner = this.ownMat(mat(THREE, palette.light, palette.light));
    var coneA = addMesh(this, parent, this.ownGeo(new THREE.ConeGeometry(0.18, 0.52, 6)), outer, x, y, z, true);
    coneA.rotation.z = 0.08;
    var coneB = addMesh(this, parent, this.ownGeo(new THREE.ConeGeometry(0.1, 0.36, 5)), inner, x, y + 0.04, z + 0.02, true);
    coneB.rotation.z = -0.1;
  };

  VoxelBattleView.prototype.addBolt = function (parent, x, y, z, palette) {
    var THREE = this.THREE;
    var boltMat = this.ownMat(mat(THREE, palette.light, palette.glow));
    var boltGeo = this.ownGeo(new THREE.BoxGeometry(0.14, 0.58, 0.14));
    var a = addMesh(this, parent, boltGeo, boltMat, x, y, z, true);
    var b = addMesh(this, parent, boltGeo, boltMat, x + (x < 0 ? -0.08 : 0.08), y - 0.36, z, true);
    a.rotation.z = x < 0 ? -0.42 : 0.42;
    b.rotation.z = x < 0 ? 0.35 : -0.35;
  };

  VoxelBattleView.prototype.resize = function () {
    if (!this.renderer || !this.battle || !this.battle.screen) return;
    var rect = this.battle.screen.getBoundingClientRect();
    var w = Math.max(1, Math.floor(rect.width));
    var h = Math.max(1, Math.floor(rect.height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  VoxelBattleView.prototype.start = function () {
    var self = this;
    function tick(now) {
      if (self.disposed) return;
      self.frame = window.requestAnimationFrame(tick);
      self.render((now || 0) / 1000);
    }
    this.frame = window.requestAnimationFrame(tick);
  };

  VoxelBattleView.prototype.render = function (time) {
    if (!this.ready || !this.battle || !this.battle.active || this.battle.screen.classList.contains("hidden")) {
      this.dispose();
      return;
    }

    this.refreshModels(false);
    this.resize();

    var playerHit = this.battle.flashSide === "player" ? 0.38 : 0;
    var enemyHit = this.battle.flashSide === "enemy" ? -0.38 : 0;
    if (this.playerModel) {
      this.playerModel.position.x = -3.6 + playerHit;
      this.playerModel.position.y = 0.05 + Math.sin(time * 2.4) * 0.08;
      this.playerModel.rotation.y = -0.34 + Math.sin(time * 1.15) * 0.08;
    }
    if (this.enemyModel) {
      var bossPulse = document.body.classList.contains("boss-battle") ? 1 + Math.sin(time * 3.1) * 0.05 : 1;
      var s = (this.enemyModel.userData.baseScale || 1.2) * bossPulse;
      this.enemyModel.scale.set(s, s, s);
      this.enemyModel.position.x = 3.55 + enemyHit;
      this.enemyModel.position.y = 0.05 + Math.sin(time * 2.0 + 1.4) * 0.07;
      this.enemyModel.rotation.y = Math.PI + 0.33 + Math.sin(time * 1.05) * 0.07;
    }

    this.playerRing.rotation.z += 0.01;
    this.enemyRing.rotation.z -= 0.012;
    this.world.rotation.y = Math.sin(time * 0.35) * 0.018;
    this.camera.position.x = Math.sin(time * 0.26) * 0.3;
    this.camera.lookAt(0, 1.15, 0);
    this.renderer.render(this.scene, this.camera);
  };

  VoxelBattleView.prototype.dispose = function () {
    if (this.disposed) return;
    this.disposed = true;
    if (this.frame) window.cancelAnimationFrame(this.frame);
    if (this.resizeBound) window.removeEventListener("resize", this.resizeBound);
    if (this.battle && this.battle.screen) this.battle.screen.classList.remove("three-battle-real-ready", "three-battle-ready");
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    for (var i = 0; i < this.materials.length; i += 1) {
      if (this.materials[i] && this.materials[i].dispose) this.materials[i].dispose();
    }
    for (var g = 0; g < this.geometries.length; g += 1) {
      if (this.geometries[g] && this.geometries[g].dispose) this.geometries[g].dispose();
    }
    if (this.renderer) this.renderer.dispose();
    if (this.battle && this.battle.realThreeBattleView === this) this.battle.realThreeBattleView = null;
  };

  function mountRealBattle(battle) {
    if (!battle || !battle.screen) return;
    if (battle.realThreeBattleView) battle.realThreeBattleView.dispose();
    if (battle.threeBattleView && battle.threeBattleView.dispose) battle.threeBattleView.dispose();
    loadThree(function (THREE) {
      if (!battle.active || battle.realThreeBattleView) return;
      var view = new VoxelBattleView(battle, THREE);
      if (view.init()) {
        battle.realThreeBattleView = view;
        view.start();
      }
    });
  }

  var originalStartCommon = L.Battle.prototype.startCommon;
  L.Battle.prototype.startCommon = function (message) {
    var result = originalStartCommon.call(this, message);
    mountRealBattle(this);
    return result;
  };

  var originalEnd = L.Battle.prototype.end;
  L.Battle.prototype.end = function () {
    if (this.realThreeBattleView) this.realThreeBattleView.dispose();
    return originalEnd.call(this);
  };
})();
