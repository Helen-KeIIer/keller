@font-face {
  font-family: "PPEikoThin";
  src: url("fonts/PPEiko-Thin.otf") format("opentype");
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: "NeueHaasLight";
  src: url("fonts/neuehaasgrotdisp-45light-trial.otf") format("opentype");
  font-weight: 300;
  font-style: normal;
}

:root{
  --bg:#151515;
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.72);
  --stroke: rgba(255,255,255,0.88);

  --pad-x:110px;
  --pad-b:110px;

  --quote-maxw: 1200px;
  --quote-size: clamp(44px, 5.6vw, 92px);
  --quote-tracking-haas: 0.065em;
  --quote-tracking-eiko: -0.02em;
  --quote-line-height: 1.0;
  --quote-gap: 15px;
  --quote-raise: -6vh;

  /* LIGHT (warm off-white) */
  --light-bg:#f1f0ec;
  --light-text: rgba(12,12,12,.92);
  --light-muted: rgba(12,12,12,.68);
  --light-stroke: rgba(12,12,12,.70);

  /* Layout */
  --theory-max: 1520px;
  --theory-top-pad: 88px;

  --theory-gap-1: 32px;
  --theory-gap-2: 44px;
  --theory-gap-block: 120px;

  --hl-size: clamp(56px, 5.3vw, 104px);
  --hl-leading: 0.95;

  --subhl-size: clamp(28px, 3.05vw, 52px);
  --subhl-leading: 1.06;
  --subhl-track: 0.01em;

  --body-size: 21px;
  --body-leading: 30px;

  /* Upravené odsazení odstavců */
  --body-par-gap: 14px;

  --subhl1-max: 2000px;
  --body1-max: 640px;

  --block2-max: 2000px;
  --body2-max: 640px;
  --body2-top: 28px;

  --period-col-gap: 28px;

  --theoryWhite: 0;
  --theoryText: 0;
}

*{ box-sizing:border-box; }
html, body{ height:100%; }
html{
  scroll-behavior:smooth;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scrollbar-gutter: stable both-edges;
}

/* CURSOR */
body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  overflow-x:hidden;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="8" cy="8" r="4.2" fill="%23111111" stroke="%23ffffff" stroke-width="1.2"/></svg>') 8 8, auto;
}
body.no-scroll{ overflow:hidden; }

body.is-light{
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="8" cy="8" r="4.2" fill="%23111111" stroke="%23111111" stroke-width="1.2"/></svg>') 8 8, auto;
}

.sketch-wrap{
  position:fixed;
  inset:0;
  z-index:1;
}
canvas{ display:block; }
.p5_loading{ display:none !important; }

/* CHAOS */
.chaos-wrap{
  position:fixed;
  inset:0;
  z-index:1;
  pointer-events:none;
  overflow:hidden;
  filter: blur(7px);
  transform: translateZ(0);
  will-change: filter, opacity;
}
body.is-light .chaos-wrap{ opacity:0; }

/* PHOSPHENE (Dark Mode) */
.phosphene-wrap {
  position: fixed;
  inset: 0;
  z-index: 1; 
  pointer-events: none;
  mix-blend-mode: screen; 
  transition: opacity 800ms ease;
  opacity: 1;
}
.phosphene-wrap canvas {
  display: block;
  width: 100%;
  height: 100%;
  filter: blur(60px) contrast(1.1); 
}
body.is-light .phosphene-wrap { opacity: 0; }

/* WHITE GLOW (White Mode) */
.white-glow-wrap {
  position: fixed;
  inset: 0;
  z-index: 3; /* Nad závěsem */
  pointer-events: none;
  mix-blend-mode: multiply; /* Viditelné na bílé */
  transition: opacity 800ms ease;
  opacity: 1;
}
.white-glow-wrap canvas {
  display: block;
  width: 100%;
  height: 100%;
  filter: blur(90px); 
}
body:not(.is-light) .white-glow-wrap { opacity: 0; }

