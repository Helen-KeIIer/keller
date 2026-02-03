// =====================================================
// (0) FORCE START AT TOP
// =====================================================
(function () {
  try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  } catch (e) {}

  function hardResetToTop() {
    try {
      if (location.hash) {
        history.replaceState(null, "", location.pathname + location.search);
      }
    } catch (e) {}

    try {
      window.scrollTo(0, 0);
    } catch (e) {}

    if (document.body) {
      document.body.classList.remove("is-light");
      document.body.classList.remove("is-scrolled");
    }

    try {
      document.documentElement.style.setProperty("--theoryWhite", "0");
      document.documentElement.style.setProperty("--theoryText", "0");
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", hardResetToTop);
  window.addEventListener("load", () => setTimeout(hardResetToTop, 0));
})();

// =====================================================
// GLOBALS / HELPERS
// =====================================================
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function easeSoft(t) {
  t = clamp01(t);
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}
function remap01(v, a, b) {
  return clamp01((v - a) / (b - a));
}

function getPinnedProgress(sectionEl) {
  if (!sectionEl) return -1;
  const rect = sectionEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height - vh;
  if (total <= 0) return -1;
  const scrolled = Math.min(Math.max(-rect.top, 0), total);
  return scrolled / total;
}

function applyRevealAbsCentered(el, amount) {
  if (!el) return;
  const t = easeSoft(amount);
  const y = (1 - t) * 18;
  const blur = (1 - t) * 1.6;
  el.style.opacity = String(t);
  el.style.transform = `translate(-50%, -50%) translateY(${y}px)`;
  el.style.filter = `blur(${blur}px)`;
}
function applyRevealCentered(el, amount) {
  if (!el) return;
  const t = easeSoft(amount);
  const y = (1 - t) * 18;
  const blur = (1 - t) * 1.6;
  el.style.opacity = String(t);
  el.style.transform = `translateY(${y}px)`;
  el.style.filter = `blur(${blur}px)`;
}
function applyRevealFlowCentered(el, amount) {
  if (!el) return;
  const t = easeSoft(amount);
  const y = (1 - t) * 18;
  const blur = (1 - t) * 1.6;
  el.style.opacity = String(t);
  el.style.transform = `translateY(calc(${y}px + var(--quote-raise)))`;
  el.style.filter = `blur(${blur}px)`;
}

function snapHalfPx(v) {
  return Math.round(v * 2) / 2;
}

// =====================================================
// DOM REFS
// =====================================================
let loaderEl, loaderTextEl;
let micGateEl, micEnableBtnEl, micSkipBtnEl, micStatusEl;

let dissolveZoneEl,
  silenceSectionEl,
  chaosSectionEl,
  waterSectionEl,
  vibeGapEl,
  vibeSectionEl,
  theorySectionEl,
  timelineSectionEl,
  periodsSectionEl;

let silenceQ1El, silenceQ2El, waterQuoteEl;
let vibeIntroEl, vibeCaptionEl;

let timelineEl, stageEl, ellipseSvg, ellipseEl, tItems = [];

// chaos blurred layer canvas
let chaosWrapEl = null;
let chaosCanvas = null;
let chaosCtx = null;

// =====================================================
// PHOSPHENE SYSTEM (Deep Blue Organic Lights)
// =====================================================
let phospheneCanvas = null;
let phospheneCtx = null;
let phospheneW = 0, phospheneH = 0;
let phospheneLights = [];
const MAX_PHOSPHENES = 6;
let phospheneRAF = 0;

// =====================================================
// WHITE MODE GLOW SYSTEM (Periods section)
// =====================================================
let whiteGlowCanvas = null;
let whiteGlowCtx = null;
let whiteGlowW = 0, whiteGlowH = 0;
let whiteGlowRAF = 0;
let hasTriggeredWhiteGlow = false;
let whiteGlowActive = false;
let whiteBreathCycle = 0; // 0 to 3 breaths

// =====================================================
// SCROLL ANCHORS
// =====================================================
let DISSOLVE_RANGE_PX = 1;
let SILENCE_START_PX = 0;
let CHAOS_START_PX = 0;
let WATER_START_PX = 0;
let VIBE_GAP_START_PX = 0;
let VIBE_START_PX = 0;
let THEORY_START_PX = 0;

// =====================================================
// p5 STATE
// =====================================================
let img = null;
let bustDots = [];
let dissolveProgress = 0;
let imgCenterX = 0, imgCenterY = 0, maxDistFromCenter = 1;
let cellSize = 4;
const IMAGE_AREA_SCALE = 1.04;
const TARGET_CENTER_X = 0.72;
const TARGET_CENTER_Y = 0.54;

// water
let waterDots = [];
let ripples = [];
let trailParticles = [];
let gridStep = 5;
let wasInWater = false;

// chaos pixels
let chaosPts = [];
let chaosGrid = 12;

// cymatics
let cymDots = [];
let cymBuilt = false;
let modeA = { n: 2, m: 3, k: 1.0 };
let modeB = { n: 3, m: 5, k: 1.1 };
let modeBlend = 0;
let modeHold = 0;
let smoothMic = 0;

// mic
let mic = null, micEnabled = false, micDenied = false, micStarting = false, fft = null;

// theme
let enteredLight = false;

// =====================================================
// CYMATICS LAYOUT
// =====================================================
const CYM_CAPTION_SAFE_PX = 96;
function getCymArea() {
  const usableH = Math.max(1, height - CYM_CAPTION_SAFE_PX);
  const cx = width * 0.50;
  const cy = usableH * 0.52;
  const plateR = Math.min(width, usableH) * 0.49;
  return { cx, cy, plateR, usableH };
}

// =====================================================
// PARTICLE TUNING
// =====================================================
function updateParticleTuning() {
  const minSide = Math.min(window.innerWidth || 1, window.innerHeight || 1);
  const g = Math.round(minSide / 70);
  chaosGrid = Math.max(12, Math.min(18, g));
  const wStep = Math.round(minSide / 220);
  gridStep = Math.max(5, Math.min(8, wStep || 5));
}

// =====================================================
// LOADER & MIC
// =====================================================
function hideLoader() {
  if (!loaderEl) return;
  loaderEl.classList.add("is-hidden");
  loaderEl.setAttribute("aria-busy", "false");
}
function showLoaderError(msg) {
  if (loaderTextEl) loaderTextEl.textContent = msg;
}
function setMicStatus(msg) {
  if (!micStatusEl) return;
  micStatusEl.textContent = msg || "";
}
function getFriendlyMicError(err) {
  const name = (err && err.name) || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "MICROPHONE BLOCKED — ALLOW IT IN BROWSER SETTINGS.";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "NO MICROPHONE DEVICE FOUND.";
  if (name === "NotReadableError" || name === "TrackStartError") return "MICROPHONE IN USE BY ANOTHER APP.";
  return "MICROPHONE FAILED TO START.";
}

async function ensureGUMPermission() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: false,
  });
  return stream;
}

