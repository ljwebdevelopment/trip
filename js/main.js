const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

$("#year").textContent = new Date().getFullYear();

const feed = $("#feed");
const sentinel = $("#sentinel");
const moreNowBtn = $("#moreNow");

let activeFilter = "any";
let chapterCount = 0;

/** Vibe library */
const VIBES = {
  cabin: {
    label: "Cabin / Cozy",
    tag: "CABIN",
    images: [
      "../assets/cabin1.jpg",
      "../assets/cabin2.jpg",
      "../assets/cabin3.jpg"
    ],
    lines: [
      "A slow morning. A mug you can warm your hands on. Pine air in your hoodie.",
      "A tiny town store. A creaky porch swing. A playlist that feels like a blanket.",
      "Firelight, board games, and the kind of quiet that makes your shoulders drop."
    ],
    titles: [
      "Cabin time, no pressure",
      "Warm lights & woodsmoke",
      "The cozy reset weekend"
    ]
  },
  city: {
    label: "City / Neon",
    tag: "CITY",
    images: [
      "../assets/city1.jpg",
      "../assets/city2.jpg",
      "../assets/city3.jpg"
    ],
    lines: [
      "Neon reflections on the sidewalk. Late eats. No rush, just roaming.",
      "A diner booth, fries, and a playlist that makes the city feel softer.",
      "Warm streetlights, window shopping, and a dessert you didn’t plan on."
    ],
    titles: [
      "Neon nights & night eats",
      "Low-effort city wandering",
      "A playlist for streetlights"
    ]
  },
  desert: {
    label: "Desert / Roadtrip",
    tag: "DESERT",
    images: [
      "../assets/desert1.jpg",
      "../assets/desert2.jpg",
      "../assets/desert3.jpg"
    ],
    lines: [
      "Big sky. Long road. The kind of horizon that clears your head.",
      "A retro motel sign. A sunrise you didn’t have to earn too hard.",
      "Windows down, warm air, and a view that looks like a postcard."
    ],
    titles: [
      "Big skies & long roads",
      "Retro stops, easy pace",
      "Sunrise on the highway"
    ]
  }
};

/** Balanced randomness so it doesn't spam one vibe */
const recent = []; // keep last few vibes to avoid repeats
function pickVibe(){
  const allowed = Object.keys(VIBES).filter(v => activeFilter === "any" ? true : v === activeFilter);

  // If filtered, just use that
  if (activeFilter !== "any") return allowed[0];

  // Otherwise avoid repeating the same vibe too often
  const choices = allowed.filter(v => !recent.includes(v));
  const pool = choices.length ? choices : allowed;

  const v = pool[Math.floor(Math.random() * pool.length)];
  recent.push(v);
  while (recent.length > 2) recent.shift(); // prevent immediate repeats
  return v;
}

function pick(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeChapter(){
  const vibeKey = pickVibe();
  const vibe = VIBES[vibeKey];

  chapterCount += 1;
  const title = pick(vibe.titles);
  const line = pick(vibe.lines);
  const img = pick(vibe.images);

  const el = document.createElement("article");
  el.className = "chapter reveal";
  el.dataset.vibe = vibeKey;

  el.innerHTML = `
    <div class="chapter__bg parallax" data-speed="${(Math.random() * 0.18 + 0.12).toFixed(2)}"
         style="background-image:
           linear-gradient(to bottom, rgba(11,15,14,.12), rgba(11,15,14,.88)),
           url('${img}');
         ">
    </div>
    <div class="chapter__veil"></div>
    <div class="chapter__content">
      <div class="kicker"><span class="dot"></span> ${vibe.tag} • CHAPTER ${chapterCount}</div>
      <h3>${title}</h3>
      <p>${line}</p>
    </div>
  `;

  feed.appendChild(el);
  revealObserver.observe(el);
}

function seedInitial(){
  for (let i = 0; i < 6; i++) makeChapter();
}

/* Scroll reveal observer */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

/* Infinite scroll: add more when sentinel appears */
const infiniteObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    // Add a batch
    for (let i = 0; i < 4; i++) makeChapter();
  });
}, { rootMargin: "800px 0px 800px 0px" });

/* Parallax: update all .parallax nodes */
function parallaxTick(){
  const y = window.scrollY || window.pageYOffset;
  $$(".parallax").forEach(el => {
    const speed = parseFloat(el.dataset.speed || "0.2");
    el.style.transform = `translate3d(0, ${y * speed * -0.25}px, 0)`;
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    parallaxTick();
    ticking = false;
  });
}, { passive: true });

/* Filter chips */
$$(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".chip").forEach(b => b.classList.remove("is-on"));
    btn.classList.add("is-on");

    activeFilter = btn.dataset.filter; // any/cabin/city/desert

    // Reset feed to make it feel like a new “timeline”
    feed.innerHTML = "";
    chapterCount = 0;
    recent.length = 0;
    seedInitial();
    parallaxTick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

moreNowBtn.addEventListener("click", () => {
  for (let i = 0; i < 2; i++) makeChapter();
  parallaxTick();
});

/* Init */
seedInitial();
infiniteObserver.observe(sentinel);
parallaxTick();