/* Loader */
.loader{
  position:fixed;
  inset:0;
  background:var(--bg);
  z-index:9998;
  display:grid;
  place-items:center;
  transition: opacity 280ms ease, visibility 280ms ease;
  opacity:1;
  visibility:visible;
}
.loader.is-hidden{
  opacity:0;
  visibility:hidden;
  pointer-events:none;
}
.loader__inner{ display:grid; gap:18px; justify-items:center; }
.loader__text{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  letter-spacing:0.22em;
  text-transform:uppercase;
  font-size:12px;
  line-height:13px;
  color:rgba(255,255,255,0.78);
}
.loader__grid{
  width:84px;
  height:56px;
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap:8px;
}
.loader__grid span{
  width:100%;
  aspect-ratio:1/1;
  background:rgba(255,255,255,0.16);
  border-radius:2px;
  animation: loaderPulse 900ms infinite ease-in-out;
}
.loader__grid span:nth-child(1){animation-delay:0ms;}
.loader__grid span:nth-child(2){animation-delay:60ms;}
.loader__grid span:nth-child(3){animation-delay:120ms;}
.loader__grid span:nth-child(4){animation-delay:180ms;}
.loader__grid span:nth-child(5){animation-delay:240ms;}
.loader__grid span:nth-child(6){animation-delay:300ms;}
.loader__grid span:nth-child(7){animation-delay:360ms;}
.loader__grid span:nth-child(8){animation-delay:420ms;}
.loader__grid span:nth-child(9){animation-delay:480ms;}
.loader__grid span:nth-child(10){animation-delay:540ms;}
.loader__grid span:nth-child(11){animation-delay:600ms;}
.loader__grid span:nth-child(12){animation-delay:660ms;}
@keyframes loaderPulse{
  0%{opacity:.25; transform:translateY(0);}
  40%{opacity:.95; transform:translateY(-6px);}
  100%{opacity:.25; transform:translateY(0);}
}

/* Mic Gate */
.mic-gate{
  position:fixed;
  inset:0;
  z-index:9999;
  display:grid;
  place-items:center;
  background:rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
  opacity:1;
  visibility:visible;
  transition: opacity 200ms ease, visibility 200ms ease;
}
.mic-gate.is-hidden{
  opacity:0;
  visibility:hidden;
  pointer-events:none;
}
.mic-gate__inner{
  width:min(520px, calc(100% - 56px));
  padding:26px 24px;
  border:1px solid rgba(255,255,255,0.18);
  border-radius:18px;
  background:rgba(21,21,21,0.82);
}
.mic-gate__title{
  font-family:"PPEikoThin", serif;
  font-weight:300;
  letter-spacing:-0.01em;
  font-size:22px;
  line-height:23px;
  color:rgba(255,255,255,0.92);
}
.mic-gate__text{
  margin-top:10px;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing:0.12em;
  font-size:12px;
  line-height:13px;
  color:rgba(255,255,255,0.72);
}
.mic-gate__status{
  margin-top:10px;
  min-height: 14px;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing:0.10em;
  font-size:11px;
  line-height:12px;
  color:rgba(255,255,255,0.66);
  opacity:0.95;
}
.mic-gate__actions{ display:flex; gap:10px; margin-top:18px; }
.mic-gate__btn{
  flex:1;
  cursor:pointer;
  border-radius:999px;
  padding:12px 14px;
  border:1px solid rgba(255,255,255,0.22);
  background:rgba(255,255,255,0.10);
  color:rgba(255,255,255,0.90);
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing:0.14em;
  font-size:12px;
  line-height:13px;
}
.mic-gate__btn--ghost{
  background:transparent;
  border-color: rgba(255,255,255,0.18);
  color:rgba(255,255,255,0.78);
}

