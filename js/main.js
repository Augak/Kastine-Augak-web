(() => {
"use strict";
const $ = id => document.getElementById(id);
const menu = $("menu"), nav = $("nav"), topButton = $("top");
const firstNavLink = nav?.querySelector("a");
function setMenu(open, moveFocus = false) {
 if (!menu || !nav) return;
 nav.classList.toggle("open", open);
 menu.setAttribute("aria-expanded", String(open));
 menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
 menu.textContent = open ? "Close" : "Menu";
 if (open && moveFocus) firstNavLink?.focus();
}
if (menu && nav) {
 menu.addEventListener("click", () => {
  const open = nav.classList.contains("open");
  setMenu(!open, !open);
 });
 nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
 document.addEventListener("keydown", e => {
  if(e.key==="Escape" && nav.classList.contains("open")){setMenu(false);menu.focus();}
 });
}
const year=$("year"); if(year) year.textContent=new Date().getFullYear();
const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window && !reduceMotion){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});
 },{threshold:.12,rootMargin:"0px 0px -30px 0px"});
 reveals.forEach((el,i)=>{el.style.transitionDelay=(Math.min(i%3,2)*65)+"ms";observer.observe(el);});
}else reveals.forEach(el=>el.classList.add("is-visible"));
function onScroll(){if(topButton)topButton.classList.toggle("visible",window.scrollY>450);}
window.addEventListener("scroll",onScroll,{passive:true});onScroll();
if(topButton)topButton.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"}));
// Recognizable brand marks for the primary social services; other professional profiles keep their readable labels.
const brands=[
 {test:/github\.com/i,label:"GitHub",path:'<path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.16 3.78 1.56.1-.72.39-1.2.7-1.48-2.48-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.3-2.6 5.25-5.1 5.52.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/>'},
 {test:/wa\.me|whatsapp/i,label:"WhatsApp",path:'<path d="M20.52 3.48A11.8 11.8 0 0 0 2.04 17.7L.5 23.5l5.94-1.56A11.8 11.8 0 0 0 20.52 3.48ZM12 21.15a9.5 9.5 0 0 1-4.84-1.32l-.35-.21-3.53.93.94-3.44-.23-.36A9.5 9.5 0 1 1 12 21.15Zm5.22-7.12c-.29-.14-1.68-.83-1.94-.92-.26-.1-.45-.14-.64.14-.19.29-.73.92-.9 1.11-.17.19-.33.21-.62.07-.29-.14-1.21-.44-2.3-1.4-.85-.76-1.42-1.69-1.58-1.98-.17-.28-.02-.44.12-.58.13-.13.29-.33.43-.49.14-.17.19-.29.29-.48.09-.19.04-.36-.03-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48h-.54c-.19 0-.5.07-.76.36-.26.28-1  .97-1 2.37s1.02 2.75 1.16 2.94c.14.19 2 3.06 4.84 4.29.68.3 1.2.48 1.61.61.68.21 1.3.18 1.79.11.54-.08 1.66-.68 1.9-1.35.23-.67.23-1.24.16-1.36-.07-.12-.26-.19-.55-.33Z"/>'},
 {test:/linktr\.ee/i,label:"Linktree",path:'<path d="m12 2 3.2 3.2-2 2L12 5.9l-1.2 1.3-2-2L12 2Zm-5.5 6.5 3.1 3.1-2 2-3.1-3.1 2-2Zm11 0 2 2-3.1 3.1-2-2 3.1-3.1ZM12 9l3.2 3.2-2 2-1.2-1.3-1.2 1.3-2-2L12 9Zm-1.4 5.5h2.8V22h-2.8v-7.5Z"/>'}
];
document.querySelectorAll(".socials a").forEach(link=>{
 if(link.querySelector(".social-icon"))return;
 const brand=brands.find(item=>item.test.test(link.href)); if(!brand)return;
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");svg.classList.add("social-icon");svg.innerHTML=brand.path;
 link.prepend(svg);if(!link.getAttribute("aria-label"))link.setAttribute("aria-label",brand.label+(link.target==="_blank"?" — opens in a new tab":""));
});
})();