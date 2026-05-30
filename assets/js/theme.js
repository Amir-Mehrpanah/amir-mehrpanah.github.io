(() => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const toggleIcon = toggle ? toggle.querySelector(".theme-toggle__icon") : null;
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
      const nextTheme = theme === "dark" ? "light" : "dark";
      const label = `Switch to ${nextTheme} theme`;
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("title", label);
      toggle.setAttribute("data-next-theme", nextTheme);
    }
    if (toggleIcon) {
      toggleIcon.className = `theme-toggle__icon fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`;
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
