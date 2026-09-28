(()=>{
"use strict";

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const phone="903124183102";
const STORE="miraAvailabilityV1";
const hours=[9,10,11,12,13,14,15,16,17,18];
const days=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const defaults={closedDays:[0],blocked:{}};

const readAvailability=()=>{
  try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(STORE)||"{}"))}
  catch{return Object.assign({},defaults)}
};
let availability=readAvailability();
const saveAvailability=()=>localStorage.setItem(STORE,JSON.stringify(availability));
const iso=date=>date.toISOString().slice(0,10);
const pretty=value=>new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(value+"T12:00:00"));

/* ------------------------------------------------------------------
   Core motion: Lenis + GSAP ScrollTrigger
------------------------------------------------------------------- */
function initLenis(){
  if(!window.Lenis||!window.gsap||!window.ScrollTrigger)return null;
  const lenis=new Lenis({
    autoRaf:false,
    smoothWheel:true,
    syncTouch:true,
    lerp:.085,
    wheelMultiplier:.9
  });

  lenis.on("scroll",ScrollTrigger.update);
  gsap.ticker.add(time=>lenis.raf(time*1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

function initHeroParallax(){
  if(!window.gsap||!window.ScrollTrigger)return;
  const hero=$(".hero"),photo=$(".hero-photo");
  if(!hero||!photo)return;

  const mm=gsap.matchMedia();
  mm.add("(min-width:851px)",()=>{
    gsap.to(photo,{
      yPercent:-18,
      ease:"none",
      scrollTrigger:{
        trigger:hero,
        start:"top top",
        end:"bottom top",
        scrub:true,
        invalidateOnRefresh:true
      }
    });
  });
  mm.add("(max-width:850px)",()=>{
    gsap.to(photo,{
      yPercent:-10,
      ease:"none",
      scrollTrigger:{
        trigger:hero,
        start:"top top",
        end:"bottom top",
        scrub:true,
        invalidateOnRefresh:true
      }
    });
  });
}

function initPinnedReveal(){
  if(!window.gsap||!window.ScrollTrigger)return;
  const section=$(".pinned-reveal"),stage=$(".pin-stage"),frame=$(".pin-frame"),image=$(".pin-image"),caption=$(".pin-caption");
  if(!section||!stage||!frame)return;

  const mm=gsap.matchMedia();

  mm.add("(min-width:851px)",()=>{
    gsap.set(frame,{scale:.62});
    gsap.set(image,{scale:1.06});
    const tl=gsap.timeline({
      scrollTrigger:{
        trigger:section,
        start:"top top",
        end:"bottom bottom",
        scrub:1,
        pin:stage,
        anticipatePin:1,
        invalidateOnRefresh:true
      }
    });
    tl.to(frame,{scale:1.72,borderRadius:0,ease:"none"},0)
      .to(image,{scale:1,ease:"none"},0)
      .to(caption,{yPercent:-12,opacity:.15,ease:"none"},.1);
  });

  mm.add("(max-width:850px)",()=>{
    gsap.set(frame,{scale:.72});
    gsap.set(image,{scale:1.04});
    const tl=gsap.timeline({
      scrollTrigger:{
        trigger:section,
        start:"top top",
        end:"bottom bottom",
        scrub:1,
        pin:stage,
        anticipatePin:1,
        invalidateOnRefresh:true
      }
    });
    tl.to(frame,{scale:1.39,borderRadius:0,ease:"none"},0)
      .to(image,{scale:1,ease:"none"},0)
      .to(caption,{yPercent:-8,opacity:.2,ease:"none"},.1);
  });
}

function initHorizontalScroll(){
  if(!window.gsap||!window.ScrollTrigger)return;
  const section=$(".horizontal-collection"),pin=$(".horizontal-pin"),track=$(".horizontal-track");
  if(!section||!pin||!track)return;

  const mm=gsap.matchMedia();

  mm.add("(min-width:601px)",()=>{
    const getDistance=()=>Math.max(0,track.scrollWidth-window.innerWidth);
    gsap.set(track,{x:0});

    gsap.to(track,{
      x:()=>-getDistance(),
      ease:"none",
      scrollTrigger:{
        trigger:section,
        start:"top top",
        end:()=>"+="+getDistance(),
        pin:pin,
        scrub:1,
        anticipatePin:1,
        invalidateOnRefresh:true
      }
    });
  });

  mm.add("(max-width:600px)",()=>{
    const getDistance=()=>Math.max(0,track.scrollWidth-window.innerWidth);
    gsap.set(track,{x:0});

    gsap.to(track,{
      x:()=>-getDistance(),
      ease:"none",
      scrollTrigger:{
        trigger:section,
        start:"top top",
        end:()=>"+="+Math.max(getDistance(),window.innerWidth*.8),
        pin:pin,
        scrub:.8,
        anticipatePin:1,
        invalidateOnRefresh:true
      }
    });
  });
}

function initScrollReveals(){
  const items=$$(".reveal");
  if(!items.length)return;

  if(window.gsap&&window.ScrollTrigger){
    gsap.utils.toArray(items).forEach((item,index)=>{
      gsap.fromTo(item,
        {y:48,opacity:0},
        {
          y:0,opacity:1,duration:.9,ease:"power3.out",
          delay:(index%4)*.05,
          scrollTrigger:{trigger:item,start:"top 88%",once:true}
        }
      );
    });
  }else{
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.1});
    items.forEach(item=>observer.observe(item));
  }
}

function initMouseInteraction(){
  if(!window.gsap||!window.matchMedia("(hover: hover) and (pointer: fine)").matches)return;

  const heroPhoto=$(".hero-photo");
  const heroContent=$(".hero-content");
  const visual=$(".visual-image");
  const mouseTargets=[heroPhoto,heroContent,visual].filter(Boolean);

  const quick=[];
  mouseTargets.forEach((element,index)=>{
    quick.push({
      element,
      x:gsap.quickTo(element,"x",{duration:.7,ease:"power3.out"}),
      y:gsap.quickTo(element,"y",{duration:.7,ease:"power3.out"})
    });
  });

  window.addEventListener("pointermove",event=>{
    const nx=event.clientX/window.innerWidth-.5;
    const ny=event.clientY/window.innerHeight-.5;

    quick.forEach((item,index)=>{
      const strength=index===0?12:index===1?7:9;
      item.x(nx*strength);
      item.y(ny*strength);
    });
  },{passive:true});

  $$(".primary,.header-cta").forEach(button=>{
    if(button.closest(".booking-panel")||button.closest(".detail-panel"))return;
    const x=gsap.quickTo(button,"x",{duration:.35,ease:"power3.out"});
    const y=gsap.quickTo(button,"y",{duration:.35,ease:"power3.out"});
    button.addEventListener("pointermove",event=>{
      const r=button.getBoundingClientRect();
      x((event.clientX-(r.left+r.width/2))*.035);
      y((event.clientY-(r.top+r.height/2))*.035);
    });
    button.addEventListener("pointerleave",()=>{x(0);y(0)});
  });

  $$(".collection-media,.service").forEach(card=>{
    const image=$("img",card);
    if(!image)return;
    const x=gsap.quickTo(image,"x",{duration:.45,ease:"power3.out"});
    const y=gsap.quickTo(image,"y",{duration:.45,ease:"power3.out"});
    card.addEventListener("pointermove",event=>{
      const r=card.getBoundingClientRect();
      x((event.clientX-(r.left+r.width/2))*.012);
      y((event.clientY-(r.top+r.height/2))*.012);
    });
    card.addEventListener("pointerleave",()=>{x(0);y(0)});
  });
}

function initReducedMotion(){
  if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(window.ScrollTrigger)ScrollTrigger.getAll().forEach(trigger=>trigger.kill());
  document.documentElement.classList.add("reduced-motion");
}

function initHeader(){
  const header=$(".header");
  if(!header)return;
  const update=()=>header.classList.toggle("scrolled",window.scrollY>50);
  update();
  window.addEventListener("scroll",update,{passive:true});

  const menu=$(".menu"),nav=$(".header nav");
  if(menu&&nav){
    menu.addEventListener("click",()=>document.body.classList.toggle("menu-open"));
    $$("a",nav).forEach(link=>link.addEventListener("click",()=>document.body.classList.remove("menu-open")));
  }
}

function initCinematicMotion(){
  if(!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);

  initReducedMotion();
  if(document.documentElement.classList.contains("reduced-motion"))return;

  initLenis();
  initHeroParallax();
  initPinnedReveal();
  initHorizontalScroll();
  initScrollReveals();
  initMouseInteraction();

  ScrollTrigger.refresh();
}

/* ------------------------------------------------------------------
   Booking flow
------------------------------------------------------------------- */
let selectedService="";
const modal=$("#bookingModal");
const steps=modal?$$(".modal-step",modal):[];
const dots=modal?$$(".steps i",modal):[];

function showStep(number){
  steps.forEach(step=>step.classList.toggle("active",+step.dataset.step===number));
  dots.forEach((dot,index)=>dot.classList.toggle("active",index<number));
}

function openBooking(service=""){
  selectedService=service;
  showStep(1);
  modal?.classList.add("open");
  modal?.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}

function closeBooking(){
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}

function dayStatus(value){
  const date=new Date(value+"T12:00:00");
  const blocked=(availability.blocked||{})[value]||[];
  if(availability.closedDays.includes(date.getDay()))return"closed";
  if(blocked.length===hours.length)return"closed";
  if(blocked.length>=5)return"limited";
  return"available";
}

function renderCalendar(){
  const strip=$("#calendarStrip"),grid=$("#slotGrid");
  if(!strip||!grid)return;

  strip.innerHTML="";
  grid.innerHTML="";
  const today=new Date();
  today.setHours(12,0,0,0);
  const chosen=$("#date")?.value||"";

  for(let i=0;i<14;i++){
    const date=new Date(today);
    date.setDate(today.getDate()+i);
    const value=iso(date);
    const status=dayStatus(value);
    const button=document.createElement("button");
    button.type="button";
    button.className="calendar-day "+status+(value===chosen?" active":"");
    button.disabled=status==="closed";
    button.innerHTML="<small>"+days[date.getDay()].slice(0,3)+"</small><b>"+date.getDate()+"</b><small>"+new Intl.DateTimeFormat("tr-TR",{month:"short"}).format(date)+"</small>";
    button.addEventListener("click",()=>{
      $("#date").value=value;
      $("#time").value="";
      renderCalendar();
    });
    strip.appendChild(button);
  }

  if(!chosen||dayStatus(chosen)==="closed"){
    $("#availabilityLabel").textContent="Bir gün seçin";
    $("#next").disabled=true;
    grid.innerHTML='<div class="slot-empty">Önce açık bir gün seçin.</div>';
    return;
  }

  $("#availabilityLabel").textContent=pretty(chosen);
  const blocked=(availability.blocked||{})[chosen]||[];

  hours.forEach(hour=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="slot"+(blocked.includes(hour)?" full":"");
    button.textContent=String(hour).padStart(2,"0")+":00";
    button.disabled=blocked.includes(hour);
    button.addEventListener("click",()=>{
      $("#time").value=button.textContent;
      $$(".slot",grid).forEach(item=>item.classList.remove("active"));
      button.classList.add("active");
      $("#next").disabled=false;
    });
    grid.appendChild(button);
  });

  $("#next").disabled=!$("#time").value;
}

