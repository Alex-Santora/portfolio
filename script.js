const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const siteHeader = document.querySelector(".site-header");
const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.prepend(scrollProgress);

const heroParticles = document.querySelector(".hero-particles");

if (heroParticles && motionAllowed) {
  const particleCount = 34;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const size = 2 + Math.random() * 4;
    const drift = -80 + Math.random() * 160;
    const duration = 9 + Math.random() * 11;
    const delay = -Math.random() * duration;
    const opacity = 0.16 + Math.random() * 0.34;

    particle.style.setProperty("--particle-left", `${Math.random() * 100}%`);
    particle.style.setProperty("--particle-size", `${size.toFixed(1)}px`);
    particle.style.setProperty("--particle-drift", `${drift.toFixed(1)}px`);
    particle.style.setProperty("--particle-duration", `${duration.toFixed(1)}s`);
    particle.style.setProperty("--particle-delay", `${delay.toFixed(1)}s`);
    particle.style.setProperty("--particle-opacity", opacity.toFixed(2));

    heroParticles.appendChild(particle);
  }
}

// Toggle the mobile navigation menu and keep the ARIA state accurate.
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (navToggle && navLinks) {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
});

// Subtle scroll reveal for a more polished student portfolio feel.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const sectionLinks = Array.from(document.querySelectorAll(".nav-links a"))
  .map((link) => {
    const id = link.hash ? link.hash.slice(1) : "";
    const section = id ? document.getElementById(id) : null;
    return { link, section };
  })
  .filter((item) => item.section);

let ticking = false;

function updateScrollEffects() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  siteHeader?.classList.toggle("scrolled", window.scrollY > 18);

  if (motionAllowed) {
    document.documentElement.style.setProperty("--hero-drift", `${window.scrollY * 0.05}px`);
    document.documentElement.style.setProperty("--hero-copy-drift", `${window.scrollY * -0.025}px`);
  }

  if (sectionLinks.length) {
    const activeSection = sectionLinks
      .map((item) => ({ ...item, distance: Math.abs(item.section.getBoundingClientRect().top - 120) }))
      .sort((a, b) => a.distance - b.distance)[0];

    sectionLinks.forEach(({ link }) => {
      const isActive = link === activeSection.link;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  ticking = false;
}

function requestScrollUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollEffects();

if (motionAllowed) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

// Load images/profile.jpg if it exists; otherwise the placeholder box remains visible.
document.querySelectorAll("[data-profile-photo]").forEach((photo) => {
  const imagePath = photo.getAttribute("data-profile-photo");
  const testImage = new Image();

  testImage.onload = () => {
    photo.style.backgroundImage = `url("${imagePath}")`;
    photo.classList.add("has-photo");
  };

  testImage.src = imagePath;
});

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

function setError(input, message) {
  const group = input.closest(".form-group");
  const error = group.querySelector(".error-message");
  error.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (contactForm) {
  // This is front-end-only validation; no message is submitted to a server.
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;
    const fields = contactForm.querySelectorAll("input, textarea");

    fields.forEach((field) => {
      const value = field.value.trim();
      setError(field, "");

      if (!value) {
        isValid = false;
        setError(field, "This field is required.");
      } else if (field.type === "email" && !isValidEmail(value)) {
        isValid = false;
        setError(field, "Please enter a valid email address.");
      }
    });

    if (isValid) {
      contactForm.reset();
      formStatus.textContent = "Thanks! Your message has been received.";
    } else {
      formStatus.textContent = "";
    }
  });
}
