import { ensureReverseDictionary, translateFromPlanguage, translateToPlanguage } from "./planguage.js";

const inputEl = document.getElementById("inputText");
const outputEl = document.getElementById("outputText");
const inputLabelEl = document.getElementById("inputLabel");
const outputLabelEl = document.getElementById("outputLabel");
const directionBtn = document.getElementById("directionBtn");
const directionLabelEl = document.getElementById("directionLabel");
const charCountEl = document.getElementById("charCount");
const copyBtn = document.getElementById("copyBtn");
const toastEl = document.getElementById("toast");
const mascotBtn = document.getElementById("mascotBtn");
const mascotEl = document.getElementById("mascot");
const exampleBadgeEl = document.getElementById("exampleBadge");
const confettiLayerEl = document.getElementById("confettiLayer");
const translatorCardEl = document.querySelector(".translator-card");
const inputPanelEl = document.querySelector(".panel-input");
const outputPanelEl = document.querySelector(".panel-output");

const EMPTY_HINT = "Your translation pops up here…";
const DEBOUNCE_MS = 80;
const PARTY_CLICKS = 7;
const PARTY_DURATION_MS = 5000;

const DIRECTION = {
  EN_TO_PL: "en-to-pl",
  PL_TO_EN: "pl-to-en",
};

const UI = {
  [DIRECTION.EN_TO_PL]: {
    inputLabel: "English",
    outputLabel: "Planguage",
    inputPlaceholder: "Type something… for example",
    switchLabel: "Planguage → English",
    switchAria: "Switch to Planguage to English",
  },
  [DIRECTION.PL_TO_EN]: {
    inputLabel: "Planguage",
    outputLabel: "English",
    inputPlaceholder: "Type something… pop epappe",
    switchLabel: "English → Planguage",
    switchAria: "Switch to English to Planguage",
  },
};

let direction = DIRECTION.EN_TO_PL;
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

function translate(text) {
  return direction === DIRECTION.EN_TO_PL
    ? translateToPlanguage(text)
    : translateFromPlanguage(text);
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

function updateDirectionUI() {
  const config = UI[direction];
  inputLabelEl.textContent = config.inputLabel;
  outputLabelEl.textContent = config.outputLabel;
  inputEl.placeholder = config.inputPlaceholder;
  directionLabelEl.textContent = config.switchLabel;
  directionBtn.title = config.switchLabel;
  directionBtn.setAttribute("aria-label", config.switchAria);
}

function swapPanels() {
  const swapped = translatorCardEl.classList.toggle("is-swapped");
  if (swapped) {
    translatorCardEl.insertBefore(outputPanelEl, inputPanelEl);
  } else {
    translatorCardEl.insertBefore(inputPanelEl, outputPanelEl);
  }
}

function renderOutput(text) {
  if (!text.trim()) {
    outputEl.textContent = EMPTY_HINT;
    outputEl.classList.add("empty");
    outputEl.classList.remove("updated");
    return;
  }

  outputEl.textContent = translate(text);
  outputEl.classList.remove("empty");
  outputEl.classList.remove("updated");
  void outputEl.offsetWidth;
  outputEl.classList.add("updated");
}

function checkEasterEggs(rawInput) {
  const trimmed = rawInput.trim();
  const normalized = trimmed.toLowerCase();

  if (direction === DIRECTION.EN_TO_PL && normalized === "planguage" && !plangedShown) {
    plangedShown = true;
    showToast("Planged!");
  }

  const showExampleBadge =
    (direction === DIRECTION.EN_TO_PL && trimmed === "for example") ||
    (direction === DIRECTION.PL_TO_EN && trimmed === "pop epappe");

  if (showExampleBadge) {
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

async function switchDirection() {
  window.clearTimeout(debounceTimer);

  const previousDirection = direction;
  const currentInput = inputEl.value;
  const currentOutput = outputEl.classList.contains("empty") ? "" : outputEl.textContent;

  direction =
    direction === DIRECTION.EN_TO_PL ? DIRECTION.PL_TO_EN : DIRECTION.EN_TO_PL;

  if (direction === DIRECTION.PL_TO_EN) {
    directionBtn.disabled = true;
    try {
      await ensureReverseDictionary();
    } catch {
      direction = previousDirection;
      showToast("Reverse dictionary failed to load");
      directionBtn.disabled = false;
      return;
    }
    directionBtn.disabled = false;
  }

  swapPanels();
  updateDirectionUI();

  if (currentOutput) {
    inputEl.value = currentOutput;
  } else if (currentInput) {
    inputEl.value =
      previousDirection === DIRECTION.EN_TO_PL
        ? translateToPlanguage(currentInput)
        : translateFromPlanguage(currentInput);
  } else {
    inputEl.value = "";
  }

  updateCharCount(inputEl.value);
  renderOutput(inputEl.value);
  checkEasterEggs(inputEl.value);
}

const handleInput = debounce(() => {
  const value = inputEl.value;
  updateCharCount(value);
  renderOutput(value);
  checkEasterEggs(value);
});

inputEl.addEventListener("input", handleInput);
directionBtn.addEventListener("click", () => {
  void switchDirection();
});

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
    showToast(translateToPlanguage("Party mode!"));
  }
});

updateDirectionUI();
updateCharCount("");
renderOutput("");