function initBooking(){
  if(!modal)return;

  $$("[data-book]").forEach(button=>{
    button.addEventListener("click",event=>{
      event.preventDefault();
      openBooking();
    });
  });

  $$("[data-close]").forEach(button=>button.addEventListener("click",closeBooking));

  $$("[data-choice]").forEach(button=>{
    button.addEventListener("click",()=>{
      selectedService=button.dataset.choice||"";
      showStep(2);
      renderCalendar();
    });
  });

  $("#next")?.addEventListener("click",()=>{
    if(!$("#date").value||!$("#time").value){
      alert("Lütfen müsait bir gün ve saat seçin.");
      return;
    }
    showStep(3);
  });

  $("#send")?.addEventListener("click",()=>{
    const name=$("#name").value.trim();
    const customerPhone=$("#phone").value.trim();
    const date=$("#date").value;
    const time=$("#time").value;
    const note=$("#note").value.trim();

    if(!name||!customerPhone){
      alert("Lütfen ad soyad ve telefonunuzu yazın.");
      return;
    }

    const message="Merhaba Mira Güzellik Salonu, randevu talebinde bulunmak istiyorum.\n\nHizmet: "+selectedService+"\nTarih: "+pretty(date)+"\nSaat: "+time+"\nAd Soyad: "+name+"\nTelefon: "+customerPhone+(note?"\nNot: "+note:"");
    const url="https://wa.me/"+phone+"?text="+encodeURIComponent(message);

    $("#final-wa").href=url;
    showStep(4);
    window.open(url,"_blank","noopener,noreferrer");
  });

  $$("[data-wa]").forEach(link=>{
    link.addEventListener("click",event=>{
      event.preventDefault();
      const url="https://wa.me/"+phone+"?text="+encodeURIComponent("Merhaba Mira Güzellik Salonu, randevu ve hizmetler hakkında bilgi almak istiyorum.");
      window.open(url,"_blank","noopener,noreferrer");
    });
  });

  const detail=$("#detailModal");
  const details={
    "Protez Tırnak":"Tırnak görünümünü kişisel tercihinize göre şekillendiren profesyonel uygulama.",
    "Cilt Bakımı":"Cildin ihtiyacına göre bakım, temizleme, nemlendirme ve canlandırma odaklı uygulamalar.",
    "İpek Kirpik":"Kirpik görünümünü belirginleştirmeye yönelik uygulama seçenekleri.",
    "Manikür":"El ve tırnak bakımını bir araya getiren profesyonel bakım.",
    "Kalıcı Oje":"Bakımlı ve uzun süre düzenli görünen tırnaklar için uygulama."
  };

  $$("[data-service]").forEach(card=>{
    card.addEventListener("click",()=>{
      const title=card.dataset.service||"";
      $("#detailTitle").textContent=title;
      $("#detailText").textContent=details[title]||"Mira hizmetleri hakkında güncel bilgi ve uygunluk için ekibimizle iletişime geçebilirsiniz.";
      detail?.classList.add("open");
      $("#detailBook").onclick=()=>{
        detail?.classList.remove("open");
        openBooking(title);
      };
    });
  });

  $$("[data-detail-close]").forEach(button=>button.addEventListener("click",()=>detail?.classList.remove("open")));
  showStep(1);
  renderCalendar();
}

