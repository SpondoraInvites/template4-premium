/* ============================================================
   TEMPLATE 4 PREMIUM — SCRIPT
   The opening envelope, language & theme toggles, scroll
   reveals, the live countdown (Nikah → Walima → "just married!"),
   the multi-event Add-to-Calendar file and the RSVP form.
   Client values come from config.js — edit that file, not this.

   NOTE: this script never touches audio. The ambient-sound layer
   is self-contained in audio.js and listens for the
   "invite:opened" event dispatched below; deleting audio.js
   leaves everything here working unchanged.
   ============================================================ */

(function(){
"use strict";
/* config.js declares INVITE_CONFIG with `const`, which is a global
   lexical binding, not a window property — check both. */
const CFG=window.INVITE_CONFIG||INVITE_CONFIG;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. Strings used by the script itself (Bangla sample text)
   ========================================================= */
const WORDS=['zero','one','two','three','four','five','six','seven','eight'];
const BN_DIGITS='০১২৩৪৫৬৭৮৯';
const bnNum=n=>String(n).replace(/\d/g,d=>BN_DIGITS[d]);
const T={
  en:{
    acceptBody:(n,g)=>`Your reply has reached us with joy, ${n}. In shaa Allah, we will keep seats for your party of ${WORDS[g]}.`,
    declineBody:()=>`You will be dearly missed — but your blessings travel with us. Thank you for letting us know.`,
    toastSaved:"WhatsApp opened with your reply — please press Send",
    toastDeclined:"Thank you for letting us know",
    toastCalendar:"Calendar file downloaded — see you soon, In shaa Allah",
    toastCopied:"Invitation link copied — thank you for sharing",
    toastNameFirst:"Please tell us your name first",
    sentBody:()=>"WhatsApp opened with your reply — please press Send to deliver it.",
    phase:{
      nikah:{title:"until the Nikah, In shaa Allah",cap:"…until the Nikah begins"},
      walima:{title:"until the Walima, In shaa Allah",cap:"…until the Walima begins"},
    },
  },
  bn:{
    acceptBody:(n,g)=>`আপনার উত্তর আনন্দের সাথে পৌঁছেছে, ${n}। ইনশাআল্লাহ, আপনাদের ${bnNum(g)} জনের আসন রাখা হবে।`,
    declineBody:()=>`আপনাকে আমরা মিস করব — কিন্তু আপনার দোয়া আমাদের সাথেই থাকবে। জানিয়ে দেওয়ার জন্য ধন্যবাদ।`,
    toastSaved:"আপনার উত্তরসহ WhatsApp খোলা হয়েছে — পাঠাতে Send চাপুন",
    toastDeclined:"জানিয়ে দেওয়ার জন্য ধন্যবাদ",
    toastCalendar:"ক্যালেন্ডার ফাইল ডাউনলোড হয়েছে — ইনশাআল্লাহ দেখা হবে",
    toastCopied:"দাওয়াতের লিংক কপি হয়েছে — শেয়ার করার জন্য ধন্যবাদ",
    toastNameFirst:"অনুগ্রহ করে আপনার নাম লিখুন",
    sentBody:()=>"আপনার উত্তরসহ WhatsApp খোলা হয়েছে — পাঠাতে Send চাপুন।",
    phase:{
      nikah:{title:"নিকাহ পর্যন্ত, ইনশাআল্লাহ",cap:"…নিকাহ শুরু হওয়া পর্যন্ত"},
      walima:{title:"ওয়ালিমা পর্যন্ত, ইনশাআল্লাহ",cap:"…ওয়ালিমা শুরু হওয়া পর্যন্ত"},
    },
  },
};
const lang=()=>document.documentElement.lang==="bn"?"bn":"en";

/* =========================================================
   2. Optional photo slot (off by default — monograms show)
   ========================================================= */
if(CFG.photos&&CFG.photos.enabled){
  $$("img[data-photo]").forEach(img=>{
    const src=CFG.photos[img.dataset.photo];
    if(!src)return;
    img.addEventListener("error",()=>img.removeAttribute("src"),{once:true});
    img.src=src; /* if the file is missing, the monogram returns */
  });
}

/* =========================================================
   3. Language toggle — EN / বাংলা
   ========================================================= */
const ARIA={
  openBtn:{en:"Open the invitation",bn:"দাওয়াত খুলুন"},
  langBtn:{en:"Switch language to Bangla",bn:"ভাষা ইংরেজিতে পরিবর্তন করুন"},
  themeToDark:{en:"Switch to dark theme",bn:"ডার্ক থিমে যান"},
  themeToLight:{en:"Switch to light theme",bn:"লাইট থিমে যান"},
  gMinus:{en:"Fewer guests",bn:"অতিথি কমান"},
  gPlus:{en:"More guests",bn:"অতিথি বাড়ান"},
};
function applyLang(l){
  document.documentElement.lang=l;
  $$("[data-ph-en]").forEach(el=>{el.placeholder=l==="bn"?el.dataset.phBn:el.dataset.phEn;});
  const openBtn=$("#openBtn");if(openBtn)openBtn.setAttribute("aria-label",ARIA.openBtn[l]);
  $("#langBtn").setAttribute("aria-label",ARIA.langBtn[l]);
  $("#gMinus").setAttribute("aria-label",ARIA.gMinus[l]);
  $("#gPlus").setAttribute("aria-label",ARIA.gPlus[l]);
  const themeDark=document.documentElement.dataset.theme==="dark";
  $("#themeBtn").setAttribute("aria-label",themeDark?ARIA.themeToLight[l]:ARIA.themeToDark[l]);
  try{localStorage.setItem("t4_lang",l);}catch(_){}
}
$("#langBtn").addEventListener("click",()=>applyLang(lang()==="bn"?"en":"bn"));
(function(){ /* restore last choice, else keep the HTML default */
  let saved=null;try{saved=localStorage.getItem("t4_lang");}catch(_){}
  if(saved==="bn"||saved==="en")applyLang(saved);else applyLang("en");
})();

/* =========================================================
   4. Theme toggle — light / dark (honours system preference)
   ========================================================= */
const themeBtn=$("#themeBtn");
function applyTheme(t){
  document.documentElement.dataset.theme=t;
  themeBtn.setAttribute("aria-pressed",String(t==="dark"));
  themeBtn.setAttribute("aria-label",t==="dark"?ARIA.themeToLight[lang()]:ARIA.themeToDark[lang()]);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=t==="dark"?"#2A1216":"#5A1F2B";
  try{localStorage.setItem("t4_theme",t);}catch(_){}
}
let savedTheme=null;try{savedTheme=localStorage.getItem("t4_theme");}catch(_){}
applyTheme(savedTheme==="dark"||savedTheme==="light"?savedTheme:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));
themeBtn.addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));