async function resumeP5AudioContext() {
  try { await userStartAudio(); } catch (e) {}
  try { const ctx = getAudioContext(); if (ctx && ctx.state !== "running") await ctx.resume(); } catch (e) {}
}

async function enableMic() {
  if (micEnabled || micDenied || micStarting) return;
  micStarting = true;
  setMicStatus("REQUESTING MICROPHONE…");
  let gumStream = null;
  try {
    await resumeP5AudioContext();
    gumStream = await ensureGUMPermission();
    setMicStatus("MICROPHONE ENABLED.");
    if (!mic) mic = new p5.AudioIn();
    await new Promise((r) => setTimeout(r, 50));
    mic.start(() => {
        micEnabled = true; micDenied = false;
        if (!fft) fft = new p5.FFT(0.82, 1024);
        fft.setInput(mic);
        setMicStatus("MICROPHONE ENABLED.");
        micStarting = false;
        try { if (gumStream) gumStream.getTracks().forEach((t) => t.stop()); } catch (e) {}
      },
      (err) => {
        micEnabled = false; micDenied = true; micStarting = false;
        setMicStatus(getFriendlyMicError(err));
        try { if (gumStream) gumStream.getTracks().forEach((t) => t.stop()); } catch (e) {}
      }
    );
  } catch (err) {
    micEnabled = false; micDenied = true; micStarting = false;
    setMicStatus(getFriendlyMicError(err));
    try { if (gumStream) gumStream.getTracks().forEach((t) => t.stop()); } catch (e) {}
  }
}

function getMicAmp() {
  if (!micEnabled || !mic) return 0;
  const lvl = mic.getLevel();
  const boosted = lvl * 175;
  const compressed = 1 - Math.exp(-boosted * 1.05);
  const floor = 0.02;
  return clamp01(Math.max(0, compressed - floor) / (1 - floor));
}

function getSpectralEnergy() {
  if (!micEnabled || !fft) return { centroid: 0.25, bass: 0, mid: 0, treble: 0 };
  const spectrum = fft.analyze();
  const centroid = clamp01(fft.getCentroid() / 8000);
  const n = spectrum.length;
  const band = (a, b) => {
    const ia = Math.floor(a * n), ib = Math.floor(b * n);
    let sum = 0;
    for (let i = ia; i < ib; i++) sum += spectrum[i];
    return clamp01((sum / Math.max(1, ib - ia)) / 255);
  };
  return { centroid, bass: band(0.0, 0.1), mid: band(0.1, 0.35), treble: band(0.35, 0.9) };
}

