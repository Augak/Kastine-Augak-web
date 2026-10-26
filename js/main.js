(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const menu = $("menu"), nav = $("nav"), topButton = $("top");
  if (menu && nav) {
    menu.setAttribute("aria-expanded", "false");
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menu.textContent = open ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open navigation"); menu.textContent = "☰";
    }));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); menu.textContent = "☰"; }
    });
  }
  const year = $("year"); if (year) year.textContent = new Date().getFullYear();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    reveals.forEach((el, i) => { el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms"; observer.observe(el); });
  } else reveals.forEach(el => el.classList.add("is-visible"));
  function onScroll() { if (topButton) topButton.classList.toggle("visible", window.scrollY > 500); }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
  if (topButton) topButton.addEventListener("click", () => window.scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"}));

  const iconPaths = [
    {test:/github\.com/i,label:"GitHub",path:'<path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.16 3.78 1.56.1-.72.39-1.2.7-1.48-2.48-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.3-2.6 5.25-5.1 5.52.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/>'},
    {test:/wa\.me|whatsapp/i,label:"WhatsApp",path:'<path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l6-1.6a11.8 11.8 0 0 0 14-18.4ZM12 21.2a9.5 9.5 0 0 1-4.8-1.3l-.35-.2-3.55.93.95-3.46-.23-.36A9.5 9.5 0 1 1 12 21.2Zm5.2-7.1c-.28-.14-1.66-.82-1.92-.92-.26-.1-.45-.14-.64.14-.19.29-.73.92-.9 1.1-.16.2-.33.22-.62.08-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.4-1.67-1.57-1.95-.16-.29-.02-.44.12-.58.13-.13.29-.33.43-.49.14-.17.19-.29.28-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.1-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.5.07-.76.36-.26.28-1  .97-1 2.37s1.02 2.75 1.16 2.94c.14.19 2 3.06 4.84 4.29.68.3 1.2.48 1.61.61.68.21 1.3.18 1.79.11.54-.08 1.66-.68 1.9-1.35.23-.67.23-1.24.16-1.36-.07-.12-.26-.19-.55-.33Z"/>'},
    {test:/truelancer\.com/i,label:"Truelancer",path:'<path d="M4 3h16v4H4zM6 9h12v12H6zM9 12h6v2H9zm0 4h6v2H9z"/>'},
    {test:/twine\.net/i,label:"Twine",path:'<path d="M12 2 2 7.5v9L12 22l10-5.5v-9L12 2Zm0 3 6.8 3.7L12 12.5 5.2 8.7 12 5Zm-7 6.2 5.5 3v4.1l-5.5-3v-4.1Zm14 4.1-5.5 3v-4.1l5.5-3v4.1Z"/>'},
    {test:/airbit\.com/i,label:"Airbit",path:'<path d="M12 2 1 21h22L12 2Zm0 5 6.1 11H5.9L12 7Zm-1 4v4h2v-4h-2Z"/>'},
    {test:/linktr\.ee/i,label:"Linktree",path:'<path d="m12 2 3.2 3.2-2 2L12 5.9l-1.2 1.3-2-2L12 2Zm-5.5 6.5 3.1 3.1-2 2-3.1-3.1 2-2Zm11 0 2 2-3.1 3.1-2-2 3.1-3.1ZM12 9l3.2 3.2-2 2-1.2-1.3-1.2 1.3-2-2L12 9Zm-1.4 5.5h2.8V22h-2.8v-7.5Z"/>'},
    {test:/fueler\.io/i,label:"Fueler",path:'<path d="M5 2h14v4H9v4h8v4H9v8H5z"/>'},
    {test:/neocities\.org/i,label:"Neocities",path:'<path d="M3 4h4l10 12V4h4v16h-4L7 8v12H3z"/>'},
    {test:/netlify\.app/i,label:"Website",path:'<path d="M12 2 4 6.5v11L12 22l8-4.5v-11L12 2Zm0 3.2 5 2.8-5 2.8-5-2.8 5-2.8Zm-5.8 6 4.3 2.4v5.1l-4.3-2.4v-5.1Zm11.6 5.1-4.3 2.4v-5.1l4.3-2.4v5.1Z"/>'},
    {test:/wikimedia\.org/i,label:"Wikimedia",path:'<path d="M2 4h4l2 10 3-7h2l3 7 2-10h4l-4 16h-3l-3-7-3 7H6z"/>'},
    {test:/iverifyai\.vercel\.app|soma-gpt\.netlify\.app/i,label:"Product",path:'<path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm0 3.2L17.5 8 12 10.8 6.5 8 12 5.2ZM5 10.4l5.5 2.9v5.1L5 15.5v-5.1Zm14 5.1-5.5 2.9v-5.1l5.5-2.9v5.1Z"/>'},
    {test:/mailto:/i,label:"Email",path:'<path d="M3 5h18v14H3V5Zm2 2v.5l7 5 7-5V7l-7 5-7-5Zm14 10V10l-7 5-7-5v7h14Z"/>'},
    {test:/kastineaugak\.netlify\.app/i,label:"Portfolio",path:'<path d="M4 3h16v3H4zM3 8h18v13H3zM6 11v7h2v-7zm5 0v7h2v-7zm5 0v7h2v-7z"/>'}
  ];
  document.querySelectorAll(".socials a").forEach(link => {
    if (link.querySelector(".social-icon")) return;
    const item = iconPaths.find(entry => entry.test.test(link.href));
    if (!item) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24"); svg.setAttribute("aria-hidden","true"); svg.classList.add("social-icon");
    svg.innerHTML = item.path;
    link.prepend(svg);
    if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", item.label + (link.target === "_blank" ? " — opens in a new tab" : ""));
  });
})();