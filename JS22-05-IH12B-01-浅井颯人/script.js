    const RESTORE_DELAY_MS = 10000;
    const BOMB_EFFECT_REFERENCE_ZOOM = 13;

    function commonsImage(fileName, width = 1200) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
    }

    const touristSpots = [
      {
        id: "nagoya-castle",
        name: "名古屋城",
        category: "歴史",
        position: { lat: 35.185604, lng: 136.899686 },
        description: "金のしゃちほこで知られる名古屋の代表的な城です。天守や本丸御殿の装飾から、尾張徳川家の歴史と城下町の雰囲気を感じられます。",
        tags: ["本丸御殿", "金しゃち", "城郭"],
        image: commonsImage("180330 Nagoya Cstl Honmaru Goten.jpg"),
        additionalImages: [
          commonsImage("Nagoya Castle Keep Tower from Midland Square.JPG"),
          commonsImage("Nagoya Castle Aerial photograph 2020.jpg")
        ]
      },
      {
        id: "oasis21",
        name: "オアシス21",
        category: "夜景",
        position: { lat: 35.170639, lng: 136.909684 },
        description: "栄の中心にある立体型の公園施設です。水の宇宙船から見下ろす街並みやライトアップが人気で、買い物の休憩にも使いやすい場所です。",
        tags: ["栄", "ライトアップ", "展望"],
        image: commonsImage("Oasis 21 and Nagoya TV Tower.JPG"),
        additionalImages: [
          commonsImage("Honeys-Oasis21-Nagoya.jpg"),
          commonsImage("View of Oasis 21 from Nagoya TV Tower at night.jpg")
        ]
      },
      {
        id: "atsuta-jingu",
        name: "熱田神宮",
        category: "神社",
        position: { lat: 35.127066, lng: 136.908049 },
        description: "三種の神器のひとつ草薙神剣を祀ると伝わる神社です。木々に囲まれた境内は静かで、名古屋の歴史文化を落ち着いて味わえます。",
        tags: ["参拝", "森", "歴史文化"],
        image: commonsImage("Atsuta-jinguu shoumen.JPG"),
        additionalImages: [
          commonsImage("Atsuta shrine Saikan.jpg"),
          commonsImage("Atsuta-jingu Shrine Haiden, Jingu Atsuta Ward Nagoya 2023.jpg")
        ]
      },
      {
        id: "osu",
        name: "大須商店街",
        category: "食べ歩き",
        position: { lat: 35.158775, lng: 136.906551 },
        description: "古着、家電、サブカル、食べ歩きが混ざるにぎやかな商店街です。大須観音とあわせて散策すると、名古屋らしい雑多な魅力を楽しめます。",
        tags: ["大須観音", "グルメ", "買い物"],
        image: commonsImage("Main shopping street (Osu in Nagoya, Japan).jpg"),
        additionalImages: [
          commonsImage("Osu Shintenchi Street 2021-07 ac (1).jpg"),
          commonsImage("Osu Higashi Niomon Street shop 2021-07 ac (1).jpg")
        ]
      },
      {
        id: "toyota-museum",
        name: "トヨタ産業技術記念館",
        category: "学び",
        position: { lat: 35.182792, lng: 136.876396 },
        description: "繊維機械から自動車技術まで、トヨタのものづくりを実演展示で学べる博物館です。機械が動く展示が多く、授業の題材にも使いやすいスポットです。",
        tags: ["ものづくり", "博物館", "実演展示"],
        image: commonsImage("Toyota Commemorative Museum of Industry and Technology - 1.jpg"),
        additionalImages: [
          commonsImage("Toyota Commemorative Museum of Industry and Technology - 2.jpg"),
          commonsImage("Toyota Commemorative Museum of Industry and Technology - 3.jpg")
        ]
      }
    ];

    const bombTypes = {
      mini: {
        name: "小型ボム",
        label: "小",
        color: "#d96c2b",
        coreColor: "#fff0a8",
        projectileColor: "#ffe772",
        blastScale: 1.05,
        smokeCount: 14,
        sparkCount: 34,
        debrisCount: 24
      },
      firework: {
        name: "中型ボム",
        label: "中",
        color: "#c7354d",
        coreColor: "#ffcc57",
        projectileColor: "#ff94d6",
        blastScale: 1.35,
        smokeCount: 20,
        sparkCount: 48,
        debrisCount: 34
      },
      mega: {
        name: "大型ボム",
        label: "大",
        color: "#7a4fc2",
        coreColor: "#fff3c9",
        projectileColor: "#bfa7ff",
        blastScale: 1.75,
        smokeCount: 28,
        sparkCount: 68,
        debrisCount: 48
      },
      ultra: {
        name: "超大型ボム",
        label: "超",
        color: "#e53b2c",
        coreColor: "#fff8d6",
        projectileColor: "#ffef72",
        blastScale: 2.55,
        smokeCount: 36,
        sparkCount: 92,
        debrisCount: 66
      }
    };

    let map;
    let infoWindow;
    let bombEffectController;
    const spotMarkers = new Map();

    function initMap() {
      const nagoyaStation = { lat: 35.170915, lng: 136.881537 };

      map = new google.maps.Map(document.getElementById("map"), {
        center: nagoyaStation,
        zoom: 13,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT
        },
        streetViewControl: true,
        fullscreenControl: true
      });

      infoWindow = new google.maps.InfoWindow();
      bombEffectController = createBombEffectController(map);

      addTouristMarkers();
      renderSpotList();
      fitSpotsOnMap();

      map.addListener("click", (event) => {
        dropBomb(event.latLng);
      });
    }

    function addTouristMarkers() {
      touristSpots.forEach((spot) => {
        const marker = new google.maps.Marker({
          position: spot.position,
          map,
          title: spot.name
        });

        marker.addListener("click", () => {
          openSpotInfo(spot);
        });

        spotMarkers.set(spot.id, marker);
      });
    }

    function fitSpotsOnMap() {
      const bounds = new google.maps.LatLngBounds();
      touristSpots.forEach((spot) => bounds.extend(spot.position));
      map.fitBounds(bounds, 54);
    }

    function renderSpotList() {
      const spotList = document.getElementById("spot-list");
      spotList.innerHTML = touristSpots.map((spot) => `
        <li>
          <button class="spot-card" type="button" data-spot-id="${spot.id}" title="${spot.name}へ移動">
            <img src="${spot.image}" alt="${spot.name}のサムネイル" loading="lazy">
            <span>
              <strong>${spot.name}</strong>
              <span>${spot.category} / ${spot.tags.slice(0, 2).join("・")}</span>
            </span>
          </button>
        </li>
      `).join("");

      document.querySelectorAll(".spot-card").forEach((button) => {
        button.addEventListener("click", () => {
          const spot = touristSpots.find((item) => item.id === button.dataset.spotId);
          openSpotInfo(spot);
        });
      });

      if (window.jQuery) {
        $(".spot-card").tooltip();
      }
    }

    function openSpotInfo(spot) {
      if (!spot) {
        return;
      }

      const marker = spotMarkers.get(spot.id);
      map.panTo(spot.position);
      map.setZoom(Math.max(map.getZoom(), 15));
      infoWindow.setContent(createSpotInfoHtml(spot));
      infoWindow.open(map, marker);
    }

    function createSpotInfoHtml(spot) {
      const tags = spot.tags.map((tag) => `<span>${tag}</span>`).join("");
      const photos = spot.additionalImages.map((image, index) => `
        <img src="${image}" alt="${spot.name}の追加写真${index + 1}" loading="lazy">
      `).join("");

      return `
        <article class="info-window">
          <img class="info-main-photo" src="${spot.image}" alt="${spot.name}の写真">
          <div class="info-photo-grid">${photos}</div>
          <h2>${spot.name}</h2>
          <p>${spot.description}</p>
          <div class="info-tags">${tags}</div>
        </article>
      `;
    }

    function getSelectedBomb() {
      const selected = document.querySelector("input[name='bombType']:checked");
      return bombTypes[selected ? selected.value : "mini"];
    }

    function dropBomb(latLng) {
      const bomb = getSelectedBomb();

      if (!bombEffectController) {
        updateBombStatus("地図の描画準備中です。もう一度クリックしてください。");
        return;
      }

      bombEffectController.drop(latLng, bomb);
      updateBombStatus(`${bomb.name}を投下。爆発は画面固定ピクセルで表示し、${RESTORE_DELAY_MS / 1000}秒後に完全削除します。`);
    }

    function updateBombStatus(message) {
      document.getElementById("bomb-status").textContent = message;
    }

    function setupPanelToggle() {
      const body = document.body;
      const openButton = document.getElementById("panel-toggle");
      const closeButton = document.getElementById("panel-close");

      function setPanelOpen(isOpen) {
        body.classList.toggle("panel-closed", !isOpen);
        openButton.setAttribute("aria-expanded", String(isOpen));
        closeButton.setAttribute("aria-expanded", String(isOpen));
      }

      openButton.addEventListener("click", () => setPanelOpen(true));
      closeButton.addEventListener("click", () => setPanelOpen(false));
    }

    function createBombEffectController(targetMap) {
      const mapDiv = targetMap.getDiv();
      const activeEffects = new Set();
      let layer = null;
      let animationFrame = 0;

      const projector = new google.maps.OverlayView();
      projector.onAdd = function () {};
      projector.draw = scheduleUpdate;
      projector.onRemove = function () {};
      projector.setMap(targetMap);

      google.maps.event.addListener(targetMap, "bounds_changed", scheduleUpdate);
      google.maps.event.addListener(targetMap, "center_changed", scheduleUpdate);
      google.maps.event.addListener(targetMap, "zoom_changed", scheduleUpdate);
      google.maps.event.addListener(targetMap, "idle", scheduleUpdate);
      window.addEventListener("resize", scheduleUpdate);

      function scheduleUpdate() {
        if (animationFrame) {
          return;
        }

        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          updateAll();
        });
      }

      function pointFor(latLng) {
        const projection = projector.getProjection();
        if (!projection) {
          return null;
        }

        const point = projection.fromLatLngToContainerPixel(normalizeLatLng(latLng));
        const mapRect = mapDiv.getBoundingClientRect();

        return {
          x: mapRect.left + point.x,
          y: mapRect.top + point.y
        };
      }

      function updateEffect(effect) {
        const point = pointFor(effect.latLng);
        if (!point || !effect.element.isConnected) {
          return;
        }

        effect.element.style.left = `${point.x}px`;
        effect.element.style.top = `${point.y}px`;
        effect.element.style.setProperty("--map-zoom-scale", getMapZoomScale());
      }

      function getMapZoomScale() {
        const zoom = targetMap.getZoom();
        if (typeof zoom !== "number") {
          return 1;
        }

        return 2 ** (zoom - BOMB_EFFECT_REFERENCE_ZOOM);
      }

      function updateAll() {
        activeEffects.forEach(updateEffect);
      }

      function ensureLayer() {
        if (!layer || !layer.isConnected) {
          layer = document.createElement("div");
          layer.className = "bomb-effect-layer";
          layer.setAttribute("aria-hidden", "true");
          document.body.appendChild(layer);
        }

        return layer;
      }

      function cleanup(effect) {
        window.clearTimeout(effect.timerId);
        activeEffects.delete(effect);
        effect.element.remove();

        if (!activeEffects.size) {
          if (layer) {
            layer.remove();
            layer = null;
          }

          updateBombStatus("爆撃演出をすべて削除しました。もう一度クリックできます。");
        }
      }

      function drop(latLng, bomb) {
        const effect = {
          latLng: normalizeLatLng(latLng),
          element: createBombEffectElement(bomb),
          timerId: 0
        };

        ensureLayer().appendChild(effect.element);
        activeEffects.add(effect);
        updateEffect(effect);
        effect.element.getBoundingClientRect();
        effect.element.classList.add("is-live");

        effect.timerId = window.setTimeout(() => {
          cleanup(effect);
        }, RESTORE_DELAY_MS);

        return effect;
      }

      return {
        drop,
        updateAll,
        getActiveCount: () => activeEffects.size
      };
    }

    function createBombEffectElement(bomb) {
      const element = document.createElement("div");
      const blastScale = Number(bomb.blastScale) || 1;
      element.className = "blast-effect";
      element.dataset.bombEffect = "active";
      element.style.setProperty("--blast-color", bomb.color);
      element.style.setProperty("--blast-core", bomb.coreColor);
      element.style.setProperty("--projectile-color", bomb.projectileColor);
      setBombSizeProperties(element, blastScale);
      element.innerHTML = `
        <div class="bomb-projectile"><span>${bomb.label}</span></div>
        <div class="blast-visual">
          <div class="blast-scorch"></div>
          <div class="blast-heat-haze"></div>
          <div class="blast-flash"></div>
          <div class="blast-fireball"></div>
          <div class="blast-fireball-core"></div>
          <div class="blast-fireball-lobe lobe-one"></div>
          <div class="blast-fireball-lobe lobe-two"></div>
          <div class="blast-shockwave"></div>
          <div class="blast-shockwave shockwave-two"></div>
          <div class="blast-ground-wave"></div>
          <div class="smoke-layer">${createSmokePuffs(bomb.smokeCount, blastScale)}</div>
          <div class="spark-layer">${createSparkPieces(bomb.sparkCount, blastScale)}</div>
          <div class="debris-layer">${createDebrisPieces(bomb.debrisCount, blastScale)}</div>
        </div>
      `;
      return element;
    }

    function setBombSizeProperties(element, blastScale) {
      const sizeProperties = {
        "--flash-size": 360,
        "--haze-width": 380,
        "--haze-height": 300,
        "--fireball-width": 300,
        "--fireball-height": 260,
        "--shockwave-width": 520,
        "--shockwave-height": 205,
        "--ground-wave-width": 330,
        "--ground-wave-height": 54,
        "--scorch-width": 150,
        "--scorch-height": 82
      };

      Object.entries(sizeProperties).forEach(([property, value]) => {
        element.style.setProperty(property, `${Math.round(value * blastScale)}px`);
      });
    }

    function normalizeLatLng(latLng) {
      if (latLng && typeof latLng.lat === "function") {
        return latLng;
      }

      return new google.maps.LatLng(latLng.lat, latLng.lng);
    }

    function createSmokePuffs(count, blastScale) {
      return Array.from({ length: count }, (_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const ring = index % 3;
        const start = (18 + ring * 9) * blastScale;
        const travel = (62 + ring * 28) * blastScale;
        const sx = Math.round(Math.cos(angle) * start);
        const sy = Math.round(Math.sin(angle) * start);
        const dx = Math.round(Math.cos(angle) * travel + (index % 2 ? 16 : -12) * blastScale);
        const dy = Math.round(Math.sin(angle) * travel - (62 + ring * 13) * blastScale);
        const size = Math.round((38 + (index % 5) * 12) * blastScale);
        const delay = 760 + (index % 6) * 55;
        const duration = 1350 + (index % 4) * 180;
        const scale = (1.35 + (index % 4) * 0.18).toFixed(2);

        return `<div class="smoke-puff" style="--sx:${sx}px; --sy:${sy}px; --dx:${dx}px; --dy:${dy}px; --puff-size:${size}px; --delay:${delay}ms; --duration:${duration}ms; --scale:${scale};"></div>`;
      }).join("");
    }

    function createSparkPieces(count, blastScale) {
      return Array.from({ length: count }, (_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const distance = (88 + (index % 8) * 12) * blastScale;
        const dx = Math.round(Math.cos(angle) * distance);
        const dy = Math.round(Math.sin(angle) * distance);
        const length = Math.round((16 + (index % 5) * 5) * blastScale);
        const delay = 610 + (index % 9) * 18;
        const duration = 560 + (index % 6) * 52;
        const rotate = Math.round((angle * 180) / Math.PI);

        return `<div class="spark-piece" style="--dx:${dx}px; --dy:${dy}px; --spark-length:${length}px; --delay:${delay}ms; --duration:${duration}ms; --spark-rotate:${rotate}deg;"></div>`;
      }).join("");
    }

    function createDebrisPieces(count, blastScale) {
      const colors = ["#3a261b", "#6a3d22", "#d96c2b", "#f3b14a", "#221b17"];
      return Array.from({ length: count }, (_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const distance = (58 + (index % 7) * 17) * blastScale;
        const dx = Math.round(Math.cos(angle) * distance);
        const dy = Math.round(Math.sin(angle) * distance - (index % 3) * 16 * blastScale);
        const width = Math.round((5 + (index % 4) * 2) * blastScale);
        const height = Math.round((3 + (index % 3) * 2) * blastScale);
        const delay = 640 + (index % 8) * 30;
        const duration = 780 + (index % 5) * 85;
        const spinStart = index * 27;
        const spinEnd = spinStart + 280 + (index % 6) * 70;
        const color = colors[index % colors.length];

        return `<div class="debris-piece" style="--dx:${dx}px; --dy:${dy}px; --piece-width:${width}px; --piece-height:${height}px; --piece-color:${color}; --delay:${delay}ms; --duration:${duration}ms; --spin-start:${spinStart}deg; --spin-end:${spinEnd}deg;"></div>`;
      }).join("");
    }

    window.initMap = initMap;

    if (window.jQuery) {
      $(function () {
        setupPanelToggle();
        $("#tabs").tabs();
        $(".bomb-option input").checkboxradio({ icon: false });
      });
    } else {
      document.addEventListener("DOMContentLoaded", setupPanelToggle);
    }