function closeMicGate() {
  if (micGateEl) micGateEl.classList.add("is-hidden");
  document.body.classList.remove("no-scroll");
  try { if (location.hash) history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  try { window.scrollTo(0, 0); } catch (e) {}
}

// =====================================================
// ANCHORS / SCROLL STATE
// =====================================================
function computeStoryAnchors() {
  dissolveZoneEl = document.getElementById("dissolveZone");
  silenceSectionEl = document.getElementById("silenceSection");
  chaosSectionEl = document.getElementById("chaosSection");
  waterSectionEl = document.getElementById("waterSection");
  vibeGapEl = document.querySelector(".vibe-gap");
  vibeSectionEl = document.getElementById("vibeSection");
  theorySectionEl = document.getElementById("theorySection");
  timelineSectionEl = document.getElementById("timelineSection");
  periodsSectionEl = document.getElementById("periodsSection");

  try {
    if (silenceSectionEl) silenceSectionEl.style.height = "420vh";
    if (waterSectionEl) waterSectionEl.style.height = "360vh";
  } catch (e) {}

  SILENCE_START_PX = silenceSectionEl ? silenceSectionEl.offsetTop : window.innerHeight * 2.2;
  CHAOS_START_PX = chaosSectionEl ? chaosSectionEl.offsetTop : SILENCE_START_PX + window.innerHeight * 1.2;
  WATER_START_PX = waterSectionEl ? waterSectionEl.offsetTop : CHAOS_START_PX + window.innerHeight * 1.2;
  VIBE_GAP_START_PX = vibeGapEl ? vibeGapEl.offsetTop : WATER_START_PX + window.innerHeight * 1.2;
  VIBE_START_PX = vibeSectionEl ? vibeSectionEl.offsetTop : WATER_START_PX + window.innerHeight * 1.2;
  THEORY_START_PX = theorySectionEl ? theorySectionEl.offsetTop : VIBE_START_PX + window.innerHeight * 4.0;
  DISSOLVE_RANGE_PX = Math.max(1, SILENCE_START_PX);
}

// =====================================================
// UI LOGIC
// =====================================================
function updateSilencePinned() {
  if (!silenceSectionEl) return;
  const p = getPinnedProgress(silenceSectionEl);
  if (p < 0) return;

  const q1In = remap01(p, 0.05, 0.14);
  const q1HoldStart = 0.14; const q1HoldEnd = 0.56;
  const q1Out = remap01(p, 0.56, 0.64);
  let q1 = p < q1HoldStart ? q1In : p < q1HoldEnd ? 1 : 1 - q1Out;

  const q2In = remap01(p, 0.66, 0.74);
  const q2HoldStart = 0.74; const q2HoldEnd = 0.965;
  const q2Out = remap01(p, 0.965, 0.995);
  let q2 = p < q2HoldStart ? q2In : p < q2HoldEnd ? 1 : 1 - q2Out;

  applyRevealAbsCentered(silenceQ1El, q1);
  applyRevealAbsCentered(silenceQ2El, q2);
}

function getWaterEffectStrength() {
  if (!waterSectionEl) return 0;
  const p = getPinnedProgress(waterSectionEl);
  if (p < 0) return 0;
  const inS = easeSoft(remap01(p, 0.08, 0.20));
  const outS = 1 - easeSoft(remap01(p, 0.88, 0.985));
  return clamp01(Math.min(1, inS) * Math.min(1, outS));
}

function updateWaterPinnedText() {
  if (!waterSectionEl || !waterQuoteEl) return;
  const p = getPinnedProgress(waterSectionEl);
  if (p < 0) return;
  const wIn = remap01(p, 0.10, 0.22);
  const wHoldEnd = 0.86;
  const wOut = remap01(p, 0.86, 0.97);
  let w = p < 0.22 ? wIn : p < wHoldEnd ? 1 : 1 - wOut;
  applyRevealFlowCentered(waterQuoteEl, w);
}

function updateVibePinned() {
  if (!vibeSectionEl) return;
  const p = getPinnedProgress(vibeSectionEl);
  if (p < 0) return;
  const inT = remap01(p, 0.10, 0.20);
  const outT = remap01(p, 0.36, 0.46);
  let introA = p < 0.20 ? inT : p < 0.36 ? 1 : 1 - outT;
  applyRevealCentered(vibeIntroEl, introA);

  const capIn = remap01(p, 0.52, 0.62);
  const capOut = remap01(p, 0.86, 0.94);
  let capA = p < 0.62 ? capIn : p < 0.86 ? 1 : 1 - capOut;

  if (vibeCaptionEl) {
    const t = easeSoft(capA);
    const blur = (1 - t) * 1.2;
    vibeCaptionEl.style.opacity = String(t);
    vibeCaptionEl.style.filter = `blur(${blur}px)`;
    vibeCaptionEl.style.transform = `translateX(-50%) translateY(${(1 - t) * 10}px)`;
  }
}

function updateTheoryFadeAndTheme() {
  if (!vibeSectionEl) return;
  const p = getPinnedProgress(vibeSectionEl);
  if (p < 0) return;
  const TRANSITION_START = 0.82;
  const TRANSITION_END = 0.99;
  const totalSpan = TRANSITION_END - TRANSITION_START;
  const whiteEnd = TRANSITION_START + totalSpan * 0.62;
  const whiteT = easeSoft(remap01(p, TRANSITION_START, whiteEnd));
  const textT = easeSoft(remap01(p, whiteEnd, TRANSITION_END));

  try {
    document.documentElement.style.setProperty("--theoryWhite", String(whiteT));
    document.documentElement.style.setProperty("--theoryText", String(textT));
  } catch (e) {}

  if (!enteredLight && whiteT > 0.02) {
    enteredLight = true;
    document.body.classList.add("is-light");
  }
  if (enteredLight && whiteT < 0.01) {
    enteredLight = false;
    document.body.classList.remove("is-light");
  }
}

function updateUIStates() {
  const y = window.scrollY || 0;
  if (y > 10) document.body.classList.add("is-scrolled");
  else document.body.classList.remove("is-scrolled");
  dissolveProgress = clamp01(y / DISSOLVE_RANGE_PX);

  updateSilencePinned();
  updateWaterPinnedText();
  updateVibePinned();
  updateTheoryFadeAndTheme();
  updateTimelineByPinnedScroll();
   
  // Update White Breath Trigger Logic
  checkWhiteBreathTrigger();
}

function setupScroll() {
  computeStoryAnchors();
  updateUIStates();
  window.addEventListener("scroll", updateUIStates, { passive: true });
  window.addEventListener("resize", () => {
    updateParticleTuning();
    computeStoryAnchors();
    updateUIStates();
    if (img) buildBustDots();
    buildChaosField();
    buildWaterDotsField();
    buildCymaticsDots();
    computeTimelineAnchorsRobust();
    resizeChaosCanvas();
    resizePhospheneCanvas();
    resizeWhiteGlowCanvas();
  });
}

function loadBustImage() {
  loadImage("images/busta_helen.png",
    (loadedImg) => {
      img = loadedImg;
      updateParticleTuning();
      buildBustDots();
      buildChaosField();
      buildWaterDotsField();
      buildCymaticsDots();
      cymBuilt = true;
      requestAnimationFrame(() => hideLoader());
      try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => computeTimelineAnchorsRobust()); } catch (e) {}
    },
    () => showLoaderError("FAILED TO LOAD IMAGE")
  );
}

// =====================================================
// TIMELINE
// =====================================================
let timelineFlipped = true;
function setupTimeline() {
  timelineEl = document.getElementById("timeline");
  if (!timelineEl) return;
  stageEl = timelineEl.querySelector(".timeline__stage");
  ellipseSvg = timelineEl.querySelector(".timeline__ellipse");
  ellipseEl = timelineEl.querySelector(".timeline__ellipse ellipse");
  tItems = Array.from(timelineEl.querySelectorAll(".timeline__item"));

  const xPercents = [0.14, 0.38, 0.62, 0.86];
  const lineLens = [280, 460, 380, 280];

  tItems.forEach((it, i) => {
    it.style.setProperty("--x", `${xPercents[i] * 100}%`);
    it.style.setProperty("--lineLen", `${lineLens[i]}px`);
    it.style.setProperty("--lineProg", "0");
    it.style.setProperty("--labelOpacity", "0");
  });

  if (ellipseSvg) {
    ellipseSvg.style.transform = "translateX(-50%) scaleX(-1)";
    ellipseSvg.style.transformOrigin = "50% 50%";
  }
  if (ellipseEl) ellipseEl.style.strokeDashoffset = "3000";

  computeTimelineAnchorsRobust();
  installTimelineObservers();
}

function installTimelineObservers() {
  if (!stageEl) return;
  try {
    const ro = new ResizeObserver(() => computeTimelineAnchorsRobust());
    ro.observe(stageEl);
  } catch (e) {}
  setTimeout(computeTimelineAnchorsRobust, 150);
}

