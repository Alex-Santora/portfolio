const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const siteHeader = document.querySelector(".site-header");
const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.prepend(scrollProgress);

const trackedSections = Array.from(
  document.querySelectorAll("#home-section, #about-section, #resume-section, #project-section, #contact-section")
);

let sectionRail = null;
let sectionRailMarkers = [];
let sectionRailThumb = null;
let sectionRailProgress = null;

if (trackedSections.length > 1) {
  sectionRail = document.createElement("div");
  sectionRail.className = "section-rail";
  sectionRail.setAttribute("aria-hidden", "true");

  sectionRailProgress = document.createElement("div");
  sectionRailProgress.className = "section-rail-progress";
  sectionRail.append(sectionRailProgress);

  sectionRailMarkers = trackedSections.map((section, index) => {
    const marker = document.createElement("div");
    marker.className = "section-rail-marker";
    marker.style.top = `${(index / (trackedSections.length - 1)) * 100}%`;

    const label = document.createElement("span");
    label.textContent = String(index).padStart(2, "0");

    const tick = document.createElement("span");
    marker.append(label, tick);
    sectionRail.append(marker);
    return { marker, section };
  });

  sectionRailThumb = document.createElement("div");
  sectionRailThumb.className = "section-rail-thumb";
  sectionRail.append(sectionRailThumb);
  document.body.append(sectionRail);
}

const heroParticles = document.querySelector(".hero-particles");
const heroSection = document.querySelector(".student-hero");
const heroCopy = document.querySelector(".hero-copy");