/* Topbar */
.topbar{
  position:fixed;
  top:0;
  left:0;
  z-index:3;
  width:100%;
  pointer-events:none;
}
.topbar__inner{
  pointer-events:auto;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  padding:36px var(--pad-x) 0 var(--pad-x);
}
.topbar__title,
.topbar__about{
  font-family:"PPEikoThin", serif;
  font-weight:300;
  text-decoration:none;
  color:rgba(255,255,255,0.92);
  letter-spacing:-0.01em;
  font-size:22px;
  line-height:23px;
  transition: color 200ms ease, opacity 200ms ease;
}
.topbar__about{ text-transform: lowercase; opacity:0.92; }
.topbar__aboutLabel{ display:inline; }
.topbar__aboutLabel--light{ display:none; }
body.is-light .topbar__aboutLabel--dark{ display:none; }
body.is-light .topbar__aboutLabel--light{ display:inline; }

/* Hero */
.hero{
  position:relative;
  z-index:2;
  height:100vh;
  display:flex;
  align-items:flex-end;
}
.hero__content{
  padding:0 0 var(--pad-b) var(--pad-x);
  max-width:900px;
}
.hero__title{
  font-family:"PPEikoThin", serif;
  font-weight:300;
  margin:0;
  font-size:clamp(78px, 7.6vw, 128px);
  line-height: calc(clamp(78px, 7.6vw, 128px) - 3px);
  letter-spacing:-0.03em;
  color:rgba(255,255,255,0.92);
  transition: opacity 200ms ease, transform 200ms ease;
}
.hero__subtitle{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  margin:22px 0 0 0;
  max-width:640px;
  font-size:clamp(13px, 1.15vw, 16px);
  line-height: calc(clamp(13px, 1.15vw, 16px) + 1px);
  text-transform:uppercase;
  letter-spacing:0.10em;
  color:var(--muted);
  transition: opacity 200ms ease, transform 200ms ease;
}
body.is-scrolled .hero__title,
body.is-scrolled .hero__subtitle{
  opacity:0;
  transform:translateY(10px);
  pointer-events:none;
}

/* Content */
.content{
  position:relative;
  z-index:2;
  padding:0 var(--pad-x) 0 var(--pad-x);
}

.scroll-zone{ height: 210vh; }

.quote-line{
  text-transform:uppercase;
  line-height: var(--quote-line-height);
  margin:0;
  padding:0;
  display:block;
}
.quote-line--nowrap{ white-space: nowrap; }

.q-eiko{
  font-family:"PPEikoThin", serif;
  font-weight:300;
  font-size: var(--quote-size);
  letter-spacing: var(--quote-tracking-eiko);
  color:rgba(255,255,255,0.96);
}
.q-haas{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  font-size: var(--quote-size);
  letter-spacing: var(--quote-tracking-haas);
  color:rgba(255,255,255,0.96);
}
.q-water{ margin-left: 0.18em; }

/* Silence */
.silence-section{ position:relative; height: 210vh; }
.silence-pin{
  position:sticky; top:0; height:100vh;
  display:grid; place-items:center;
  pointer-events:none;
}
.silence-stage{
  width:min(var(--quote-maxw), 100%);
  padding:0 22px;
  transform: translateY(var(--quote-raise));
  position:relative;
}
.silence-quote{
  position:absolute;
  left:50%; top:50%;
  transform: translate(-50%, -50%) translateY(18px);
  width:100%;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: var(--quote-gap);
  opacity:0;
  filter: blur(1.6px);
  will-change: opacity, transform, filter;
}

/* CHAOS */
.chaos-section{ position:relative; height: 150vh; }
.chaos-pin{
  position:sticky;
  top:0;
  height:100vh;
  pointer-events:none;
}

/* Water */
.water-section{ position:relative; height: 240vh; }
.water-pin{
  position:sticky; top:0; height:100vh;
  display:grid; place-items:center;
  pointer-events:none;
}
.water-quote{
  width:min(var(--quote-maxw), 100%);
  padding:0 22px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: var(--quote-gap);
  opacity:0;
  transform: translateY(calc(18px + var(--quote-raise)));
  filter: blur(1.6px);
  will-change: opacity, transform, filter;
}

.vibe-gap{ height: 220vh; }