function computeTimelineAnchorsRobust() {
  if (!stageEl || !ellipseSvg || !tItems || tItems.length === 0) return;
  const stageRect = stageEl.getBoundingClientRect();
  const svgRect = ellipseSvg.getBoundingClientRect();
  const vbW = 1000, vbH = 360, cx0 = 500, cy0 = 180, rx = 460, ry = 150;

  tItems.forEach((it, idx) => {
    const xPercent = parseFloat(getComputedStyle(it).getPropertyValue("--x")) / 100;
    const clientX = stageRect.left + xPercent * stageRect.width;
    let nx = clamp01((clientX - svgRect.left) / Math.max(1, svgRect.width));
    let xSvg = timelineFlipped ? vbW - nx * vbW : nx * vbW;
     
    const dx = (xSvg - cx0) / rx;
    const inside = 1 - dx * dx;
    let ySvg = inside <= 0 ? cy0 + ry : cy0 + ry * Math.sqrt(inside);
     
    const ny = ySvg / vbH;
    const clientY = svgRect.top + ny * svgRect.height;
    let anchorBottom = stageRect.bottom - clientY;
    anchorBottom = Math.max(0, anchorBottom + 1 + (idx === 0 || idx === tItems.length - 1 ? 2 : 0));
    it.style.setProperty("--anchorBottom", `${Math.round(anchorBottom)}px`);
  });
}

function updateTimelineByPinnedScroll() {
  if (!timelineSectionEl || !timelineEl || !ellipseEl || tItems.length === 0) return;
  const p = getPinnedProgress(timelineSectionEl);
  if (p < 0) return;

  timelineEl.classList.add("is-on");
  const eP = clamp01(p / 0.22);
  ellipseEl.style.strokeDashoffset = String(3000 * (1 - eP));

  const itemBlock = 0.17;
  const start0 = 0.26;
  tItems.forEach((it, idx) => {
    const start = start0 + idx * itemBlock;
    const t = clamp01((p - start) / itemBlock);
    const linePhase = 0.65;
    const lineProg = clamp01(t / linePhase);
    const textProg = clamp01((t - linePhase) / (1 - linePhase));
    it.style.setProperty("--lineProg", String(lineProg));
    it.style.setProperty("--labelOpacity", String(textProg));
  });
}

function setupPeriods() {
  const items = Array.from(document.querySelectorAll(".js-period"));
  if (items.length === 0) return;
  const toggle = (el) => {
    const isOpen = el.classList.contains("is-open");
    items.forEach((i) => i.classList.remove("is-open"));
    if (!isOpen) el.classList.add("is-open");
  };
  items.forEach((el) => {
    const bar = el.querySelector(".period__bar");
    if (bar) {
      bar.style.cursor = "pointer";
      bar.addEventListener("click", () => toggle(el));
    }
  });
}

// =====================================================
// CHAOS CANVAS
// =====================================================
function setupChaosCanvas() {
  chaosWrapEl = document.getElementById("chaosWrap");
  if (!chaosWrapEl) return;
  chaosWrapEl.style.zIndex = "0";
  chaosWrapEl.style.pointerEvents = "none";
  chaosCanvas = document.createElement("canvas");
  chaosCanvas.setAttribute("aria-hidden", "true");
  chaosCanvas.style.width = "100%";
  chaosCanvas.style.height = "100%";
  chaosCanvas.style.display = "block";
  chaosWrapEl.appendChild(chaosCanvas);
  chaosCtx = chaosCanvas.getContext("2d", { alpha: true, desynchronized: true });
  resizeChaosCanvas();
}

function resizeChaosCanvas() {
  if (!chaosCanvas) return;
  chaosCanvas.width = window.innerWidth;
  chaosCanvas.height = window.innerHeight;
}

// =====================================================
// PHOSPHENE SYSTEM (Dark Mode Lights)
// =====================================================
function setupPhosphenes() {
  const wrap = document.getElementById("phospheneWrap");
  phospheneCanvas = document.getElementById("phospheneCanvas");
  if (!wrap || !phospheneCanvas) return;
  phospheneCtx = phospheneCanvas.getContext("2d");
  resizePhospheneCanvas();
  animatePhosphenes();
}

function resizePhospheneCanvas() {
  if (!phospheneCanvas) return;
  phospheneW = phospheneCanvas.width = window.innerWidth;
  phospheneH = phospheneCanvas.height = window.innerHeight;
}

function shouldShowPhosphenes() {
  if (document.body.classList.contains("is-light")) return false;
   
  // UPRAVENO: Efekt je aktivní před vodou A TAKÉ v mezeře mezi vodou a zvukem
  const y = window.scrollY || 0;
  const inZone1 = (y > SILENCE_START_PX && y < WATER_START_PX);
  const inZone2 = (y > VIBE_GAP_START_PX && y < VIBE_START_PX);
  return (inZone1 || inZone2);
}

class Phosphene {
  constructor() {
    this.init();
  }

  init() {
    const type = Math.random();
    this.x = Math.random() * phospheneW;
    this.y = Math.random() * phospheneH;
     
    const hue = 230 + Math.random() * 20; 
    const lightness = 30 + Math.random() * 15;
    this.color = `hsla(${hue}, 100%, ${lightness}%,`; 
     
    this.life = 0;
    this.active = true;

    // Random phase for pulsing
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.05 + Math.random() * 0.1;

    if (type < 0.7) {
      // Zjemnění "Breath" typu (kulaté záblesky)
      this.radius = Math.min(phospheneW, phospheneH) * (0.35 + Math.random() * 0.45); 
      this.maxAlpha = 0.015 + Math.random() * 0.035; 
      this.maxLife = 200 + Math.random() * 200; 
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    } else {
      // Blob (více nepravidelné)
      this.radius = 50 + Math.random() * 150;
      this.maxAlpha = 0.08 + Math.random() * 0.15; 
      this.maxLife = 100 + Math.random() * 150; 
      this.vx = (Math.random() - 0.5) * 4; 
      this.vy = (Math.random() - 0.5) * 4;
    }
  }

  update() {
    this.life++;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -200 || this.x > phospheneW + 200) this.vx *= -1;
    if (this.y < -200 || this.y > phospheneH + 200) this.vy *= -1;

    const progress = this.life / this.maxLife;
     
    // Base breath
    let alpha = Math.sin(progress * Math.PI) * this.maxAlpha;
     
    // Pulse effect (modulate alpha)
    const pulse = 1 + 0.3 * Math.sin(this.life * this.pulseSpeed + this.pulsePhase);
    this.alpha = alpha * pulse;

    if (this.life >= this.maxLife) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.globalCompositeOperation = 'lighter'; 
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, this.color + this.alpha + ')'); 
    gradient.addColorStop(1, this.color + '0)'); 
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
}

