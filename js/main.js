// Scroll reveal + parallax
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

$("#year").textContent = new Date().getFullYear();

// Reveal on scroll
const revealEls = $$(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// Parallax (lightweight)
const parallaxEls = $$(".parallax");

function parallaxTick(){
  const y = window.scrollY || window.pageYOffset;
  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.speed || "0.2");
    // Translate background layers slightly for depth
    el.style.transform = `translate3d(0, ${y * speed * -0.25}px, 0)`;
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking){
    window.requestAnimationFrame(() => {
      parallaxTick();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

parallaxTick();