if (heroParticles) {
  const fieldCanvas = document.createElement("canvas");
  fieldCanvas.className = "hero-field";
  fieldCanvas.setAttribute("aria-hidden", "true");
  heroParticles.append(fieldCanvas);

  const orbit = document.createElement("div");
  orbit.className = "hero-orbit";
  heroParticles.append(orbit);

  for (let index = 0; index < 3; index += 1) {
    const node = document.createElement("span");
    node.className = "hero-node";
    heroParticles.append(node);
  }

  const context = fieldCanvas.getContext("2d");
  const pointer = { x: 0.76, y: 0.34, active: false };
  let fieldPoints = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationFrame = null;

  function resizeHeroField() {
    const rect = heroParticles.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = Math.max(1, Math.floor(rect.width));
    canvasHeight = Math.max(1, Math.floor(rect.height));
    fieldCanvas.width = Math.floor(canvasWidth * ratio);
    fieldCanvas.height = Math.floor(canvasHeight * ratio);
    fieldCanvas.style.width = `${canvasWidth}px`;
    fieldCanvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const spacing = canvasWidth < 720 ? 70 : 86;
    fieldPoints = [];

    for (let y = spacing * 0.55; y < canvasHeight; y += spacing) {
      for (let x = canvasWidth * 0.48; x < canvasWidth + spacing; x += spacing) {
        fieldPoints.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          drift: 5 + Math.random() * 11
        });
      }
    }
  }

  function drawHeroField(time = 0) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const targetX = pointer.x * canvasWidth;
    const targetY = pointer.y * canvasHeight;
    const pulse = pointer.active ? 1 : 0.62;

    context.lineWidth = 1;

    fieldPoints.forEach((point, index) => {
      const animatedX = point.x + Math.cos(time * 0.00045 + point.phase) * point.drift;
      const animatedY = point.y + Math.sin(time * 0.00055 + point.phase) * point.drift;
      const distance = Math.hypot(animatedX - targetX, animatedY - targetY);
      const heat = Math.max(0, 1 - distance / 230) * pulse;

      if (index % 2 === 0) {
        const neighbor = fieldPoints[index + 1];
        if (neighbor) {
          context.strokeStyle = `rgba(128, 0, 0, ${0.05 + heat * 0.18})`;
          context.beginPath();
          context.moveTo(animatedX, animatedY);
          context.lineTo(
            neighbor.x + Math.cos(time * 0.00045 + neighbor.phase) * neighbor.drift,
            neighbor.y + Math.sin(time * 0.00055 + neighbor.phase) * neighbor.drift
          );
          context.stroke();
        }
      }

      context.fillStyle = heat > 0.04 ? `rgba(128, 0, 0, ${0.18 + heat * 0.55})` : "rgba(110, 103, 100, 0.16)";
      context.fillRect(animatedX - 2, animatedY - 2, heat > 0.2 ? 5 : 3, heat > 0.2 ? 5 : 3);
    });

    context.strokeStyle = "rgba(128, 0, 0, 0.22)";
    context.beginPath();
    context.arc(targetX, targetY, 34 + Math.sin(time * 0.002) * 5, 0, Math.PI * 2);
    context.stroke();

    if (motionAllowed) {
      animationFrame = window.requestAnimationFrame(drawHeroField);
    }
  }

  resizeHeroField();
  drawHeroField();

  window.addEventListener("resize", () => {
    resizeHeroField();
    if (!motionAllowed) {
      drawHeroField();
    }
  });

  if (heroSection) {
    heroSection.addEventListener("pointermove", (event) => {
      const rect = heroSection.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      pointer.active = true;

      const offsetX = pointer.x - 0.5;
      const offsetY = pointer.y - 0.5;
      document.documentElement.style.setProperty("--hero-pointer-x", offsetX.toFixed(3));
      document.documentElement.style.setProperty("--hero-pointer-y", offsetY.toFixed(3));

      if (heroCopy && motionAllowed) {
        heroCopy.style.transform = `translate3d(${(-offsetX * 10).toFixed(2)}px, ${(-offsetY * 8).toFixed(2)}px, 0)`;
      }

      if (!motionAllowed) {
        drawHeroField();
      }
    });

    heroSection.addEventListener("pointerleave", () => {
      pointer.active = false;
      document.documentElement.style.setProperty("--hero-pointer-x", "0");
      document.documentElement.style.setProperty("--hero-pointer-y", "0");
      if (heroCopy) {
        heroCopy.style.transform = "";
      }
    });
  }

  document.querySelectorAll(".hero .btn").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      button.style.setProperty("--button-light-x", `${(x * 100).toFixed(1)}%`);
      button.style.setProperty("--button-light-y", `${(y * 100).toFixed(1)}%`);
      button.style.setProperty("--button-x", ((x - 0.5) * 8).toFixed(2));
      button.style.setProperty("--button-y", ((y - 0.5) * 6).toFixed(2));
    });

    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--button-x", "0");
      button.style.setProperty("--button-y", "0");
      button.style.setProperty("--button-light-x", "50%");
      button.style.setProperty("--button-light-y", "50%");
    });
  });
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

const resumeLinks = Array.from(document.querySelectorAll(".resume-nav a"))
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
  if (sectionRailProgress) {
    sectionRailProgress.style.height = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }
  if (sectionRailThumb) {
    sectionRailThumb.style.top = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }

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

    sectionRailMarkers.forEach(({ marker, section }) => {
      marker.classList.toggle("active", section === activeSection.section);
    });
  }

  if (resumeLinks.length) {
    const resumeSection = document.getElementById("resume-section");
    const resumeRect = resumeSection?.getBoundingClientRect();
    const resumeTriggerLine = window.innerHeight - 120;
    const resumeIsVisible = resumeRect && resumeRect.top <= window.innerHeight && resumeRect.bottom >= 96;
    const crossedResumeSections = resumeLinks
      .map((item) => ({ ...item, top: item.section.getBoundingClientRect().top }))
      .filter((item) => item.top <= resumeTriggerLine)
      .sort((a, b) => b.top - a.top);
    const activeResumeSection = crossedResumeSections[0] || resumeLinks[0];

    resumeLinks.forEach(({ link }) => {
      const isActive = resumeIsVisible && link === activeResumeSection.link;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
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