function animatePhosphenes() {
  if (!phospheneCtx) return;
  const show = shouldShowPhosphenes();

  phospheneCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
  phospheneCtx.fillRect(0, 0, phospheneW, phospheneH);

  if (show) {
      if (phospheneLights.length < MAX_PHOSPHENES && Math.random() < 0.02) {
          phospheneLights.push(new Phosphene());
      }
  }

  for (let i = phospheneLights.length - 1; i >= 0; i--) {
      const light = phospheneLights[i];
      light.update();
      light.draw(phospheneCtx);
      if (!light.active) phospheneLights.splice(i, 1);
  }

  phospheneRAF = requestAnimationFrame(animatePhosphenes);
}

// =====================================================
// WHITE GLOW SYSTEM (Periods Section Signal)
// =====================================================
function setupWhiteGlow() {
  const wrap = document.getElementById("whiteGlowWrap");
  whiteGlowCanvas = document.getElementById("whiteGlowCanvas");
  if (!wrap || !whiteGlowCanvas) return;
  whiteGlowCtx = whiteGlowCanvas.getContext("2d");
  resizeWhiteGlowCanvas();
  animateWhiteGlow();
}

function resizeWhiteGlowCanvas() {
  if (!whiteGlowCanvas) return;
  whiteGlowW = whiteGlowCanvas.width = window.innerWidth;
  whiteGlowH = whiteGlowCanvas.height = window.innerHeight;
}

function checkWhiteBreathTrigger() {
  if (!periodsSectionEl) return;
  const rect = periodsSectionEl.getBoundingClientRect();
  const vh = window.innerHeight;
   
  // Is periods section significantly visible? (middle 40% of screen)
  const isVisible = (rect.top < vh * 0.7 && rect.bottom > vh * 0.3);

  if (isVisible) {
     if (!hasTriggeredWhiteGlow && !whiteGlowActive) {
        // Start animation if visible and not yet triggered
        hasTriggeredWhiteGlow = true;
        whiteGlowActive = true;
        startWhiteBreath();
     }
  } else {
     // UPRAVENO: Pokud není významně viditelná, okamžitě efekt zastav.
     // Tím se zabrání tomu, aby "jel dolů" s uživatelem.
     whiteGlowActive = false;
  }
}

let whiteBreath = { alpha: 0, time: 0, x: 0, y: 0 };

function startWhiteBreath() {
  whiteBreath.time = 0;
  // Vyjíždí z levé strany
  whiteBreath.x = whiteGlowW * 0.15;
  whiteBreath.y = whiteGlowH * (0.4 + Math.random() * 0.2);
}

function animateWhiteGlow() {
  if (!whiteGlowCtx) return;

  // Vždy vyčistit canvas
  whiteGlowCtx.clearRect(0, 0, whiteGlowW, whiteGlowH);

  if (whiteGlowActive) {
    whiteBreath.time += 0.04; // Speed of breath

    // UPRAVENO: 3 nádechy (cca Math.PI * 3) a pak zmizet
    if (whiteBreath.time > Math.PI * 3) { 
       whiteGlowActive = false;
       whiteBreath.alpha = 0;
    } else {
       const sine = Math.sin(whiteBreath.time);
       if (sine < 0) {
           whiteBreath.alpha = 0;
       } else {
           // Výraznější efekt
           whiteBreath.alpha = sine * 0.35; 
       }
    }

    if (whiteBreath.alpha > 0.001) {
       const color = `hsla(220, 80%, 50%, ${whiteBreath.alpha})`;
       
       // UPRAVENO: Větší poloměr, aby efekt zasahoval dále přes sekci
       const r = Math.max(whiteGlowW, whiteGlowH) * 0.8;
       const grad = whiteGlowCtx.createRadialGradient(
           whiteBreath.x, whiteBreath.y, 0,
           whiteBreath.x, whiteBreath.y, r
       );
       grad.addColorStop(0, color);
       grad.addColorStop(1, "hsla(220, 80%, 50%, 0)");

       whiteGlowCtx.fillStyle = grad;
       whiteGlowCtx.fillRect(0, 0, whiteGlowW, whiteGlowH);
    }
  }

  whiteGlowRAF = requestAnimationFrame(animateWhiteGlow);
}

// =====================================================
// p5 SETUP (Updated to include new setups)
// =====================================================
function setup() {
  document.body.classList.remove("is-light");
  document.body.classList.remove("is-scrolled");
  enteredLight = false;
  try {
    document.documentElement.style.setProperty("--theoryWhite", "0");
    document.documentElement.style.setProperty("--theoryText", "0");
  } catch (e) {}

  loaderEl = document.getElementById("loader");
  loaderTextEl = document.getElementById("loaderText");
  micGateEl = document.getElementById("micGate");
  micEnableBtnEl = document.getElementById("micEnableBtn");
  micSkipBtnEl = document.getElementById("micSkipBtn");
  micStatusEl = document.getElementById("micStatus");
  setMicStatus("");

  if (micGateEl) micGateEl.classList.remove("is-hidden");
  document.body.classList.add("no-scroll");

  silenceQ1El = document.getElementById("silenceQuote1");
  silenceQ2El = document.getElementById("silenceQuote2");
  waterQuoteEl = document.getElementById("waterQuote");
  vibeIntroEl = document.getElementById("vibeIntro");
  vibeCaptionEl = document.getElementById("vibeCaption");
  if (vibeCaptionEl) vibeCaptionEl.textContent = "SOUNDS BECAME SIGNALS - VIBRATIONS I COULD READ WITH MY SKIN.";

  if (micEnableBtnEl) micEnableBtnEl.addEventListener("click", async () => {
    await enableMic();
    closeMicGate();
  });
  if (micSkipBtnEl) micSkipBtnEl.addEventListener("click", () => closeMicGate());

  createCanvas(windowWidth, windowHeight).parent("sketchWrap");
  pixelDensity(1);
  noStroke();

  updateParticleTuning();
  setupChaosCanvas();
  setupPhosphenes(); // Dark mode lights
  setupWhiteGlow(); // White mode signals
  setupTimeline();
  setupPeriods();
  setupScroll();
  loadBustImage();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateParticleTuning();
  computeStoryAnchors();
  if (img) buildBustDots();
  buildChaosField();
  buildWaterDotsField();
  buildCymaticsDots();
  computeTimelineAnchorsRobust();
  resizeChaosCanvas();
  resizePhospheneCanvas();
  resizeWhiteGlowCanvas();
}

