/* ============================================================
   TEMPLATE 4 PREMIUM — AMBIENT AUDIO LAYER (optional)
   ------------------------------------------------------------
   A self-contained, removable module. The main script never
   references anything in this file — it only dispatches an
   "invite:opened" event, which this layer listens for. Delete
   audio.js and the site works identically, with no errors and
   no sound control (the opening-screen toggle also stays
   hidden, because this file is what reveals it).

   Behaviour:
   • mode comes from config.audio.mode:
       "silent"  → this file does nothing at all
       "single"  → one looping ambient bed
       "layered" → the bed + a soft layer underneath
   • NEVER autoplays. Audio starts only inside a user gesture:
     the guest ticks "Enable ambient sound" on the opening
     screen and opens the invitation, or presses the floating
     sound button. The choice lives in memory only — never in
     localStorage — so a reload always starts silent.
   • Volume low by default (config.audio.volume).
   • Paused whenever the tab is hidden (visibilitychange).
   • Faded out while the footer ayah/du'a section
     ([data-audio-duck]) is in view, restored afterwards.
   • The bed ships (assets/audio/barakah.mp3); the optional layer
     path is a placeholder (assets/audio/*.mp3). Missing files fail
     silently: the track is marked dead and, if every track is dead,
     the sound button removes itself.
   ============================================================ */

(function(){
"use strict";

const CFG=(window.INVITE_CONFIG!==undefined)?window.INVITE_CONFIG:(typeof INVITE_CONFIG!=="undefined"?INVITE_CONFIG:null);
const cfg=CFG&&CFG.audio;
if(!cfg||cfg.mode==="silent")return;      /* fully inert — no button, no toggle */

const PATHS=cfg.mode==="layered"
  ?[{src:cfg.tracks.bed,level:1},{src:cfg.tracks.layer,level:.7}]
  :[{src:cfg.tracks.bed,level:1}];
const MASTER=typeof cfg.volume==="number"?cfg.volume:.3;   /* low by default */

/* ---------- state (memory only, never persisted) ---------- */
let enabled=false;      /* guest wants to hear the ambience   */
let ducked=false;       /* footer ayah/du'a section in view   */

/* ---------- tracks ---------- */
const tracks=PATHS.map(p=>{
  const el=new Audio();
  el.loop=true;
  el.preload="none";            /* no request until sound is asked for */
  el.volume=0;
  el.src=p.src;                 /* assigned here; nothing is fetched until play() */
  const tr={el,level:Math.min(1,MASTER*p.level),dead:false};
  el.addEventListener("error",()=>{
    tr.dead=true;
    if(!tracks.some(t=>!t.dead))teardown();
  });
  return tr;
});

/* ---------- opening-screen toggle ---------- */
/* The toggle ships hidden in index.html; it only appears when this
   layer actually runs, so removing audio.js removes the promise. */
const soundToggleWrap=document.getElementById("soundToggleWrap");
const soundToggle=document.getElementById("soundToggle");
if(soundToggleWrap)soundToggleWrap.hidden=false;

/* ---------- floating mute/unmute button (all sections) ---------- */
const L={
  on:{en:"Mute ambient sound",bn:"অ্যাম্বিয়েন্ট সাউন্ড বন্ধ করুন"},
  off:{en:"Unmute ambient sound",bn:"অ্যাম্বিয়েন্ট সাউন্ড চালু করুন"},
};
const lang=()=>document.documentElement.lang==="bn"?"bn":"en";
const btn=document.createElement("button");
btn.type="button";
btn.id="soundBtn";
btn.className="sound-btn is-off";
btn.setAttribute("aria-pressed","false");
btn.innerHTML='<svg class="ic on" aria-hidden="true"><use href="#i-note"/></svg>'+
              '<svg class="ic off" aria-hidden="true"><use href="#i-note-off"/></svg>';
document.body.appendChild(btn);
function label(){
  btn.setAttribute("aria-label",enabled?L.on[lang()]:L.off[lang()]);
  btn.title=btn.getAttribute("aria-label");
}
label();
new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

btn.addEventListener("click",()=>{
  enabled=!enabled;
  btn.classList.toggle("is-off",!enabled);
  btn.setAttribute("aria-pressed",String(enabled));
  label();
});

/* ---------- audio starts only on a user gesture ---------- */
document.addEventListener("invite:opened",()=>{
  if(soundToggle&&soundToggle.checked){   /* the guest opted in — the tap on
      "Open the Invitation" is the gesture that unlocks playback */
    enabled=true;
    btn.classList.remove("is-off");
    btn.setAttribute("aria-pressed","true");
    label();
  }
});

/* ---------- pause while the tab is hidden ---------- */
/* The fade engine polls document.hidden every tick, so an immediate
   pause here plus an automatic resume on return are both covered. */
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){
    tracks.forEach(t=>{if(!t.dead&&!t.el.paused)t.el.pause();});
  }
});

/* ---------- fade out inside the ayah/du'a section ---------- */
const duckZone=document.querySelector("[data-audio-duck]");
if(duckZone&&"IntersectionObserver" in window){
  new IntersectionObserver(es=>{
    ducked=es[0].isIntersecting;
  },{threshold:.25}).observe(duckZone);
}

/* ---------- fade engine ---------- */
/* one tick every 70 ms walks each track's volume toward its target:
   0 when off/hidden/ducked, else its configured level. Tracks pause
   once they reach zero and restart (playback was already unlocked by
   a user gesture) when a target above zero appears. */
const fadeTimer=setInterval(()=>{
  tracks.forEach(tr=>{
    if(tr.dead)return;
    const target=(enabled&&!document.hidden&&!ducked)?tr.level:0;
    const v=tr.el.volume;
    if(target>0){
      if(tr.el.paused){
        const p=tr.el.play();
        if(p&&p.catch)p.catch(()=>{});   /* gesture or file issues — stay silent */
      }
      if(Math.abs(v-target)>0.005){
        const step=Math.min(.04,Math.abs(v-target));
        tr.el.volume=Math.max(0,Math.min(1,v+(target>v?step:-step)));
      }
    }else if(v>0){
      tr.el.volume=Math.max(0,v-.04);
    }else if(!tr.el.paused&&!document.hidden){
      tr.el.pause();                     /* faded to zero → stop decoding */
    }
  });
},70);

/* every track failed (placeholder paths with no real files) —
   withdraw quietly: remove the button, re-hide the toggle. */
function teardown(){
  clearInterval(fadeTimer);
  btn.remove();
  if(soundToggleWrap)soundToggleWrap.hidden=true;
}
})();
