// ---------- Terminal typing animation ----------
renderPostList(document.getElementById("posts-list"));

const lines = [
  "whoami",
  "> nova — creative developer",
  "cat interests.txt",
  "> react · css · motion · webgl",
  "npm run ideas",
  "> building the future, one pixel at a time",
  "echo 'welcome to cyberspace'",
  "> welcome to cyberspace_",
];

const typedEl = document.getElementById("typed");

async function typeLine(text) {
  typedEl.textContent = "";
  for (const char of text) {
    typedEl.textContent += char;
    await new Promise((r) => setTimeout(r, 28));
  }
  await new Promise((r) => setTimeout(r, 650));
}

async function runTerminal() {
  let i = 0;
  while (true) {
    await typeLine(lines[i % lines.length]);
    i += 1;
  }
}

if (typedEl) {
  runTerminal();
}

// ---------- Newsletter (demo) ----------
const form = document.getElementById("newsletter");
const note = document.getElementById("newsletter-note");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = form.email.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    note.textContent = "⚠ INVALID SIGNAL — ENTER A VALID EMAIL";
    note.style.color = "var(--magenta)";
    return;
  }
  note.textContent = "✓ CONNECTION ESTABLISHED — WELCOME ABOARD";
  note.style.color = "var(--cyan)";
  form.email.value = "";
});

// ---------- Reveal on scroll ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".card, .post, .about__panel").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".is-visible").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
});

// Patch: mark visible elements when they enter
const style = document.createElement("style");
style.textContent = ".is-visible { opacity: 1 !important; transform: translateY(0) !important; }";
document.head.appendChild(style);