// =====================================================
// BUST
// =====================================================
function buildBustDots() {
  if (!img) return;
  bustDots = [];
  const temp = img.get();
  const maxSize = 650;
  if (temp.width > temp.height && temp.width > maxSize) temp.resize(maxSize, 0);
  else if (temp.height >= temp.width && temp.height > maxSize) temp.resize(0, maxSize);
  temp.loadPixels();

  const maxW = width * 0.92;
  const maxH = height * 0.92;
  let scaleFactor = Math.min(maxW / temp.width, maxH / temp.height) * IMAGE_AREA_SCALE;
  const dispW = temp.width * scaleFactor;
  const dispH = temp.height * scaleFactor;
  const targetCx = width * TARGET_CENTER_X;
  const targetCy = height * TARGET_CENTER_Y;
  const offsetX = targetCx - dispW / 2;
  const offsetY = targetCy - dispH / 2;

  imgCenterX = offsetX + dispW / 2;
  imgCenterY = offsetY + dispH / 2;
  maxDistFromCenter = 0;

  const initialSpread = Math.min(width, height) * 0.34;
  const dissolveSpread = Math.max(width, height) * 0.95;

  for (let y = 0; y < temp.height; y += cellSize) {
    for (let x = 0; x < temp.width; x += cellSize) {
      const idx = 4 * (y * temp.width + x);
      if (temp.pixels[idx + 3] < 10) continue;
      const bright = (temp.pixels[idx] + temp.pixels[idx + 1] + temp.pixels[idx + 2]) / 3;
      const strength = 1 - bright / 255.0;
      if (strength < 0.02) continue;

      const bx = offsetX + x * scaleFactor;
      const by = offsetY + y * scaleFactor;
      const size = map(strength, 0, 1, 1.2, cellSize * 1.15);
      const a1 = random(TWO_PI);
      const ix = bx + cos(a1) * initialSpread;
      const iy = by + sin(a1) * initialSpread;
      const a2 = random(TWO_PI);
      const dx = bx + cos(a2) * dissolveSpread * (0.8 + random(0.5));
      const dy = by + sin(a2) * dissolveSpread * (0.8 + random(0.5));

      const distToCenter = dist(bx, by, imgCenterX, imgCenterY);
      if (distToCenter > maxDistFromCenter) maxDistFromCenter = distToCenter;

      bustDots.push({ bx, by, ix, iy, dx, dy, cx: ix, cy: iy, size, state: "scattered", jitterSeed: random(1000), distToCenter });
    }
  }
}

function drawBust() {
  if (!img || bustDots.length === 0) return;
  const dotCol = 245;
  const hovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  const allowHoverAssemble = dissolveProgress === 0;
  const radius = Math.min(width, height) * 0.3;
  rectMode(CENTER);

  for (let d of bustDots) {
    let targetX = d.ix;
    let targetY = d.iy;

    if (d.state === "scattered") {
      const amp = 2.2;
      const tt = frameCount * 0.03 + d.jitterSeed;
      targetX = d.ix + sin(tt) * amp;
      targetY = d.iy + cos(tt * 1.2) * amp;
    }

    if (allowHoverAssemble && hovering) {
      const distToMouse = dist(mouseX, mouseY, d.bx, d.by);
      if (distToMouse < radius) {
        const f = 1 - distToMouse / radius;
        targetX = lerp(d.ix, d.bx, f);
        targetY = lerp(d.iy, d.by, f);
        if (f > 0.8) d.state = "assembled";
        else if (d.state !== "assembled") d.state = "assembling";
      }
    }

    if (d.state === "assembled" && dissolveProgress === 0) {
      const amp = 1.5;
      const tt = frameCount * 0.05 + d.jitterSeed;
      targetX = d.bx + sin(tt) * amp;
      targetY = d.by + cos(tt * 1.3) * amp;
    }

    let alpha = 255;
    if (dissolveProgress > 0) {
      const edgeFactor = d.distToCenter / maxDistFromCenter;
      const start = (1 - edgeFactor) * 0.55;
      const local = constrain((dissolveProgress - start) / (1 - start), 0, 1);
      targetX = lerp(d.bx, d.dx, local);
      targetY = lerp(d.by, d.dy, local);
      alpha = 255 * (1 - local);
      d.cx = lerp(d.cx, targetX, 0.03);
      d.cy = lerp(d.cy, targetY, 0.03);
      if (alpha > 0.8) {
        fill(dotCol, alpha);
        rect(d.cx, d.cy, d.size * (0.12 + 0.88 * (1 - local)), d.size * (0.12 + 0.88 * (1 - local)));
      }
      continue;
    }

    const speed = d.state === "assembled" || d.state === "assembling" ? 0.28 : 0.03;
    d.cx = lerp(d.cx, targetX, speed);
    d.cy = lerp(d.cy, targetY, speed);
    fill(dotCol, alpha);
    rect(d.cx, d.cy, d.size, d.size);
  }
}

// =====================================================
// CHAOS DRAW
// =====================================================
function buildChaosField() {
  chaosPts = [];
  for (let y = 0; y < height; y += chaosGrid) {
    for (let x = 0; x < width; x += chaosGrid) {
      chaosPts.push({ x, y, seed: random(1000) });
    }
  }
}

function drawChaosPixelsToCtx(strength) {
  if (!chaosCtx || !chaosCanvas) return;
  chaosCtx.clearRect(0, 0, chaosCanvas.width, chaosCanvas.height);
  if (chaosPts.length === 0 || strength <= 0.001) return;
  if (document.body.classList.contains("is-light")) return;

  const tt = frameCount * 0.020;
  const baseGray = 18;
  const density = 0.42;

  for (let i = 0; i < chaosPts.length; i++) {
    const p = chaosPts[i];
    const n = noise(p.seed * 0.05, tt);
    const pulse = (0.55 + 0.45 * Math.sin(p.seed * 0.8 + frameCount * 0.055)) * 0.55 + n * 0.45;
    if (random() > density * (0.40 + 0.60 * pulse)) continue;
    const a = (38 + 88 * (0.55 + 0.45 * pulse)) * strength;
    if (a < 2) continue;
    chaosCtx.fillStyle = `rgba(${baseGray},${baseGray},${baseGray},${Math.min(1, a / 255)})`;
    chaosCtx.fillRect(p.x, p.y, chaosGrid, chaosGrid);
  }
}