/* =========================================================
   5. Open the invitation — envelope & wax seal
   ========================================================= */
const openBtn=$("#openBtn");
let opened=false;
openBtn.addEventListener("click",()=>{
  if(opened)return;opened=true;
  /* Audio (if the layer is present and the guest opted in) starts
     inside this user gesture. audio.js listens for this event. */
  document.dispatchEvent(new CustomEvent("invite:opened"));
  if(RM){
    document.body.classList.add("revealed");
    document.body.classList.remove("locked");
    return;
  }
  document.body.classList.add("opening");
  setTimeout(()=>{
    document.body.classList.add("revealed");
    document.body.classList.remove("locked");
  },800);
  setTimeout(()=>{openBtn.blur();},1600);
});

/* =========================================================
   6. Scroll reveals + nav state
   ========================================================= */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}
}),{threshold:.15,rootMargin:"0px 0px -8% 0px"});
$$(".reveal").forEach(el=>io.observe(el));

const nav=$("#nav");
let ticking=false;
function onScroll(){nav.classList.toggle("scrolled",scrollY>40);ticking=false;}
addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true});
onScroll();

/* =========================================================
   7. Live countdown — Nikah first, then the Walima
   ========================================================= */
const TARGETS=[
  {at:new Date(CFG.events.nikah.dateTime).getTime(),key:"nikah"},
  {at:new Date(CFG.events.walima.dateTime).getTime(),key:"walima"},
];
const countEl=$("#count"),capEl=$(".count-cap");
let phase=null,cdTimer=null; /* cdTimer exists before the first tick —
  the tick can hit the "married" branch immediately if both dates
  have passed, and must clear the interval without a TDZ error. */
