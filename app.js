(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const boot = document.getElementById("boot");
  const stage = document.getElementById("cakeStage");
  const wishButton = document.getElementById("wishButton");
  const wishToast = document.getElementById("wishToast");
  const confettiLayer = document.getElementById("confettiLayer");
  const soundToggle = document.getElementById("soundToggle");
  const soundLabel = soundToggle.querySelector(".sound-toggle__label");
  const playTape = document.getElementById("playTape");
  const playTapeLabel = document.getElementById("playTapeLabel");
  const equalizer = document.getElementById("equalizer");
  const pointerGlow = document.getElementById("pointerGlow");
  const scrollProgressBar = document.getElementById("scrollProgressBar");
  const opening = document.getElementById("opening");
  const startExperience = document.getElementById("startExperience");
  const fireworkLayer = document.getElementById("fireworkLayer");
  const cuteBurstLayer = document.getElementById("cuteBurstLayer");
  const openLetterLinks = [...document.querySelectorAll(".open-letter")];
  let experienceStarted = false;

  const dismissBoot = () => {
    window.setTimeout(() => {
      boot.classList.add("is-done");
    }, reducedMotion ? 100 : 1150);
  };

  if (document.readyState === "complete") {
    dismissBoot();
  } else {
    window.addEventListener("load", dismissBoot, { once: true });
    window.setTimeout(dismissBoot, 2800);
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointerGlow.style.opacity = "1";
    pointerGlow.style.left = `${event.clientX}px`;
    pointerGlow.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.addEventListener("pointerleave", () => {
    pointerGlow.style.opacity = "0";
  });

  const updateScrollProgress = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgressBar.style.width = `${Math.min(100, (window.scrollY / maxScroll) * 100)}%`;
  };
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();

  class GentleBed {
    constructor() {
      this.context = null;
      this.master = null;
      this.timer = null;
      this.step = 0;
      this.nextTime = 0;
      this.playing = false;
    }

    ensure() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0.0001;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === "suspended") this.context.resume();
      return true;
    }

    start() {
      if (this.playing || !this.ensure()) return;
      this.playing = true;
      this.step = 0;
      this.nextTime = this.context.currentTime + 0.08;
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), this.context.currentTime);
      this.master.gain.exponentialRampToValueAtTime(0.075, this.context.currentTime + 1.4);
      this.timer = window.setInterval(() => this.schedule(), 100);
    }

    pause() {
      if (!this.context || !this.playing) return;
      this.playing = false;
      window.clearInterval(this.timer);
      this.timer = null;
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.22);
    }

    schedule() {
      if (!this.playing) return;
      const stepDuration = 0.62;
      while (this.nextTime < this.context.currentTime + 0.25) {
        this.playStep(this.step, this.nextTime);
        this.nextTime += stepDuration;
        this.step += 1;
      }
    }

    playStep(step, time) {
      const chords = [
        [220, 277.18, 329.63, 392],
        [185, 220, 277.18, 329.63],
        [146.83, 185, 220, 277.18],
        [164.81, 207.65, 246.94, 329.63]
      ];
      const notePattern = [659.25, 554.37, 493.88, 440, 523.25, 659.25, 587.33, 493.88];
      if (step % 8 === 0) {
        const chord = chords[Math.floor(step / 8) % chords.length];
        chord.forEach((frequency, index) => {
          this.tone(frequency, time + index * 0.035, 4.8, index < 2 ? "triangle" : "sine", 0.011);
        });
      }
      if ([2, 5].includes(step % 8)) {
        const note = notePattern[Math.floor(step / 2) % notePattern.length];
        this.tone(note, time, 1.05, "sine", 0.018);
      }
    }

    tone(frequency, time, duration, type, volume) {
      const oscillator = this.context.createOscillator();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(volume, time + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.03);
    }
  }

  const ambientAudio = document.getElementById("ambientAudio");
  ambientAudio.volume = 0.26;
  const ambientBed = {
    start() {
      ambientAudio.play().then(syncAudioUI).catch((error) => {
        console.warn("Gentle background music could not start.", error);
      });
    },
    pause() {
      ambientAudio.pause();
      syncAudioUI();
    }
  };
  let heroFireworkTimer = null;
  const fireworkColors = ["#9dffd1", "#ff9fc5", "#87b7ff", "#d9ff9f", "#fff1c5", "#c7adff"];
  let fireworkSeed = 0;

  const launchFirework = (x, y, count = 36, power = 1) => {
    if (reducedMotion) return;
    const burst = document.createElement("div");
    const color = fireworkColors[fireworkSeed % fireworkColors.length];
    fireworkSeed += 1;
    burst.className = "firework-burst";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.setProperty("--burst-color", color);
    for (let index = 0; index < count; index += 1) {
      const spark = document.createElement("i");
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.24;
      const distance = (38 + Math.random() * 94) * power;
      spark.className = "firework-spark";
      spark.style.left = "0";
      spark.style.top = "0";
      spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * distance + 16}px`);
      spark.style.setProperty("--angle", `${Math.random() * 360}deg`);
      spark.style.setProperty("--duration", `${1.3 + Math.random() * 0.7}s`);
      spark.style.setProperty("--size", `${3 + Math.random() * 5}px`);
      burst.appendChild(spark);
    }
    fireworkLayer.appendChild(burst);
    window.setTimeout(() => burst.remove(), 1400);
  };

  const launchFireworkShow = (originX = window.innerWidth * 0.5, originY = window.innerHeight * 0.46) => {
    launchFirework(originX, originY, 52, 1.22);
    window.setTimeout(() => launchFirework(window.innerWidth * 0.24, window.innerHeight * 0.32, 34, 0.9), 180);
    window.setTimeout(() => launchFirework(window.innerWidth * 0.77, window.innerHeight * 0.3, 38, 1), 340);
  };

  const launchCuteBurst = () => {
    if (reducedMotion) return;
    const symbols = ["✦", "♡", "★", "❀", "🎀", "♬", "✧"];
    const colors = ["#ff9fc5", "#ff4f9a", "#87b7ff", "#d9ff9f", "#fff1c5", "#c7adff"];
    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;
    for (let index = 0; index < 64; index += 1) {
      const bit = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.56;
      const fromCenter = index < 38;
      bit.className = "cute-bit";
      bit.textContent = symbols[index % symbols.length];
      bit.style.left = `${fromCenter ? centerX : Math.random() * window.innerWidth}px`;
      bit.style.top = `${fromCenter ? centerY : Math.random() * window.innerHeight}px`;
      bit.style.setProperty("--dx", `${fromCenter ? Math.cos(angle) * distance : (Math.random() - 0.5) * 220}px`);
      bit.style.setProperty("--dy", `${fromCenter ? Math.sin(angle) * distance : 90 + Math.random() * 250}px`);
      bit.style.setProperty("--bit-color", colors[index % colors.length]);
      bit.style.setProperty("--bit-size", `${13 + Math.random() * 25}px`);
      bit.style.setProperty("--bit-scale", `${0.8 + Math.random() * 1.3}`);
      bit.style.setProperty("--bit-rotate", `${Math.random() * 540 - 270}deg`);
      bit.style.setProperty("--bit-duration", `${1 + Math.random() * 1.3}s`);
      cuteBurstLayer.appendChild(bit);
      window.setTimeout(() => bit.remove(), 2500);
    }
    launchFireworkShow(window.innerWidth * 0.5, window.innerHeight * 0.48);
  };

  const startHeroFireworks = () => {
    if (heroFireworkTimer || reducedMotion) return;
    heroFireworkTimer = window.setInterval(() => {
      if (window.scrollY > window.innerHeight * 0.84) return;
      const x = window.innerWidth * (0.18 + Math.random() * 0.66);
      const y = window.innerHeight * (0.18 + Math.random() * 0.38);
      launchFirework(x, y, 20 + Math.floor(Math.random() * 16), 0.58 + Math.random() * 0.28);
    }, 5200);
  };

  const beginExperience = (event) => {
    if (experienceStarted) return;
    experienceStarted = true;
    window.scrollTo(0, 0);
    opening.classList.add("is-lit");
    ambientBed.start();
    launchFireworkShow(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2);
    window.setTimeout(() => opening.classList.add("is-wishing"), reducedMotion ? 80 : 520);
    window.setTimeout(() => launchFirework(window.innerWidth * 0.16, window.innerHeight * 0.2, 26, 0.7), 1050);
    window.setTimeout(() => launchFirework(window.innerWidth * 0.84, window.innerHeight * 0.26, 30, 0.8), 1320);
    window.setTimeout(() => opening.classList.add("is-leaving"), reducedMotion ? 420 : 2850);
    window.setTimeout(() => {
      opening.hidden = true;
      document.body.classList.remove("is-loading", "intro-pending");
      startHeroFireworks();
      updateScrollProgress();
    }, reducedMotion ? 600 : 3700);
  };

  startExperience.addEventListener("click", beginExperience);

  document.getElementById("backToTop").addEventListener("click", () => {
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  });

  const makeConfetti = () => {
    if (reducedMotion) return;
    const colors = ["#ff9fc5", "#ff4f9a", "#87b7ff", "#d9ff9f", "#fff4d8", "#bda2ff"];
    for (let index = 0; index < 92; index += 1) {
      const bit = document.createElement("i");
      bit.className = "confetti";
      bit.style.left = `${Math.random() * 100}vw`;
      bit.style.background = colors[index % colors.length];
      bit.style.setProperty("--dur", `${2.7 + Math.random() * 2.8}s`);
      bit.style.setProperty("--delay", `${Math.random() * 0.8}s`);
      bit.style.setProperty("--x", `${(Math.random() - 0.5) * 240}px`);
      bit.style.setProperty("--rot", `${Math.random() * 1300 - 650}deg`);
      bit.style.width = `${4 + Math.random() * 5}px`;
      bit.style.height = `${7 + Math.random() * 9}px`;
      confettiLayer.appendChild(bit);
      window.setTimeout(() => bit.remove(), 6500);
    }
  };

  const showWish = () => {
    document.body.classList.add("wished");
    wishToast.classList.add("is-visible");
    makeConfetti();
    launchFireworkShow(window.innerWidth * 0.64, window.innerHeight * 0.38);
    window.setTimeout(() => wishToast.classList.remove("is-visible"), 4800);
    wishButton.querySelector(".button__text").textContent = "愿望已送达";
    if (window.birthdayCake && typeof window.birthdayCake.blowCandles === "function") {
      window.birthdayCake.blowCandles();
    }
  };

  wishButton.addEventListener("click", showWish, { once: true });

  openLetterLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      launchCuteBurst();
      window.setTimeout(() => {
        document.getElementById("letter").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }, reducedMotion ? 0 : 620);
    });
  });

  const artistPlayer = document.getElementById("artistPlayer");
  const activeTrackTitleNode = document.getElementById("activeTrackTitle");
  const trackProgress = document.getElementById("trackProgress");
  const trackTime = document.getElementById("trackTime");
  const trackChips = [...document.querySelectorAll(".track-chip")];
  const artistAudio = new Audio();
  artistAudio.preload = "none";
  artistAudio.loop = true;
  artistAudio.volume = 0.76;
  let activeTrackId = "2703882599";
  let activeTrackTitle = "Неправильно";
  let playerOpen = false;

  const syncAudioUI = () => {
    const artistPlaying = playerOpen && !artistAudio.paused;
    const bedPlaying = !ambientAudio.paused;
    const soundPlaying = artistPlaying || bedPlaying;
    soundToggle.setAttribute("aria-pressed", String(soundPlaying));
    soundLabel.textContent = artistPlaying ? "adLiN ON" : bedPlaying ? "BGM ON" : "SOUND OFF";
    soundToggle.setAttribute("aria-label", soundPlaying ? "暂时关闭全部音乐" : "继续播放背景音乐或歌曲");
    playTape.setAttribute("aria-pressed", String(artistPlaying));
    playTapeLabel.textContent = artistPlaying ? "PAUSE THE TRACK" : "PRESS PLAY, CERY7";
    artistPlayer.classList.toggle("is-playing", artistPlaying);
    equalizer.classList.toggle("is-playing", artistPlaying);
    equalizer.setAttribute("aria-label", artistPlaying ? "暂停阿德林热门 Phonk" : "播放阿德林热门 Phonk");
  };

  const setActiveTrack = (id, title) => {
    activeTrackId = id;
    activeTrackTitle = title;
    trackChips.forEach((chip) => {
      const selected = chip.dataset.trackId === id;
      chip.classList.toggle("is-active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    activeTrackTitleNode.textContent = title;
    trackProgress.style.width = "0%";
    trackTime.textContent = "00:00";
    artistAudio.src = `https://music.163.com/song/media/outer/url?id=${id}`;
    artistAudio.load();
  };

  const playCurrentTrack = async () => {
    ambientBed.pause();
    try {
      await artistAudio.play();
      syncAudioUI();
    } catch (error) {
      console.warn("The Adlin stream could not start.", error);
      artistPlayer.classList.remove("is-playing");
      if (experienceStarted) ambientBed.start();
    }
  };

  const openArtistPlayer = (scroll = true) => {
    const firstOpen = !playerOpen;
    artistPlayer.hidden = false;
    playerOpen = true;
    if (firstOpen) setActiveTrack(activeTrackId, activeTrackTitle);
    playCurrentTrack();
    if (scroll) {
      document.getElementById("frequency").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const toggleArtistPlayer = () => {
    if (!playerOpen) {
      openArtistPlayer();
      return;
    }
    if (artistAudio.paused) {
      playCurrentTrack();
    } else {
      artistAudio.pause();
      if (experienceStarted) ambientBed.start();
    }
  };

  soundToggle.addEventListener("click", () => {
    const anyPlaying = !ambientAudio.paused || (playerOpen && !artistAudio.paused);
    if (anyPlaying) {
      ambientAudio.pause();
      artistAudio.pause();
      syncAudioUI();
      return;
    }
    if (playerOpen) playCurrentTrack();
    else if (experienceStarted) ambientBed.start();
  });
  playTape.addEventListener("click", toggleArtistPlayer);
  equalizer.addEventListener("click", toggleArtistPlayer);
  trackChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setActiveTrack(chip.dataset.trackId, chip.dataset.trackTitle);
      playCurrentTrack();
    });
  });

  artistAudio.addEventListener("play", syncAudioUI);
  artistAudio.addEventListener("pause", syncAudioUI);
  artistAudio.addEventListener("ended", syncAudioUI);
  ambientAudio.addEventListener("play", syncAudioUI);
  ambientAudio.addEventListener("pause", syncAudioUI);
  artistAudio.addEventListener("error", () => {
    artistPlayer.classList.remove("is-playing");
    document.querySelector(".phonk__notice").textContent = "音乐加载失败，请使用下方正版歌曲链接。";
    if (experienceStarted) ambientBed.start();
  });
  artistAudio.addEventListener("timeupdate", () => {
    const current = Number.isFinite(artistAudio.currentTime) ? artistAudio.currentTime : 0;
    const minutes = String(Math.floor(current / 60)).padStart(2, "0");
    const seconds = String(Math.floor(current % 60)).padStart(2, "0");
    trackTime.textContent = `${minutes}:${seconds}`;
    if (Number.isFinite(artistAudio.duration) && artistAudio.duration > 0) {
      trackProgress.style.width = `${Math.min(100, current / artistAudio.duration * 100)}%`;
    }
  });

  const createWebGLCake = () => {
    if (!window.THREE) {
      stage.innerHTML = "<p class='cake-fallback'>3D 蛋糕暂时没有加载出来，但祝福已经送达。</p>";
      return null;
    }

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);
    const cake = new THREE.Group();
    world.add(cake);

    const colors = {
      pink: 0xffafcf,
      pinkDeep: 0xff6ea8,
      pinkPale: 0xffe2ed,
      cream: 0xfff5dc,
      mint: 0xe1f7d7,
      white: 0xfffcf4,
      plum: 0x835272,
      brown: 0x4c303c,
      gold: 0xffd66f,
      red: 0xff496f,
      green: 0x72b56d,
      blue: 0x8ebdff
    };

    const material = (color, options = {}) => new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.62,
      metalness: options.metalness ?? 0.02,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
      map: options.map ?? null
    });

    const cream = material(colors.cream, { roughness: 0.72 });
    const pink = material(colors.pink, { roughness: 0.58 });
    const pale = material(colors.pinkPale, { roughness: 0.6 });
    const mint = material(colors.mint, { roughness: 0.64 });
    const white = material(colors.white, { roughness: 0.5 });
    const plum = material(colors.plum, { roughness: 0.5 });
    const dark = material(colors.brown, { roughness: 0.38 });
    const red = material(colors.red, { roughness: 0.42 });
    const green = material(colors.green, { roughness: 0.65 });
    const gold = material(colors.gold, { roughness: 0.35, metalness: 0.12 });

    const addMesh = (geometry, meshMaterial, parent = cake, x = 0, y = 0, z = 0) => {
      const item = new THREE.Mesh(geometry, meshMaterial);
      item.position.set(x, y, z);
      item.castShadow = true;
      item.receiveShadow = true;
      parent.add(item);
      return item;
    };

    const makeGingham = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      context.fillStyle = "#f7c5d8";
      context.fillRect(0, 0, 256, 256);
      context.fillStyle = "rgba(255,255,255,0.42)";
      for (let value = 0; value < 256; value += 48) {
        context.fillRect(value, 0, 20, 256);
        context.fillRect(0, value, 256, 20);
      }
      context.strokeStyle = "rgba(255,255,255,0.32)";
      context.lineWidth = 2;
      for (let value = 0; value < 256; value += 24) {
        context.beginPath();
        context.moveTo(value, 0);
        context.lineTo(value, 256);
        context.stroke();
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 2);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const makeTextTexture = (text, options = {}) => {
      const canvas = document.createElement("canvas");
      canvas.width = options.width || 760;
      canvas.height = options.height || 260;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (options.background) {
        context.fillStyle = options.background;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = options.color || "#7a435e";
      context.font = `${options.weight || 700} ${options.size || 76}px "Arial Black", "Microsoft YaHei UI", sans-serif`;
      const lines = text.split("\n");
      const lineHeight = options.lineHeight || 84;
      lines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, canvas.height / 2 + (index - (lines.length - 1) / 2) * lineHeight);
      });
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return texture;
    };

    const board = addMesh(
      new THREE.CylinderGeometry(2.58, 2.58, 0.14, 72),
      material(0xffe6c7, { roughness: 0.42 }),
      cake,
      0,
      0.04,
      0
    );
    board.scale.z = 0.94;

    const ginghamMaterial = material(0xffffff, { roughness: 0.66, map: makeGingham() });
    const body = addMesh(
      new THREE.CylinderGeometry(2.22, 2.2, 1.25, 80),
      ginghamMaterial,
      cake,
      0,
      0.77,
      0
    );
    body.scale.z = 0.93;

    const lowerFrosting = addMesh(
      new THREE.CylinderGeometry(2.24, 2.26, 0.25, 80),
      pale,
      cake,
      0,
      1.36,
      0
    );
    lowerFrosting.scale.z = 0.93;

    const topFrosting = addMesh(
      new THREE.CylinderGeometry(1.93, 2.03, 0.23, 80),
      pink,
      cake,
      0,
      1.48,
      0
    );
    topFrosting.scale.z = 0.93;

    const frostingRing = addMesh(
      new THREE.TorusGeometry(1.88, 0.075, 12, 80),
      pale,
      cake,
      0,
      1.59,
      0
    );
    frostingRing.rotation.x = Math.PI / 2;
    frostingRing.scale.y = 0.93;

    const dollopGeometry = new THREE.SphereGeometry(1, 16, 12);
    for (let index = 0; index < 34; index += 1) {
      const angle = (index / 34) * Math.PI * 2;
      const dollop = addMesh(
        dollopGeometry,
        index % 3 === 0 ? mint : cream,
        cake,
        Math.cos(angle) * 1.78,
        1.67,
        Math.sin(angle) * 1.65
      );
      dollop.scale.set(0.23, 0.23, 0.2);
      dollop.rotation.y = -angle;
      dollop.rotation.z = index % 2 ? 0.1 : -0.1;
    }

    for (let index = 0; index < 44; index += 1) {
      const angle = (index / 44) * Math.PI * 2;
      const ruffle = addMesh(
        dollopGeometry,
        index % 2 ? pale : cream,
        cake,
        Math.cos(angle) * 2.13,
        0.23,
        Math.sin(angle) * 1.98
      );
      ruffle.scale.set(0.22, 0.14, 0.14);
      ruffle.rotation.y = -angle + 0.2;
    }

    const cakeText = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, 0.6),
      new THREE.MeshBasicMaterial({
        map: makeTextTexture("HAPPY  19  BIRTHDAY", {
          width: 900,
          height: 280,
          size: 78,
          color: "#7f4560",
          weight: 800
        }),
        transparent: true,
        depthWrite: false
      })
    );
    cakeText.position.set(0, 0.79, 2.135);
    cake.add(cakeText);

    const bunny = new THREE.Group();
    bunny.position.set(0, 1.68, -0.05);
    cake.add(bunny);

    const bodyMesh = addMesh(new THREE.SphereGeometry(0.55, 30, 22), white, bunny, 0, 0.43, 0);
    bodyMesh.scale.set(0.78, 0.95, 0.64);

    const dress = addMesh(new THREE.CylinderGeometry(0.29, 0.47, 0.52, 30), pale, bunny, 0, 0.28, 0.03);
    dress.scale.z = 0.83;
    addMesh(new THREE.TorusGeometry(0.28, 0.025, 8, 28), material(0xffffff, { roughness: 0.48 }), bunny, 0, 0.55, 0.03);

    const footLeft = addMesh(new THREE.SphereGeometry(0.19, 20, 14), white, bunny, -0.27, 0.08, 0.2);
    footLeft.scale.set(1.18, 0.7, 1.38);
    const footRight = addMesh(new THREE.SphereGeometry(0.19, 20, 14), white, bunny, 0.27, 0.08, 0.2);
    footRight.scale.set(1.18, 0.7, 1.38);

    const armLeft = addMesh(new THREE.SphereGeometry(0.16, 18, 12), white, bunny, -0.43, 0.46, 0.18);
    armLeft.scale.set(0.72, 1.28, 0.86);
    armLeft.rotation.z = -0.52;
    const armRight = addMesh(new THREE.SphereGeometry(0.16, 18, 12), white, bunny, 0.43, 0.46, 0.18);
    armRight.scale.set(0.72, 1.28, 0.86);
    armRight.rotation.z = 0.52;

    const hoodMaterial = material(0x9b587d, { roughness: 0.47 });
    const hood = addMesh(new THREE.SphereGeometry(0.58, 36, 26), hoodMaterial, bunny, 0, 0.96, -0.05);
    hood.scale.set(0.97, 0.92, 0.84);

    const hoodBack = addMesh(new THREE.SphereGeometry(0.4, 30, 20), hoodMaterial, bunny, 0, 0.72, -0.28);
    hoodBack.scale.set(1.1, 0.82, 0.58);

    const face = addMesh(new THREE.SphereGeometry(0.46, 34, 24), white, bunny, 0, 0.94, 0.33);
    face.scale.set(1.02, 0.92, 0.43);

    for (let index = 0; index < 13; index += 1) {
      const angle = -0.16 + (index / 12) * (Math.PI + 0.32);
      const rim = addMesh(new THREE.SphereGeometry(0.074, 12, 8), hoodMaterial, bunny, Math.cos(angle) * 0.455, 0.94 + Math.sin(angle) * 0.405, 0.49);
      rim.scale.set(1.12, 1.12, 0.46);
      rim.rotation.z = angle;
    }

    const earGroup = new THREE.Group();
    bunny.add(earGroup);
    [-1, 1].forEach((side) => {
      const ear = addMesh(new THREE.SphereGeometry(0.2, 22, 18), hoodMaterial, earGroup, side * 0.28, 1.5, -0.06);
      ear.scale.set(0.9, 2.55, 0.66);
      ear.rotation.z = side * -0.16;
      const inner = addMesh(new THREE.SphereGeometry(0.115, 18, 14), material(0xf4bfd6, { roughness: 0.55 }), earGroup, side * 0.28, 1.53, 0.08);
      inner.scale.set(0.67, 2.03, 0.2);
      inner.rotation.z = side * -0.16;
      const hoodEar = addMesh(new THREE.SphereGeometry(0.23, 20, 16), hoodMaterial, earGroup, side * 0.28, 1.19, -0.05);
      hoodEar.scale.set(1, 0.84, 0.73);
      hoodEar.rotation.z = side * -0.16;
    });

    const eyeMaterial = material(0x241b25, { roughness: 0.2 });
    const eyeGeometry = new THREE.SphereGeometry(0.06, 18, 12);
    addMesh(eyeGeometry, eyeMaterial, bunny, -0.16, 0.99, 0.605).scale.y = 1.15;
    addMesh(eyeGeometry, eyeMaterial, bunny, 0.16, 0.99, 0.605).scale.y = 1.15;
    addMesh(new THREE.SphereGeometry(0.018, 10, 8), white, bunny, -0.18, 1.02, 0.657);
    addMesh(new THREE.SphereGeometry(0.018, 10, 8), white, bunny, 0.14, 1.02, 0.657);
    const nose = addMesh(new THREE.SphereGeometry(0.035, 14, 10), material(0xd86e9f, { roughness: 0.45 }), bunny, 0, 0.9, 0.625);
    nose.scale.set(1.25, 0.75, 0.52);

    [-1, 1].forEach((side) => {
      const blush = addMesh(new THREE.SphereGeometry(0.07, 14, 10), material(0xffb8ca, { roughness: 0.65 }), bunny, side * 0.28, 0.87, 0.57);
      blush.scale.set(1.5, 0.5, 0.18);
    });

    const tail = addMesh(new THREE.SphereGeometry(0.18, 16, 12), white, bunny, 0, 0.32, -0.37);
    tail.scale.set(1, 1.18, 0.82);

    const bow = new THREE.Group();
    bow.position.set(0.34, 1.32, 0.44);
    bow.rotation.z = -0.1;
    bunny.add(bow);
    const bowMaterial = material(0xfff5e6, { roughness: 0.58 });
    const bowLeft = addMesh(new THREE.SphereGeometry(0.115, 16, 10), bowMaterial, bow, -0.11, 0, 0);
    bowLeft.scale.set(1.25, 0.67, 0.42);
    bowLeft.rotation.z = 0.4;
    const bowRight = addMesh(new THREE.SphereGeometry(0.115, 16, 10), bowMaterial, bow, 0.11, 0, 0);
    bowRight.scale.set(1.25, 0.67, 0.42);
    bowRight.rotation.z = -0.4;
    addMesh(new THREE.SphereGeometry(0.05, 12, 8), gold, bow, 0, 0, 0.05);

    const flower = new THREE.Group();
    flower.position.set(-0.34, 1.3, 0.44);
    flower.rotation.z = -0.18;
    bunny.add(flower);
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2;
      const petal = addMesh(new THREE.SphereGeometry(0.065, 12, 8), bowMaterial, flower, Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0);
      petal.scale.set(1.25, 0.72, 0.4);
      petal.rotation.z = angle;
    }
    addMesh(new THREE.SphereGeometry(0.05, 12, 8), gold, flower, 0, 0, 0.045);

    const tinyHeartMaterial = material(0xffd0e1, { roughness: 0.54 });
    const leftPaw = addMesh(new THREE.SphereGeometry(0.105, 16, 12), white, bunny, -0.23, 0.56, 0.36);
    leftPaw.scale.set(1.1, 0.76, 0.9);
    const rightPaw = addMesh(new THREE.SphereGeometry(0.105, 16, 12), white, bunny, 0.23, 0.56, 0.36);
    rightPaw.scale.set(1.1, 0.76, 0.9);
    const heartLeft = addMesh(new THREE.SphereGeometry(0.075, 14, 10), tinyHeartMaterial, bunny, -0.05, 0.56, 0.48);
    heartLeft.scale.set(1, 0.72, 0.5);
    const heartRight = addMesh(new THREE.SphereGeometry(0.075, 14, 10), tinyHeartMaterial, bunny, 0.05, 0.56, 0.48);
    heartRight.scale.set(1, 0.72, 0.5);

    const cherryStemMaterial = new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.7 });
    const cherryPositions = [
      [-1.37, 1.69, 0.96], [1.33, 1.69, 0.77], [1.55, 1.69, -0.62], [-1.45, 1.69, -0.89]
    ];
    cherryPositions.forEach(([x, y, z], index) => {
      const cherry = addMesh(new THREE.SphereGeometry(0.17, 18, 12), red, cake, x, y + 0.1, z);
      cherry.scale.y = 1.08;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, y + 0.24, z),
        new THREE.Vector3(x + (index % 2 ? -0.05 : 0.07), y + 0.42, z),
        new THREE.Vector3(x + (index % 2 ? 0.1 : -0.1), y + 0.55, z)
      ]);
      addMesh(new THREE.TubeGeometry(curve, 12, 0.018, 6, false), cherryStemMaterial, cake, 0, 0, 0);
      const leaf = addMesh(new THREE.SphereGeometry(0.09, 12, 8), green, cake, x + 0.1, y + 0.49, z);
      leaf.scale.set(1.4, 0.34, 0.6);
      leaf.rotation.z = -0.45;
    });

    const sprinkleGeometry = new THREE.OctahedronGeometry(0.035, 0);
    const sprinkleMaterials = [gold, mint, material(colors.blue), red, white];
    for (let index = 0; index < 34; index += 1) {
      const angle = index * 2.399;
      const radius = 0.85 + (index % 7) * 0.14;
      const sprinkle = addMesh(
        sprinkleGeometry,
        sprinkleMaterials[index % sprinkleMaterials.length],
        cake,
        Math.cos(angle) * radius,
        1.63 + (index % 2) * 0.02,
        Math.sin(angle) * radius * 0.8
      );
      sprinkle.rotation.set(angle, angle * 0.4, index);
    }

    const makeCanLabelTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      const gradient = context.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, "#d9edff");
      gradient.addColorStop(0.52, "#78a8df");
      gradient.addColorStop(1, "#426ca7");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);

      context.fillStyle = "rgba(255,255,255,0.28)";
      for (let index = 0; index < 28; index += 1) {
        const x = (index * 73) % 500 + 6;
        const y = (index * 117) % 500 + 6;
        const size = 3 + (index % 3) * 2;
        context.fillRect(x, y, size, size);
      }

      context.save();
      context.translate(256, 230);
      context.strokeStyle = "rgba(31,54,94,0.78)";
      context.lineWidth = 18;
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(-67, -72);
      context.lineTo(-38, -15);
      context.lineTo(-8, 60);
      context.lineTo(20, -30);
      context.lineTo(56, 70);
      context.stroke();
      context.restore();

      context.fillStyle = "#eff8ff";
      context.beginPath();
      context.arc(256, 268, 93, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.ellipse(210, 178, 31, 92, -0.3, 0, Math.PI * 2);
      context.ellipse(304, 178, 31, 92, 0.3, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#2c4c7b";
      context.beginPath();
      context.arc(228, 267, 7, 0, Math.PI * 2);
      context.arc(284, 267, 7, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#efb7ca";
      context.beginPath();
      context.ellipse(256, 287, 6, 4, 0, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#f4fbff";
      context.textAlign = "center";
      context.font = '800 58px "Arial Black", sans-serif';
      context.fillText("MIDNIGHT", 256, 412);
      context.font = '700 22px "Cascadia Mono", monospace';
      context.fillText("FUEL FOR 19", 256, 449);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const canLabel = makeCanLabelTexture();
    const canMaterials = {
      label: material(0xffffff, { roughness: 0.25, metalness: 0.48, map: canLabel }),
      metal: material(0xa4c4e7, { roughness: 0.2, metalness: 0.7 })
    };
    const floatingDecorations = [];

    const makeEnergyCan = (x, y, z, scale, phase) => {
      const canGroup = new THREE.Group();
      canGroup.position.set(x, y, z);
      canGroup.scale.setScalar(scale);
      canGroup.rotation.z = phase * 0.025;
      cake.add(canGroup);

      const canBody = addMesh(new THREE.CylinderGeometry(0.23, 0.21, 0.92, 32), canMaterials.label, canGroup, 0, 0, 0);
      canBody.castShadow = true;
      addMesh(new THREE.CylinderGeometry(0.225, 0.225, 0.055, 32), canMaterials.metal, canGroup, 0, 0.475, 0);
      addMesh(new THREE.CylinderGeometry(0.215, 0.205, 0.045, 32), canMaterials.metal, canGroup, 0, -0.472, 0);
      const tab = addMesh(new THREE.TorusGeometry(0.07, 0.012, 6, 20), canMaterials.metal, canGroup, 0, 0.507, 0.02);
      tab.rotation.x = Math.PI / 2;
      floatingDecorations.push({ object: canGroup, baseY: y, phase, spin: 0.35 + phase * 0.02, amplitude: 0.07 });
      return canGroup;
    };

    makeEnergyCan(2.66, 0.74, 0.92, 0.82, 1.2).rotation.y = 0.45;
    makeEnergyCan(2.28, 0.61, 1.55, 0.64, 3.4).rotation.y = -0.5;
    makeEnergyCan(-2.45, 0.64, -0.84, 0.7, 5.2).rotation.y = 0.9;

    const makePixelCharmTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 380;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, 300, 380);
      const pixel = 20;
      const drawBlock = (column, row, color, width = 1, height = 1) => {
        context.fillStyle = color;
        context.fillRect(column * pixel, row * pixel, width * pixel, height * pixel);
      };
      const palette = {
        outline: "#15162b",
        hair: "#ffd75e",
        hairLight: "#ffe99c",
        skin: "#f8d6c4",
        eye: "#4ba4ff",
        white: "#fff9ef",
        wing: "#e8efff",
        pink: "#ff8fbd"
      };
      drawBlock(5, 1, palette.outline, 5, 1);
      drawBlock(4, 2, palette.outline, 7, 3);
      drawBlock(4, 2, palette.hair, 7, 1);
      drawBlock(3, 3, palette.hair, 9, 4);
      drawBlock(4, 3, palette.hairLight, 3, 1);
      drawBlock(3, 6, palette.outline, 9, 1);
      drawBlock(4, 7, palette.outline, 7, 4);
      drawBlock(5, 7, palette.skin, 5, 3);
      drawBlock(5, 9, palette.eye, 1, 1);
      drawBlock(9, 9, palette.eye, 1, 1);
      drawBlock(7, 10, palette.pink, 1, 1);
      drawBlock(4, 11, palette.white, 7, 2);
      drawBlock(3, 12, palette.wing, 2, 3);
      drawBlock(10, 12, palette.wing, 2, 3);
      drawBlock(5, 13, palette.white, 5, 4);
      drawBlock(4, 16, palette.outline, 7, 1);
      drawBlock(3, 12, palette.outline, 1, 4);
      drawBlock(11, 12, palette.outline, 1, 4);
      drawBlock(4, 17, palette.outline, 2, 1);
      drawBlock(9, 17, palette.outline, 2, 1);
      drawBlock(6, 16, palette.pink, 3, 1);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      return texture;
    };

    const charmGroup = new THREE.Group();
    charmGroup.position.set(-2.58, 2.2, 0.22);
    charmGroup.rotation.set(-0.04, 0.35, 0.12);
    cake.add(charmGroup);
    const charmBack = addMesh(
      new THREE.BoxGeometry(0.86, 1.04, 0.1),
      material(0x17182d, { roughness: 0.35, metalness: 0.2 }),
      charmGroup,
      0,
      0,
      0
    );
    const charmFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.98),
      new THREE.MeshBasicMaterial({ map: makePixelCharmTexture(), transparent: true, depthWrite: false })
    );
    charmFace.position.z = 0.056;
    charmGroup.add(charmFace);
    const charmLoop = addMesh(new THREE.TorusGeometry(0.1, 0.022, 8, 24), gold, charmGroup, 0, 0.63, 0.02);
    charmLoop.rotation.x = Math.PI / 2;
    const charmSpark = new THREE.PointLight(0xbad4ff, 4.5, 3.2, 2);
    charmSpark.position.set(0, 0, 0.25);
    charmGroup.add(charmSpark);
    floatingDecorations.push({ object: charmGroup, baseY: 2.2, phase: 2.6, spin: 0.22, amplitude: 0.1 });

    const macaronMaterials = [pink, mint, material(colors.blue, { roughness: 0.52 }), pale, red];
    const macaronGeometry = new THREE.CylinderGeometry(0.17, 0.17, 0.09, 28);
    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2 + 0.25;
      const radius = 1.28 - (index % 2) * 0.18;
      const macaron = addMesh(
        macaronGeometry,
        macaronMaterials[index % macaronMaterials.length],
        cake,
        Math.cos(angle) * radius,
        1.72,
        Math.sin(angle) * radius * 0.82
      );
      macaron.rotation.set(Math.PI / 2, angle, index % 2 ? 0.18 : -0.18);
    }

    const rosetteMaterials = [cream, pale, mint];
    for (let index = 0; index < 9; index += 1) {
      const angle = (index / 9) * Math.PI * 2 - 0.12;
      const radius = 1.05 + (index % 3) * 0.12;
      const rosette = new THREE.Group();
      rosette.position.set(Math.cos(angle) * radius, 1.66, Math.sin(angle) * radius * 0.82);
      rosette.rotation.x = -0.08;
      cake.add(rosette);
      const rosetteMaterial = rosetteMaterials[index % rosetteMaterials.length];
      const outer = addMesh(new THREE.TorusGeometry(0.105, 0.037, 9, 24), rosetteMaterial, rosette, 0, 0.04, 0);
      outer.rotation.x = Math.PI / 2;
      const middle = addMesh(new THREE.TorusGeometry(0.066, 0.029, 8, 20), rosetteMaterial, rosette, 0, 0.08, 0);
      middle.rotation.x = Math.PI / 2;
      addMesh(new THREE.SphereGeometry(0.043, 12, 8), rosetteMaterial, rosette, 0, 0.11, 0);
    }

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -0.34);
    heartShape.bezierCurveTo(-0.58, 0.02, -0.5, 0.56, -0.12, 0.5);
    heartShape.bezierCurveTo(0, 0.48, 0.08, 0.7, 0.14, 0.72);
    heartShape.bezierCurveTo(0.24, 0.7, 0.56, 0.4, 0.42, 0.08);
    heartShape.bezierCurveTo(0.34, -0.14, 0.08, -0.28, 0, -0.34);
    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035
    });
    const balloonColors = [0xff76aa, 0x8cb6ff, 0xbca4ff];
    const balloonData = [
      [-2.7, 3.25, -0.45, 0.62, 0.2],
      [2.45, 3.5, -0.5, 0.7, 2.2],
      [3.05, 2.45, 0.38, 0.48, 4.1]
    ];
    balloonData.forEach(([x, y, z, scale, phase], index) => {
      const balloonMaterial = material(balloonColors[index], {
        roughness: 0.24,
        metalness: 0.08,
        transparent: true,
        opacity: 0.92
      });
      const balloon = addMesh(heartGeometry, balloonMaterial, cake, x, y, z);
      balloon.scale.setScalar(scale);
      balloon.rotation.z = index === 1 ? -0.18 : 0.15;
      floatingDecorations.push({ object: balloon, baseY: y, phase, spin: 0.08, amplitude: 0.1 });
      const stringGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y - 0.22 * scale, z),
        new THREE.Vector3(x + (index - 1) * 0.12, y - 0.8, z + 0.08),
        new THREE.Vector3(x + (index - 1) * 0.2, 1.7, z + 0.12)
      ]);
      const string = new THREE.Line(
        stringGeometry,
        new THREE.LineBasicMaterial({ color: 0xffdceb, transparent: true, opacity: 0.2 })
      );
      cake.add(string);
    });

    const ribbonMaterial = new THREE.MeshBasicMaterial({
      color: 0xff84b8,
      transparent: true,
      opacity: 0.27
    });
    const ribbons = [];
    for (let index = 0; index < 3; index += 1) {
      const points = [];
      for (let step = 0; step <= 28; step += 1) {
        const t = step / 28;
        const angle = t * Math.PI * 2 + index * 1.8;
        const radius = 2.75 + Math.sin(t * Math.PI * 4) * 0.22;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0.15 + t * 2.7 + index * 0.14,
          Math.sin(angle) * radius
        ));
      }
      const ribbon = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, 0.009, 5, false),
        ribbonMaterial.clone()
      );
      scene.add(ribbon);
      ribbons.push(ribbon);
    }

    const flames = [];
    const candleNumbers = ["1", "9"];
    [-1, 1].forEach((side, index) => {
      const candleGroup = new THREE.Group();
      candleGroup.position.set(side * 0.91, 1.7, 0.45);
      cake.add(candleGroup);
      const candle = addMesh(new THREE.CylinderGeometry(0.085, 0.09, 0.52, 18), white, candleGroup, 0, 0.25, 0);
      candle.castShadow = true;

      const numberPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.17, 0.25),
        new THREE.MeshBasicMaterial({
          map: makeTextTexture(candleNumbers[index], {
            width: 160,
            height: 240,
            size: 160,
            color: "#ff639d"
          }),
          transparent: true,
          depthWrite: false
        })
      );
      numberPlane.position.set(0, 0.25, 0.091);
      candleGroup.add(numberPlane);

      const wick = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8), dark, candleGroup, 0, 0.55, 0);
      wick.castShadow = false;

      const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd277,
        transparent: true,
        opacity: 0.95
      });
      const flame = addMesh(new THREE.ConeGeometry(0.075, 0.24, 16), flameMaterial, candleGroup, 0, 0.7, 0);
      flame.castShadow = false;
      flame.userData.baseY = 0.7;
      flame.userData.offset = index * 2.2;
      flames.push(flame);

      const light = new THREE.PointLight(0xffb36b, 2.2, 2.8, 2);
      light.position.set(0, 0.72, 0.12);
      candleGroup.add(light);
    });

    const floorMaterial = new THREE.ShadowMaterial({ color: 0x1b0b26, opacity: 0.45 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    scene.add(floor);

    const glowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(3.9, 64),
      new THREE.MeshBasicMaterial({
        color: 0xff81b6,
        transparent: true,
        opacity: 0.09,
        depthWrite: false
      })
    );
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.y = -0.015;
    scene.add(glowPlane);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ebeff,
      transparent: true,
      opacity: 0.15
    });
    const orbitRings = [];
    [3.1, 3.8].forEach((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 4, 100), ringMaterial.clone());
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.02 + index * 0.01;
      ring.rotation.z = index * 0.6;
      scene.add(ring);
      orbitRings.push(ring);
    });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let index = 0; index < 560; index += 1) {
      const radius = 4.3 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      starPositions.push(
        Math.cos(angle) * radius,
        0.5 + Math.random() * 7,
        Math.sin(angle) * radius - Math.random() * 2
      );
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffc4dc,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const ambient = new THREE.AmbientLight(0xffd7e6, 1.35);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xffe7ef, 0x171a39, 1.4);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff5dd, 3);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 25;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    scene.add(key);
    const pinkLight = new THREE.PointLight(0xff4f9a, 30, 15, 2);
    pinkLight.position.set(-4.5, 3.5, 4);
    scene.add(pinkLight);
    const blueLight = new THREE.PointLight(0x668dff, 24, 13, 2);
    blueLight.position.set(5, 2.4, -3);
    scene.add(blueLight);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotateY = -0.35;
    let targetTilt = -0.02;
    let cameraDistance = 0;
    let autoRotateAt = performance.now() + 9000;
    let wished = false;
    let wishProgress = 0;
    let animationTime = 0;
    const clock = new THREE.Clock();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateLayout = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const isNarrow = width < 821;
      cake.position.x = isNarrow ? 0.2 : 1.45;
      cake.position.y = isNarrow ? -0.45 : -0.1;
      camera.fov = isNarrow ? 36 : 33;
      const distanceScale = isNarrow ? (height < 700 ? 1.22 : 1.05) : 1;
      cameraDistance = 10.4 * distanceScale;
      camera.position.set(5.25 * distanceScale, 4.35 * distanceScale, 8.7 * distanceScale);
      camera.lookAt(isNarrow ? 0.1 : 0.95, 2.05, 0);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(stage);
    updateLayout();

    renderer.domElement.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    });

    renderer.domElement.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      targetRotateY += deltaX * 0.008;
      targetTilt = THREE.MathUtils.clamp(targetTilt + deltaY * 0.003, -0.11, 0.09);
      lastX = event.clientX;
      lastY = event.clientY;
      autoRotateAt = performance.now() + 4800;
    });

    const finishDrag = (event) => {
      dragging = false;
      try {
        renderer.domElement.releasePointerCapture?.(event.pointerId);
      } catch (_) {
        // The browser can already have released the pointer.
      }
    };

    renderer.domElement.addEventListener("pointerup", finishDrag);
    renderer.domElement.addEventListener("pointercancel", finishDrag);

    let wheelLock = 0;
    renderer.domElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      const now = performance.now();
      if (now - wheelLock < 80) return;
      wheelLock = now;
      cameraDistance = THREE.MathUtils.clamp(cameraDistance + event.deltaY * 0.008, 7.8, 14);
      const ratio = cameraDistance / camera.position.length();
      camera.position.multiplyScalar(ratio);
      camera.lookAt(stage.clientWidth < 821 ? 0.1 : 0.95, 2.05, 0);
    }, { passive: false });

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      animationTime += delta;
      const elapsed = animationTime;

      if (!reduce && !dragging && performance.now() > autoRotateAt) {
        targetRotateY += delta * 0.045;
      }

      cake.rotation.y += (targetRotateY - cake.rotation.y) * 0.045;
      cake.rotation.x += (targetTilt - cake.rotation.x) * 0.045;
      bunny.position.y = 1.68 + (reduce ? 0 : Math.sin(elapsed * 1.35) * 0.018);
      earGroup.rotation.z = reduce ? 0 : Math.sin(elapsed * 1.1) * 0.012;
      stars.rotation.y = reduce ? 0 : elapsed * 0.012;
      stars.material.opacity = reduce ? 0.65 : 0.52 + Math.sin(elapsed * 1.7) * 0.16;
      pinkLight.intensity = reduce ? 30 : 27 + Math.sin(elapsed * 2.4) * 6;
      blueLight.intensity = reduce ? 24 : 20 + Math.cos(elapsed * 1.8) * 5;
      charmSpark.intensity = reduce ? 4.5 : 3.8 + Math.sin(elapsed * 3.3) * 1.7;

      floatingDecorations.forEach((item, index) => {
        item.object.position.y = item.baseY + (reduce ? 0 : Math.sin(elapsed * 1.1 + item.phase) * item.amplitude);
        item.object.rotation.y += delta * item.spin;
        if (index === 4) item.object.rotation.z += delta * 0.05;
      });

      ribbons.forEach((ribbon, index) => {
        ribbon.rotation.y = reduce ? index * 0.4 : elapsed * (0.018 + index * 0.004);
        ribbon.material.opacity = 0.2 + Math.sin(elapsed * 1.1 + index) * 0.08;
      });

      orbitRings.forEach((ring, index) => {
        ring.rotation.z += delta * (0.045 + index * 0.016);
      });

      flames.forEach((flame) => {
        if (wished) wishProgress += (1 - wishProgress) * 0.12;
        const flicker = reduce ? 1 : 0.96 + Math.sin(elapsed * 8 + flame.userData.offset) * 0.07;
        flame.scale.set(flicker, flicker, flicker);
        flame.position.y = flame.userData.baseY + (wished ? wishProgress * 0.18 : 0);
        flame.material.opacity = Math.max(0, 0.95 - wishProgress * 1.5);
      });

      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    };

    window.birthdayCake = {
      blowCandles() {
        wished = true;
        wishProgress = 0;
      },
      get context() {
        return renderer.getContext();
      }
    };

    animate();
    return { renderer, scene };
  };

  try {
    createWebGLCake();
  } catch (error) {
    console.warn("The 3D cake could not start.", error);
    stage.innerHTML = "<p class='cake-fallback'>3D 蛋糕暂时没有加载出来，但祝福已经送达。</p>";
  }
})();