function getGlobalChaosOverlayStrength() {
  if (document.body.classList.contains("is-light")) return 0;
  const y = window.scrollY || 0;
  if (y < SILENCE_START_PX) return 0;
  const base = 0.78;
  const fadeOutStart = THEORY_START_PX - window.innerHeight * 0.85;
  const fadeOutEnd = THEORY_START_PX - window.innerHeight * 0.10;
  const fade = 1 - easeSoft(remap01(y, fadeOutStart, fadeOutEnd));
  return clamp01(base * fade);
}

// =====================================================
// WATER
// =====================================================
function buildWaterDotsField() {
  waterDots = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const waterRadius = Math.min(width, height) * 1.5;
  for (let y = 0; y < height; y += gridStep) {
    for (let x = 0; x < width; x += gridStep) {
      if (dist(x, y, centerX, centerY) > waterRadius) continue;
      waterDots.push({ bx: x, by: y, cx: x, cy: y, size: random(gridStep * 0.4, gridStep * 0.9) });
    }
  }
}

function mouseMoved() {
  const y = window.scrollY || 0;
  if (!(y >= WATER_START_PX && y < VIBE_GAP_START_PX)) return;
  const strength = getWaterEffectStrength();
  if (strength < 0.12) return;

  const now = millis();
  ripples.push({ x: mouseX, y: mouseY, born: now });
  if (ripples.length > 20) ripples.shift();

  let dirX = mouseX - pmouseX;
  let dirY = mouseY - pmouseY;
  const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
  dirX /= len; dirY /= len;
  const count = Math.floor(map(dist(mouseX, mouseY, pmouseX, pmouseY), 0, 40, 1, 6, true));
   
  for (let i = 0; i < count; i++) {
    const baseV = random(1.0, 3.0);
    trailParticles.push({
      x: mouseX + random(-6, 6), y: mouseY + random(-6, 6),
      vx: dirX * baseV + random(-0.3, 0.3), vy: dirY * baseV + random(-0.3, 0.3),
      life: 0, maxLife: random(30, 70), size: random(2, 4)
    });
  }
  if (trailParticles.length > 250) trailParticles.splice(0, trailParticles.length - 250);
}

function drawRippleDots(strength) {
  if (waterDots.length === 0 || ripples.length === 0) return;
  const now = millis();
  const maxRippleAge = 1500;
  ripples = ripples.filter((r) => now - r.born < maxRippleAge);
  rectMode(CENTER);

  for (let d of waterDots) {
    let ox = 0, oy = 0, s = 0;
    for (let r of ripples) {
      const ageNorm = (now - r.born) / maxRippleAge;
      const distToCenter = dist(d.bx, d.by, r.x, r.y);
      const maxRadius = Math.min(width, height) * 0.45;
      if (distToCenter > maxRadius) continue;
       
      const wave = sin(distToCenter * 0.045 - (now - r.born) * 0.025) * (1 - distToCenter / maxRadius) * (1 - ageNorm);
      let dx = d.bx - r.x, dy = d.by - r.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      ox += (dx / len) * wave * 22;
      oy += (dy / len) * wave * 22;
      s = Math.max(s, Math.abs(wave) * (1 - ageNorm));
    }
    if (s < 0.15) continue;
    d.cx = lerp(d.cx, d.bx + ox, 0.3);
    d.cy = lerp(d.cy, d.by + oy, 0.3);
    const alpha = map(s, 0.15, 1, 80, 255, true) * strength;
    if (alpha < 2) continue;
    const finalSize = d.size * map(s, 0.15, 1, 0.6, 1.4, true);
    fill(255, alpha);
    rect(d.cx, d.cy, finalSize, finalSize);
  }
}

function drawTrailParticles(strength) {
  rectMode(CENTER);
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const p = trailParticles[i];
    p.life++;
    const lifeNorm = p.life / p.maxLife;
    if (lifeNorm >= 1) { trailParticles.splice(i, 1); continue; }
    p.x += p.vx + random(-0.7, 0.7) * (1 - lifeNorm);
    p.y += p.vy + random(-0.7, 0.7) * (1 - lifeNorm);
    const alpha = 255 * (1 - lifeNorm) * strength;
    if (alpha < 2) { if (strength < 0.2) trailParticles.splice(i, 1); continue; }
    const bright = 210 + 45 * (1 - lifeNorm);
    fill(bright, bright, bright, alpha);
    rect(p.x, p.y, p.size, p.size);
  }
}

// =====================================================
// CYMATICS
// =====================================================
function buildCymaticsDots() {
  cymDots = [];
  const area = getCymArea();
  const count = Math.floor(Math.min(32000, Math.max(6500, Math.max(1, width * area.usableH) / 45)));
  const scatter = Math.max(width, area.usableH) * 1.08;
  for (let i = 0; i < count; i++) {
    const ang = random(TWO_PI);
    const rad = area.plateR * Math.sqrt(random());
    const bx = area.cx + Math.cos(ang) * rad + random(-4, 4);
    const by = area.cy + Math.sin(ang) * rad + random(-4, 4);
    const a2 = random(TWO_PI);
    cymDots.push({
      bx, by, cx: bx, cy: by,
      dx: bx + Math.cos(a2) * scatter * (0.55 + random(0.55)),
      dy: by + Math.sin(a2) * scatter * (0.55 + random(0.55)),
      size: random(1.0, 3.0), seed: random(10000)
    });
  }
}

function cymFieldPx(x, y, n, m, k, phase) {
  const area = getCymArea();
  const dx = x - area.cx, dy = y - area.cy;
  const r = Math.sqrt(dx * dx + dy * dy) / (Math.min(width, area.usableH) * 0.36);
  const a = Math.atan2(dy, dx);
  const v1 = Math.sin(n * a + phase) * 0.95;
  const v2 = Math.cos(m * a - phase * 0.6) * 0.8;
  const v3 = Math.sin((n + m) * a * 0.5 + phase * 0.22) * 0.38;
  const vr1 = Math.cos(k * 7.1 * r + phase * 0.4);
  const vr2 = Math.cos(k * 3.6 * r - phase * 0.18) * 0.48;
  return (v1 + v2 + v3) * vr1 + vr2;
}