const pad=v=>String(v).padStart(2,"0");
function setPhase(p){
  phase=p;
  const txt=T[lang()].phase[p];
  $$("#cdTitle .en").forEach(el=>el.textContent=txt.title);
  $$("#cdTitle .bn").forEach(el=>el.textContent=txt.title);
  $$(".count-cap .en").forEach(el=>el.textContent=txt.cap);
  $$(".count-cap .bn").forEach(el=>el.textContent=txt.cap);
}
function tickCd(){
  const now=Date.now();
  const next=TARGETS.find(t=>t.at>now);
  if(!next){ /* both events have passed */
    if(cdTimer)clearInterval(cdTimer);
    if(capEl)capEl.hidden=true;
    countEl.innerHTML='<p class="cd-done"><span class="en">just married!</span><span class="bn">নবদম্পতি!</span></p>';
    return;
  }
  if(phase!==next.key)setPhase(next.key);
  const s=Math.floor((next.at-now)/1000);
  $("#cdD").textContent=Math.floor(s/86400);
  $("#cdH").textContent=pad(Math.floor(s/3600)%24);
  $("#cdM").textContent=pad(Math.floor(s/60)%60);
  $("#cdS").textContent=pad(s%60);
}
tickCd();
cdTimer=setInterval(tickCd,1000);

/* =========================================================
   8. Toasts
   ========================================================= */
const toastBox=$("#toasts");
function toast(msg){
  const t=document.createElement("div");t.className="toast";
  t.innerHTML=`<svg class="star"><use href="#i-star"/></svg><span></span>`;
  t.lastElementChild.textContent=msg;
  toastBox.appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("show")));
  setTimeout(()=>{t.classList.add("hide");setTimeout(()=>t.remove(),450);},3600);
}

/* =========================================================
   9. Add to calendar — one .ics holding BOTH events
   ========================================================= */
