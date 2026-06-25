import { translateToPlanguage } from "./planguage.js";

const inputEl = document.getElementById("inputText");
const outputEl = document.getElementById("outputText");
const charCountEl = document.getElementById("charCount");
const copyBtn = document.getElementById("copyBtn");
const toastEl = document.getElementById("toast");
const mascotBtn = document.getElementById("mascotBtn");
const mascotEl = document.getElementById("mascot");
const exampleBadgeEl = document.getElementById("exampleBadge");
const confettiLayerEl = document.getElementById("confettiLayer");

const EMPTY_HINT = "Your translation pops up here…";
const DEBOUNCE_MS = 80;
const PARTY_CLICKS = 7;
const PARTY_DURATION_MS = 5000;

let debounceTimer = null;
let toastTimer = null;
let mascotClicks = 0;
let partyActive = false;
let plangedShown = false;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function debounce(fn) {
  return (...args) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => fn(...args), DEBOUNCE_MS);
  };
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("show");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("show");
    window.setTimeout(() => toastEl.classList.add("hidden"), 250);
  }, 2200);
}

function updateCharCount(value) {
  const count = value.length;
  charCountEl.textContent = `${count} character${count === 1 ? "" : "s"}`;
}

function renderOutput(text) {
  if (!text.trim()) {
    outputEl.textContent = EMPTY_HINT;
    outputEl.classList.add("empty");
    outputEl.classList.remove("updated");
    return;
  }

  outputEl.textContent = translateToPlanguage(text);
  outputEl.classList.remove("empty");
  outputEl.classList.remove("updated");
  void outputEl.offsetWidth;
  outputEl.classList.add("updated");
}

function checkEasterEggs(rawInput) {
  const trimmed = rawInput.trim();
  const normalized = trimmed.toLowerCase();

  if (normalized === "planguage" && !plangedShown) {
    plangedShown = true;
    showToast("Planged!");
  }

  if (trimmed === "for example") {
    exampleBadgeEl.classList.remove("hidden");
    mascotEl.classList.remove("wink");
    void mascotEl.offsetWidth;
    mascotEl.classList.add("wink");
  } else {
    exampleBadgeEl.classList.add("hidden");
  }
}

function spawnConfetti() {
  if (prefersReducedMotion || partyActive) {
    return;
  }

  partyActive = true;
  confettiLayerEl.classList.remove("hidden");
  confettiLayerEl.replaceChildren();

  const colors = ["#ff6b6b", "#ffd93d", "#4ecdc4", "#ff8787", "#6c5ce7"];

  for (let i = 0; i < 36; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = "P";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.fontSize = `${16 + Math.random() * 22}px`;
    piece.style.color = colors[i % colors.length];
    piece.style.animationDuration = `${2.4 + Math.random() * 2.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    confettiLayerEl.appendChild(piece);
  }

  window.setTimeout(() => {
    confettiLayerEl.classList.add("hidden");
    confettiLayerEl.replaceChildren();
    partyActive = false;
  }, PARTY_DURATION_MS);
}

const handleInput = debounce(() => {
  const value = inputEl.value;
  updateCharCount(value);
  renderOutput(value);
  checkEasterEggs(value);
});

inputEl.addEventListener("input", handleInput);

copyBtn.addEventListener("click", async () => {
  const text = outputEl.textContent;
  if (!text || outputEl.classList.contains("empty")) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied!");
  } catch {
    showToast("Copy failed");
  }
});

mascotBtn.addEventListener("click", () => {
  mascotClicks += 1;
  if (mascotClicks >= PARTY_CLICKS) {
    mascotClicks = 0;
    spawnConfetti();
    showToast("Party mode!");
  }
});

updateCharCount("");
renderOutput("");