/* Vibe */
.vibe-section{ position:relative; height: 760vh; }
.vibe-pin{
  position:sticky;
  top:0;
  height:100vh;
  display:grid;
  place-items:center;
  pointer-events:none;
}
.vibe-intro{
  width:min(1100px, 100%);
  padding:0 22px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: 10px;
  opacity:0;
  filter: blur(1.6px);
  transform: translateY(18px);
  will-change: opacity, transform, filter;
}
@media (max-width: 1100px){
  .quote-line--nowrap{ white-space: normal; }
}
.vibe-caption{
  position:absolute;
  left:50%;
  width:min(860px, 92%);
  text-align:center;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing:0.10em;
  font-size:clamp(13px, 1.15vw, 16px);
  line-height: calc(clamp(13px, 1.15vw, 16px) + 1px);
  color:rgba(255,255,255,0.72);
  opacity:0;
  filter: blur(1.2px);
  will-change: opacity, transform, filter;
  pointer-events:none;
  z-index:4;
  top:auto;
  bottom:22px;
  transform:translateX(-50%);
}

/* Curtain */
.theory-curtain{
  position:fixed;
  inset:0;
  z-index:2;
  background: var(--light-bg);
  transform:none;
  opacity: var(--theoryWhite);
  will-change: opacity;
  pointer-events:none;
}

/* FULL BLEED helpers */
.theory-section,
.timeline-section,
.periods-section,
.links-section,
.colophon{
  position:relative;
  width:100vw;
  left:50%;
  right:50%;
  margin-left:-50vw;
  margin-right:-50vw;
  padding-left: var(--pad-x);
  padding-right: var(--pad-x);
  color: rgba(12,12,12,0.92);
}

/* THEORY */
.theory-section{
  padding-bottom: 150px;
  background: transparent;
}
.theory-wrap{
  width: min(var(--theory-max), 100%);
  margin:0 auto;
  padding-top: var(--theory-top-pad);
  opacity: var(--theoryText);
  transform: translateY(calc((1 - var(--theoryText)) * 10px));
  filter: blur(calc((1 - var(--theoryText)) * 2.0px));
  will-change: opacity, transform, filter;
}

.t-serif{
  font-family:"PPEikoThin", serif;
  font-weight:300;
  letter-spacing:-0.01em;
}
.t-sans{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  letter-spacing:0.01em;
}

.theory-hl{
  margin:0;
  text-transform:uppercase;
  font-size: var(--hl-size);
  line-height: calc(var(--hl-size) * var(--hl-leading));
  letter-spacing:0.02em;
  color: rgba(12,12,12,0.92);
}
.theory-hl__row{ display:block; }
.theory-hl--1{ text-align:left; }

.theory-subhl{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing: var(--subhl-track);
  font-size: var(--subhl-size);
  line-height: calc(var(--subhl-size) * var(--subhl-leading));
  color: rgba(12,12,12,0.92);
  margin:0;
}
.theory-subhl--1{
  margin-top: var(--theory-gap-1);
  max-width: var(--subhl1-max);
  padding-left: 380px;
}

.theory-body{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  font-size: var(--body-size);
  line-height: var(--body-leading);
  color: rgba(12,12,12,0.86);
}
.theory-body p{
  margin:0 0 var(--body-par-gap) 0;
  text-indent: 0;
}
.theory-body p:last-child{ margin-bottom:0; }

.theory-body--1{
  margin-top: var(--theory-gap-2);
  max-width: var(--body1-max);
  transform: translateX(200px);
}

.theory-block-gap{ height: var(--theory-gap-block); }
.theory-block-2{ max-width: var(--block2-max); }
.theory-hl--2{ text-align:left; }
.theory-subhl--2{
  margin-top: var(--theory-gap-1);
  max-width: var(--subhl1-max);
  padding-left: 380px;
}
.theory-body--2{
  margin-top: var(--body2-top);
  max-width: var(--body2-max);
  transform: translateX(200px);
}

