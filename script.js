(() => {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const phone="903124183102";
const wa=(text)=>{const url="https://wa.me/"+phone+"?text="+encodeURIComponent(text); window.open(url,"_blank","noopener,noreferrer"); return url;};

window.addEventListener("load",()=>{setTimeout(()=>$(".intro-loader")?.style.setProperty("transform","translateY(-100%)"),1900);});
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12});
$$(".reveal").forEach(e=>observer.observe(e));

let selectedService="";
const modal=$("#bookingModal"), steps=$$(".modal-step",modal), dots=$$(".steps i",modal);
function showStep(n){steps.forEach(x=>x.classList.toggle("active",+x.dataset.step===n));dots.forEach((x,i)=>x.classList.toggle("active",i<n));}
function openBooking(service=""){selectedService=service;showStep(1);modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeBooking(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow="";}
$$("[data-book]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openBooking()}));
$$("[data-close]").forEach(b=>b.addEventListener("click",closeBooking));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeBooking();$("#detailModal")?.classList.remove("open")}});

$$("[data-choice]").forEach(b=>b.addEventListener("click",()=>{selectedService=b.dataset.choice;showStep(2)}));
const date=$("#date"); const today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset()); date.min=today.toISOString().slice(0,10);
$("#next").addEventListener("click",()=>{if(!date.value||!$("#time").value){alert("Lütfen gün ve saat seçin.");return}showStep(3)});
$("#send").addEventListener("click",()=>{
const name=$("#name").value.trim(), p=$("#phone").value.trim(), note=$("#note").value.trim(), d=date.value, t=$("#time").value;
if(!name||!p){alert("Lütfen ad soyad ve telefonunuzu yazın.");return}
const pretty=new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(d+"T12:00:00"));
const msg="Merhaba Mira Güzellik Salonu, randevu talebinde bulunmak istiyorum.\n\nHizmet: "+selectedService+"\nTarih: "+pretty+"\nSaat: "+t+"\nAd Soyad: "+name+"\nTelefon: "+p+(note?"\nNot: "+note:"");
const url="https://wa.me/"+phone+"?text="+encodeURIComponent(msg);
$("#final-wa").href=url; showStep(4); window.open(url,"_blank","noopener,noreferrer");
});

$$("[data-wa]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();wa("Merhaba Mira Güzellik Salonu, randevu ve hizmetler hakkında bilgi almak istiyorum.")}));

const details={
"Protez Tırnak":"Tırnak görünümünü kişisel tercihinize göre şekillendiren profesyonel uygulama.",
"Cilt Bakımı":"Cildin ihtiyacına göre bakım, temizleme, nemlendirme ve canlandırma odaklı uygulamalar.",
"İpek Kirpik":"Kirpik görünümünü belirginleştirmeye yönelik uygulama seçenekleri.",
"Manikür":"El ve tırnak bakımını bir araya getiren profesyonel bakım.",
"Kalıcı Oje":"Bakımlı ve uzun süre düzenli görünen tırnaklar için uygulama."
};
const detail=$("#detailModal");
$$("[data-service]").forEach(card=>card.addEventListener("click",()=>{const title=card.dataset.service;$("#detailTitle").textContent=title;$("#detailText").textContent=details[title]||"Mira hizmetleri hakkında güncel bilgi ve uygunluk için ekibimizle iletişime geçebilirsiniz.";detail.classList.add("open");detail.setAttribute("aria-hidden","false");$("#detailBook").onclick=()=>{detail.classList.remove("open");openBooking(title)}}));
$$("[data-detail-close]").forEach(x=>x.addEventListener("click",()=>{detail.classList.remove("open");detail.setAttribute("aria-hidden","true")}));

// Subtle pointer parallax on desktop.
if(matchMedia("(pointer:fine)").matches){
document.addEventListener("pointermove",e=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);document.documentElement.style.setProperty("--mx",x.toFixed(3));document.documentElement.style.setProperty("--my",y.toFixed(3));});
}
})();