$("#icsBtn").addEventListener("click",()=>{
  const cal=CFG.calendar;
  const ics=v=>new Date(v).toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  const esc=v=>v.replace(/\\/g,"\\\\").replace(/,/g,"\\,").replace(/;/g,"\\;");
  const base=cal.filename.replace(/\.ics$/,"");
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//"+cal.prodid+"//EN","CALSCALE:GREGORIAN"];
  ["nikah","walima"].forEach((key,i)=>{
    const ev=CFG.events[key];
    const start=new Date(ev.dateTime).getTime();
    lines.push("BEGIN:VEVENT",
      "UID:"+base+"-"+(i+1)+"@"+base,
      "DTSTAMP:"+ics(Date.now()),
      "DTSTART:"+ics(start),
      "DTEND:"+ics(start+ev.durationHours*3600000),
      "SUMMARY:"+esc(ev.label+" — Rafi weds Tahmina"),
      "LOCATION:"+esc(cal.location),
      "DESCRIPTION:"+esc((key==="nikah"
        ?"The Nikah (Aqd) of Rafi Ahmed and Tahmina Rahman"
        :"The Walima of Rafi Ahmed and Tahmina Rahman")+", In shaa Allah."),
      "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=cal.filename;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast(T[lang()].toastCalendar);
});

/* keep the directions link in sync with config.venue */
(function(){
  const dir=$("#dirBtn");
  if(dir&&CFG.venue&&CFG.venue.mapsQuery)
    dir.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(CFG.venue.mapsQuery);
})();

/* =========================================================
   10. RSVP — reply, guests stepper, blessings & dietary notes
   ========================================================= */
const form=$("#rsvpForm"),nameI=$("#fName"),nameField=$("#nameField"),
      attY=$("#attY"),attN=$("#attN"),gNum=$("#gNum"),
      confirmEl=$("#confirm"),cName=$("#cName"),cBody=$("#cBody"),
      savedNote=$("#savedNote"),LS=CFG.rsvp.storageKey,
      ifAtt=form.querySelector(".if-att");
const MAX=CFG.rsvp.maxParty||8;

function whatsappUrl(data){
  const attending=data.att==="yes";
  const lines=[
    "RSVP — Rafi weds Tahmina",
    "Name: "+data.n,
    attending?"Attending: Joyfully, yes":"Attending: Regretfully, no",
  ];
  if(attending)lines.push("Guests: "+data.g);
  if(data.notes)lines.push("Blessings or dietary notes: "+data.notes);
  if(data.song)lines.push("Song request: "+data.song);
  return "https://wa.me/"+CFG.rsvp.whatsapp.replace(/[^\d]/g,"")+"?text="+encodeURIComponent(lines.join("\n"));
}

/* the optional song-request field ships hidden; config turns it on */
if(CFG.rsvp.songRequest){const w=$("#fSongWrap");if(w)w.hidden=false;}

function updateAtt(){
  const going=attY.checked;
  form.classList.toggle("decline",!going);
  if(ifAtt)ifAtt.hidden=!going; /* guests stepper only makes sense when attending */
}
[attY,attN].forEach(r=>r.addEventListener("change",updateAtt));

function setG(v){
  gNum.textContent=Math.min(MAX,Math.max(1,v));
}
$("#gPlus").addEventListener("click",()=>setG(parseInt(gNum.textContent,10)+1));
$("#gMinus").addEventListener("click",()=>setG(parseInt(gNum.textContent,10)-1));

form.addEventListener("submit",e=>{
  e.preventDefault();
  const n=nameI.value.trim();
  if(!n){
    nameField.classList.add("error");
    nameI.classList.add("shake");setTimeout(()=>nameI.classList.remove("shake"),500);
    nameI.focus();toast(T[lang()].toastNameFirst);return;
  }
  nameField.classList.remove("error");
  const data={n,att:attY.checked?"yes":"no",g:parseInt(gNum.textContent,10),
    notes:$("#fNotes").value.trim(),ts:Date.now()};
  if(CFG.rsvp.songRequest)data.song=$("#fSong").value.trim();
  try{localStorage.setItem(LS,JSON.stringify(data));}catch(_){}
  if(CFG.rsvp.whatsapp)window.open(whatsappUrl(data),"_blank","noopener");
  cName.textContent=n.split(" ")[0];
  cBody.textContent=CFG.rsvp.whatsapp?T[lang()].sentBody():data.att==="yes"
    ?T[lang()].acceptBody(n,data.g)
    :T[lang()].declineBody();
  form.hidden=true;
  savedNote.hidden=true;
  confirmEl.classList.add("show");
  toast(CFG.rsvp.whatsapp?T[lang()].toastSaved:data.att==="yes"?T[lang()].toastSaved:T[lang()].toastDeclined);
});
$("#editReply").addEventListener("click",()=>{
  confirmEl.classList.remove("show");form.hidden=false;savedNote.hidden=false;
});

/* restore a previous reply from this browser */
try{
  const saved=JSON.parse(localStorage.getItem(LS)||"null");
  if(saved&&saved.n){
    nameI.value=saved.n;
    if(saved.att==="no")attN.checked=true;
    setG(saved.g||1);
    if(CFG.rsvp.songRequest&&$("#fSong"))$("#fSong").value=saved.song||"";
    $("#fNotes").value=saved.notes||"";
    savedNote.hidden=false;
  }
}catch(_){}
updateAtt();

/* =========================================================
   11. Share — pass the invitation along (copy / WhatsApp /
   Messenger / Telegram / email). The venue button and the
   floating bottom-right button both open a channel pill
   menu; the floating one appears once the hero scrolls out
   of view. No backend: channels are prefilled URLs, and
   copying falls back to execCommand when the Clipboard API
   is unavailable (plain http).
   ========================================================= */
(function initShare(){
  const link=()=>location.href.split("#")[0]; /* strip any in-page anchor */
  const text=()=>(CFG.share&&CFG.share.message)||document.title;
  const enc=encodeURIComponent;
  const copyLink=async copyBtn=>{
    try{await navigator.clipboard.writeText(link());}
    catch(_){ /* Clipboard API needs a secure context — fall back */
      const ta=document.createElement("textarea");
      ta.value=link();ta.style.position="fixed";ta.style.opacity="0";
      document.body.appendChild(ta);ta.select();
      try{document.execCommand("copy");}catch(_){}
      ta.remove();
    }
    toast(T[lang()].toastCopied);
    if(copyBtn){ /* brief copied state on the pill, easing after the toast */
      const cur=copyBtn.innerHTML;
      copyBtn.innerHTML='<span class="en">Copied ✓</span><span class="bn">কপি হয়েছে ✓</span>';
      setTimeout(()=>{copyBtn.innerHTML=cur;},1600);
    }
  };
  const actions={
    copy:button=>copyLink(button),
    whatsapp:()=>open("https://wa.me/?text="+enc(text()+"\n"+link()),"_blank","noopener"),
    /* shortcut: deep link only opens the Messenger app (mobile); the desktop
       web dialog needs a registered Facebook app ID */
    messenger:()=>open("fb-messenger://share/?link="+enc(link()),"_blank","noopener"),
    telegram:()=>open("https://t.me/share/url?url="+enc(link())+"&text="+enc(text()),"_blank","noopener"),
    email:()=>{location.href="mailto:?subject="+enc(text())+"&body="+enc(text()+"\n"+link());},
  };
  const pairs=[];
  [["#shareBtn","#shareMenu"],["#shareFloatBtn","#shareMenuFloat"]].forEach(pair=>{
    const b=$(pair[0]),menu=$(pair[1]);
    if(!b||!menu)return;
    menu.hidden=false; /* JS is healthy — the class system takes over from [hidden] */
    const setOpen=op=>{
      menu.classList.toggle("open",op);
      b.setAttribute("aria-expanded",String(op));
    };
    b.addEventListener("click",()=>{
      const wasOpen=menu.classList.contains("open");
      pairs.forEach(p=>p.setOpen(false));
      if(!wasOpen)setOpen(true);
    });
    menu.querySelectorAll("[data-share]").forEach(channel=>{
      const act=actions[channel.dataset.share];
      if(!act)return;
      channel.addEventListener("click",()=>{
        act(channel);
        if(channel.dataset.share!=="copy")setOpen(false);
      });
    });
    pairs.push({b,menu,setOpen});
  });
  document.addEventListener("click",e=>{
    pairs.forEach(({b,menu,setOpen})=>{
      if(menu.classList.contains("open")&&!menu.contains(e.target)&&!b.contains(e.target))setOpen(false);
    });
  });
  document.addEventListener("keydown",e=>{
    if(e.key!=="Escape")return;
    pairs.forEach(({b,menu,setOpen})=>{
      if(menu.classList.contains("open")){setOpen(false);b.focus();}
    });
  });
  /* floating share — slides in once the hero has scrolled away */
  const hero=$(".hero"),floatWrap=$(".float-share");
  if(hero&&floatWrap){
    const update=()=>{
      floatWrap.classList.toggle("show",hero.getBoundingClientRect().bottom<innerHeight*.4);
    };
    update();
    addEventListener("scroll",update,{passive:true});
    addEventListener("resize",update);
  }
})();

})();