/* TIMELINE */
.timeline-section{ height: 220vh; background: transparent; }
.timeline-pin{
  position:sticky; top:0; height:100vh;
  display:flex; align-items:center; justify-content:center;
}
.timeline{ width:min(1100px, 100%); }
.timeline__stage{ position:relative; width:100%; height:560px; }
.timeline__ellipse{
  position:absolute;
  left:50%;
  bottom:0;
  transform:translateX(-50%);
  width:92%;
  height:360px;
  overflow:visible;
  opacity:0;
  transition: opacity 160ms ease;
}
.timeline.is-on .timeline__ellipse{ opacity:1; }
.timeline__ellipse ellipse{
  fill:none;
  stroke:var(--light-stroke);
  stroke-width:2.2;
  stroke-linecap:round;
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
}
.timeline__item{
  position:absolute;
  left: var(--x, 50%);
  bottom:0;
  height:100%;
  width:260px;
  transform: translateX(-50%);
  text-align:center;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  --anchorBottom: 110px;
  --lineLen: 240px;
  --lineProg: 0;
  --labelOpacity: 0;
}
.timeline__line{
  position:absolute;
  left:50%;
  bottom: var(--anchorBottom);
  width:2px;
  height: calc(var(--lineLen) * var(--lineProg));
  background:var(--light-stroke);
  transform: translateX(-50%);
}
.timeline__label{
  position:absolute;
  left:50%;
  bottom: calc(var(--anchorBottom) + var(--lineLen) + 16px);
  width:260px;
  transform:translateX(-50%);
  opacity: var(--labelOpacity);
}
.timeline__years,
.timeline__text{
  font-family:"NeueHaasLight", sans-serif;
  font-size:28px;
  line-height: 29px;
  color: rgba(12,12,12,0.82);
}
.timeline__text{ margin-top:6px; }

/* PERIODS - UPRAVENO: Vráceno zarovnání vlevo */
.periods-section{
  background: transparent;
  padding-top: 36px;
  padding-bottom: 0;
}
.periods{ width:100%; margin:0; }
.period{ border-top: 1px solid rgba(12,12,12,0.55); }
.period:last-child{ border-bottom: 1px solid rgba(12,12,12,0.55); }
.period__bar{ padding: 22px 0; }
.period__year{
  width: min(var(--theory-max), 100%);
  margin: 0 auto;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  font-size: var(--hl-size);
  line-height: calc(var(--hl-size) * var(--hl-leading));
  letter-spacing:0.01em;
  color: rgba(12,12,12,0.92);
  text-transform: uppercase;
  /* ZDE BYLO SMAZÁNO text-align: center; */
}
.period[data-key="p1"] .period__year{ white-space: nowrap; }
.period__content{
  max-height: 0;
  overflow: hidden;
  transition: max-height 340ms ease;
}
.period.is-open .period__content{ max-height: 1400px; }
.period__title{
  width: min(var(--theory-max), 100%);
  margin: 0 auto 22px auto;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing: var(--subhl-track);
  font-size: var(--subhl-size);
  line-height: calc(var(--subhl-size) * var(--subhl-leading));
  color: rgba(12,12,12,0.90);
}
.period__cols{
  width: min(var(--theory-max), 100%);
  margin: 0 auto;
  padding: 0 0 30px 0;
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--period-col-gap);
  justify-content:start;
  align-items:start;
}
.period__cols p{
  margin:0;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  font-size: 19px;
  line-height: 24px;
  color: rgba(12,12,12,0.82);
  text-indent: 0;
}

