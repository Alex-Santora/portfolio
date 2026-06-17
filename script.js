/* ============================================================
   Alex Santora — portfolio interactions
   One disciplined scroll-reveal system, scroll-spy nav,
   condensing header, mobile menu, progress bar, photo loader.
   ============================================================ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- mobile navigation ---------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

function closeMenu(returnFocus) {
  if (!navLinks || !navToggle) return;
  navLinks.classList.remove("open");
  navToggle.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  if (returnFocus) navToggle.focus();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close after tapping a link.
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  // Escape closes the menu and returns focus to the toggle.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) closeMenu(true);
  });

  // Clicking outside the open menu closes it.
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("open") &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMenu(false);
    }
  });
}

/* ---------- scroll progress bar ---------- */
const progress = document.createElement("div");
progress.className = "scroll-progress";
progress.setAttribute("aria-hidden", "true");
document.body.prepend(progress);

/* ---------- scroll reveal (single system) ---------- */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in"));
}

/* ---------- header condense + scroll spy + progress ---------- */
const header = document.querySelector(".site-header");

// Two independent spy groups: the top nav tracks the five top-level sections,
// the resume side-nav tracks its three sub-blocks. Kept separate so neither
// overwrites the other's active state.
function buildSpyGroup(selector) {
  return Array.from(document.querySelectorAll(selector))
    .map((link) => {
      const id = link.hash ? link.hash.slice(1) : "";
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);
}

const mainNav = buildSpyGroup(".nav-links a");
const resumeNav = buildSpyGroup(".resume-nav a");

function spy(group, marker) {
  if (!group.length) return;
  let current = group[0];
  for (const item of group) {
    if (item.section.offsetTop <= marker) current = item;
  }
  group.forEach(({ link }) => {
    const active = link === current.link;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

let ticking = false;

function onScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  doc.style.setProperty("--progress", ratio.toFixed(4));

  header?.classList.toggle("scrolled", window.scrollY > 8);

  const marker = window.scrollY + window.innerHeight * 0.32;
  spy(mainNav, marker);
  spy(resumeNav, marker);

  ticking = false;
}

function requestTick() {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
}

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);
onScroll();

/* ---------- profile photo loader ---------- */
document.querySelectorAll("[data-profile-photo]").forEach((el) => {
  const src = el.getAttribute("data-profile-photo");
  const probe = new Image();
  probe.onload = () => {
    el.style.backgroundImage = `url("${src}")`;
    el.classList.add("has-photo");
  };
  probe.src = src;
});