/* ------------------------------------------------------------------
   Local operator panel
------------------------------------------------------------------- */
function initAdmin(){
  document.body.innerHTML='<main class="admin-shell"><a class="underlink" href="./">← Siteye dön</a><p class="eyebrow" style="margin-top:45px"><i></i> İşletmeci paneli</p><h1>Randevu<br><em>uygunluğu.</em></h1><p class="admin-sub">Son dakika iptallerinde saatleri kapatın; müşterinin takviminde anında dolu görünür.</p><section class="admin-grid"><div class="admin-card"><h3>Çalışma günleri</h3><div class="admin-days" id="adminDays"></div></div><div class="admin-card"><h3>Günlük saatleri kapat</h3><input id="adminDate" type="date"><div class="admin-slots" id="adminSlots"></div><div class="admin-save"><button class="primary" id="saveAdmin">Kaydet</button><button class="primary" id="resetAdmin" style="background:#3b2b30;color:#eee">Sıfırla</button></div><p class="admin-note">Bu demo sürümünde uygunluk tarayıcı hafızasında tutulur. Ortak canlı kullanım için merkezi veritabanı bağlantısı gerekir.</p></div></section></main>';

  const daysRoot=$("#adminDays"),dateInput=$("#adminDate"),slotsRoot=$("#adminSlots");
  days.forEach((name,index)=>{
    const card=document.createElement("div");
    card.className="admin-day";
    card.innerHTML="<label>"+name+'<input type="checkbox" '+(availability.closedDays.includes(index)?"":"checked")+"></label>";
    card.querySelector("input").addEventListener("change",event=>{
      availability.closedDays=availability.closedDays.filter(value=>value!==index);
      if(!event.target.checked)availability.closedDays.push(index);
      saveAvailability();
    });
    daysRoot.appendChild(card);
  });

  dateInput.min=iso(new Date());
  dateInput.value=iso(new Date());

  const renderAdminSlots=()=>{
    const value=dateInput.value;
    const blocked=(availability.blocked||{})[value]||[];
    slotsRoot.innerHTML="";
    hours.forEach(hour=>{
      const button=document.createElement("button");
      button.className="admin-slot"+(blocked.includes(hour)?" blocked":"");
      button.textContent=String(hour).padStart(2,"0")+":00";
      button.addEventListener("click",()=>{
        const set=new Set((availability.blocked||{})[value]||[]);
        set.has(hour)?set.delete(hour):set.add(hour);
        availability.blocked[value]=[...set].sort((a,b)=>a-b);
        saveAvailability();
        renderAdminSlots();
      });
      slotsRoot.appendChild(button);
    });
  };

  dateInput.addEventListener("change",renderAdminSlots);
  $("#saveAdmin").addEventListener("click",()=>{
    saveAvailability();
    alert("Uygunluk güncellendi.");
  });
  $("#resetAdmin").addEventListener("click",()=>{
    availability=Object.assign({},defaults);
    saveAvailability();
    location.reload();
  });
  renderAdminSlots();
}

/* ------------------------------------------------------------------
   Boot
------------------------------------------------------------------- */
window.addEventListener("load",()=>{
  window.setTimeout(()=>$(".intro-loader")?.style.setProperty("transform","translateY(-100%)"),1200);
});

document.addEventListener("DOMContentLoaded",()=>{
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      closeBooking();
      $("#detailModal")?.classList.remove("open");
    }
  });

  initHeader();

  if(new URLSearchParams(location.search).get("yonetim")==="1"){
    initAdmin();
    return;
  }

  initBooking();
  initCinematicMotion();
});
})();