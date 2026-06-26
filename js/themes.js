export const THEMES = [
  { id: "coral", label: "Coral Pop" },
  { id: "blossom", label: "Blossom" },
  { id: "mint", label: "Mint Dream" },
  { id: "lavender", label: "Lavender Haze" },
  { id: "peach", label: "Peach Sorbet" },
  { id: "candy", label: "Cotton Candy" },
  { id: "lemon", label: "Lemon Fizz" },
];

const STORAGE_KEY = "planguage-theme";

export function getSavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.some((theme) => theme.id === saved) ? saved : "coral";
}

export function applyTheme(themeId) {
  document.documentElement.dataset.theme = themeId;
  localStorage.setItem(STORAGE_KEY, themeId);
}

export function initThemes(menuEl, toggleBtn) {
  const saved = getSavedTheme();
  applyTheme(saved);

  for (const theme of THEMES) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "theme-option";
    option.dataset.theme = theme.id;
    option.setAttribute("role", "menuitemradio");
    option.setAttribute("aria-checked", theme.id === saved ? "true" : "false");
    option.innerHTML = `<span class="theme-swatch theme-swatch-${theme.id}" aria-hidden="true"></span>${theme.label}`;

    if (theme.id === saved) {
      option.classList.add("is-active");
    }

    option.addEventListener("click", () => {
      applyTheme(theme.id);
      menuEl.querySelectorAll(".theme-option").forEach((btn) => {
        const active = btn.dataset.theme === theme.id;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-checked", active ? "true" : "false");
      });
      closeMenu();
    });

    menuEl.appendChild(option);
  }

  function openMenu() {
    menuEl.classList.remove("hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menuEl.classList.add("hidden");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  toggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menuEl.classList.contains("hidden")) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!menuEl.contains(event.target) && event.target !== toggleBtn) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}