function updateCymaticsMode() {
  const amp = getMicAmp();
  smoothMic = lerp(smoothMic, amp, 0.45);
  const spec = micEnabled ? getSpectralEnergy() : { centroid: 0.26, bass: 0.12, mid: 0.1, treble: 0.08 };
   
  if (modeHold <= 0) {
    modeA = { ...modeB };
    const c = spec.centroid;
    const base = c < 0.18 ? 2 : c < 0.32 ? 3 : c < 0.48 ? 4 : c < 0.62 ? 5 : c < 0.78 ? 6 : 7;
    const boost = amp > 0.55 ? 3 : amp > 0.28 ? 2 : amp > 0.12 ? 1 : 0;
    modeB = {
      n: Math.max(2, Math.min(11, base + (spec.bass > 0.18 ? 1 : 0) + boost)),
      m: Math.max(3, Math.min(14, base + 1 + (spec.treble > 0.14 ? 2 : 0) + boost)),
      k: Math.max(0.9, Math.min(2.9, 0.92 + spec.bass * 1.05 + amp * 1.10))
    };
    modeBlend = 0;
    modeHold = Math.floor(lerp(52, 6, smoothMic));
  } else {
    modeHold--;
    modeBlend = clamp01(modeBlend + 0.034 + smoothMic * 0.11);
  }
}

function drawCymaticsDots() {
  if (!vibeSectionEl || !cymBuilt || cymDots.length === 0) return;
  const p = getPinnedProgress(vibeSectionEl);
  if (p < 0) return;
  const on = easeSoft(remap01(p, 0.50, 0.62));
  if (on <= 0.001) return;
   
  const dP = easeSoft(remap01(p, 0.935, 0.995));
  const whiteFade = easeSoft(remap01(p, 0.82, 0.90));
  const globalAlpha = (1 - whiteFade) * (1 - dP) * on;
  if (globalAlpha <= 0.001) return;

  updateCymaticsMode();
  const n = Math.round(lerp(modeA.n, modeB.n, modeBlend));
  const m = Math.round(lerp(modeA.m, modeB.m, modeBlend));
  const k = lerp(modeA.k, modeB.k, modeBlend);
  const phase = frameCount * (0.011 + smoothMic * 0.22);
  const area = getCymArea();

  const stepBase = 0.65 + smoothMic * 10.5;
  const jitter = 0.45 + smoothMic * 5.4;
  rectMode(CENTER);
  noStroke();

  const sh = smoothMic * 16.0;
  const sx = (noise(frameCount * 0.06) - 0.5) * sh;
  const sy = (noise(999 + frameCount * 0.06) - 0.5) * sh;

  // sparkles
  for (let i = 0; i < Math.floor(12 + smoothMic * 78); i++) {
    const ang = random(TWO_PI), rad = area.plateR * Math.sqrt(random());
    const x = area.cx + Math.cos(ang) * rad + sx * 0.25, y = area.cy + Math.sin(ang) * rad + sy * 0.25;
    if (y > 0 && y < area.usableH) {
      const a = (24 + 135 * smoothMic) * globalAlpha;
      if (a > 2) { fill(255, a); rect(x, y, 1.6 + random(1.8), 1.6 + random(1.8)); }
    }
  }

  for (let d of cymDots) {
    if (dP < 0.985) {
      const ang = noise(d.seed * 0.001, frameCount * 0.01) * TWO_PI * 2.0;
      const ax = Math.cos(ang) * (stepBase + random(-0.45, 0.45)), ay = Math.sin(ang) * (stepBase + random(-0.45, 0.45));
      const v0 = Math.abs(cymFieldPx(d.cx, d.cy, n, m, k, phase));
      const x1 = d.cx + ax, y1 = d.cy + ay;
      const v1 = Math.abs(cymFieldPx(x1, y1, n, m, k, phase));
       
      if (v1 < v0 || random() < 0.14 + smoothMic * 0.26) { d.cx = lerp(d.cx, x1, 0.90); d.cy = lerp(d.cy, y1, 0.90); }
      else { d.cx = lerp(d.cx, d.cx + ax * 0.22, 0.40); d.cy = lerp(d.cy, d.cy + ay * 0.22, 0.40); }
       
      d.cx += (noise(d.seed * 0.01, frameCount * 0.085) - 0.5) * jitter;
      d.cy += (noise(d.seed * 0.01 + 50, frameCount * 0.085) - 0.5) * jitter;
       
      const rr = dist(d.cx, d.cy, area.cx, area.cy);
      if (rr > area.plateR) { const s = area.plateR / Math.max(1, rr); d.cx = area.cx + (d.cx - area.cx) * s; d.cy = area.cy + (d.cy - area.cy) * s; }
      d.cy = constrain(d.cy, 0, area.usableH);
    }

    const drawX = lerp(d.cx, d.dx, dP) + sx;
    const drawY = lerp(d.cy, d.dy, dP) + sy;
    if (drawY < 0 || drawY > area.usableH) continue;
     
    const f = Math.abs(cymFieldPx(d.cx, d.cy, n, m, k, phase));
    const closeness = Math.exp(-f * (1.25 + smoothMic * 9.8));
    if (closeness < 0.040) continue;
    const a = (24 + 260 * Math.pow(closeness, 2.0)) * globalAlpha * (0.92 + smoothMic * 0.62);
    if (a < 2) continue;
    fill(255, a);
    rect(drawX, drawY, d.size, d.size);
  }
}

// =====================================================
// DRAW MAIN
// =====================================================
function draw() {
  background(21, 21, 21);
  const y = window.scrollY || 0;
  const inWater = y >= WATER_START_PX && y < VIBE_GAP_START_PX;
  if (wasInWater && !inWater) { ripples = []; trailParticles = []; }
  wasInWater = inWater;

  drawChaosPixelsToCtx(getGlobalChaosOverlayStrength());

  if (y < SILENCE_START_PX) { drawBust(); return; }
  if (y < WATER_START_PX) return; // Phosphenes active in background
  if (y < VIBE_GAP_START_PX) {
    const strength = getWaterEffectStrength();
    if (strength > 0.01) {
      drawRippleDots(strength);
      drawTrailParticles(strength);
      if (strength < 0.25) { ripples = ripples.slice(-8); trailParticles = trailParticles.slice(-120); }
    }
    return;
  }
  if (y < THEORY_START_PX) { drawCymaticsDots(); return; }
}