/* LINKS - UPRAVENO: Font stejný jako podnadpisy (subhl) */
.links-section{
  background: transparent;
  padding-top: 210px;
  padding-bottom: 60px;
}
.links-wrap{
  width: min(var(--theory-max), 100%);
  margin:0 auto;
}
.links-hl{
  margin:0;
  text-transform:uppercase;
  text-align:left;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  letter-spacing: var(--subhl-track);
  font-size: var(--subhl-size);
  line-height: calc(var(--subhl-size) * var(--subhl-leading));
  color: rgba(12,12,12,0.92);
}
.links-hl__row{ display:block; }
.links-hl .t-serif, .links-hl .t-sans{
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  letter-spacing: var(--subhl-track);
}
.links-subhl{
  margin-top: var(--theory-gap-1);
  max-width: var(--subhl1-max);
  padding-left: 380px;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:none;
  letter-spacing:0.01em;
  font-size: var(--body-size);
  line-height: var(--body-leading);
  color: rgba(12,12,12,0.82);
}
.links-grid{
  width: min(var(--theory-max), 100%);
  margin: 56px auto 0 auto;
  display:grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: row;
  gap: 16px;
  align-items: stretch;
}
.links-btn{
  display:flex;
  align-items:center;
  justify-content:flex-start;
  min-height: 56px;
  text-decoration:none;
  border: 1px solid rgba(12,12,12,0.55);
  border-radius:18px;
  padding: 14px 18px;
  font-family:"PPEikoThin", serif;
  font-weight:300;
  letter-spacing:-0.01em;
  font-size:22px;
  line-height:23px;
  text-transform: lowercase;
  color: rgba(12,12,12,0.90);
  background: transparent;
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
}
.links-btn:hover{
  background: var(--bg);
  border-color: var(--bg);
  color: rgba(255,255,255,0.92);
}

/* Colophon - UPRAVENO: Zvětšený padding dole (z 20px na 36px) */
.colophon{
  padding: 120px var(--pad-x) 36px var(--pad-x);
  text-align:center;
  font-family:"NeueHaasLight", sans-serif;
  font-weight:300;
  text-transform:uppercase;
  letter-spacing:0.10em;
  font-size:clamp(13px, 1.15vw, 16px);
  line-height: calc(clamp(13px, 1.15vw, 16px) + 1px);
  color: rgba(12,12,12,0.72);
}
.colophon__serif{
  font-family:"PPEikoThin", serif;
  font-weight:300;
  letter-spacing:-0.01em;
}

body.is-light{
  background: var(--light-bg);
  color:var(--light-text);
}
body.is-light .topbar__title, body.is-light .topbar__about{ color: rgba(12,12,12,0.92); }
body.is-light .hero__title{ color: rgba(12,12,12,0.92); }
body.is-light .hero__subtitle{ color: rgba(12,12,12,0.70); }
body:not(.is-light) .topbar__title, body:not(.is-light) .topbar__about{ color: rgba(255,255,255,0.92); }
body:not(.is-light) .hero__title{ color: rgba(255,255,255,0.92); }
body:not(.is-light) .hero__subtitle{ color: rgba(255,255,255,0.72); }

@media (max-width: 900px){
  :root{
    --pad-x:28px;
    --pad-b:56px;
    --quote-maxw: 96%;
    --quote-gap: 12px;
    --quote-raise: -4vh;
    --quote-size: clamp(32px, 8.2vw, 64px);
    --theory-max: 92vw;
    --theory-top-pad: 70px;
    --hl-size: clamp(44px, 9.0vw, 72px);
    --subhl-size: clamp(22px, 5.8vw, 34px);
    --body-size: 18px;
    --body-leading: 26px;
    --subhl1-max: 92vw;
    --body1-max: 92vw;
    --block2-max: 92vw;
    --body2-max: 92vw;
    --period-col-gap: 14px;
  }
  .period__cols{ grid-template-columns: 1fr; gap: 14px; }
  .period.is-open .period__content{ max-height: 1800px; }
  .timeline__item{ width:200px; }
  .timeline__label{ width:200px; }
  .timeline__years, .timeline__text{ font-size:22px; line-height:23px; }
  .vibe-caption{ width: 90%; bottom: 18px; }
  .links-section{ padding-top: 170px; padding-bottom: 50px; }
  .links-subhl{ padding-left: 0; }
  .links-grid{ grid-template-columns: 1fr; width: 100%; }
  .chaos-wrap{ filter: blur(5px); }
  .phosphene-wrap canvas { filter: blur(50px) contrast(1.1); }
  .white-glow-wrap canvas { filter: blur(60px); }
}
