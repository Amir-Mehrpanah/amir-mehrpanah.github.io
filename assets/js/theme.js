(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const storageKey = "theme-preference";

  const getSystemTheme = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const setTheme = (theme, persist) => {
    root.setAttribute("data-theme", theme);
    if (persist) {
      localStorage.setItem(storageKey, theme);
    }
    if (toggle) {
      toggle.textContent = theme === "dark" ? "Light Theme" : "Dark Theme";
      toggle.setAttribute("aria-label", `Theme: ${theme}`);
    }
  };

  const stored = localStorage.getItem(storageKey);
  setTheme(stored || getSystemTheme(), false);

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next, true);
    });
  }
})();
