(() => {
  const root = document.querySelector("[data-publication-detail]");
  if (!root) {
    return;
  }

  const withTrailingSlash = (value) => {
    if (!value) {
      return "";
    }
    return value.endsWith("/") ? value : `${value}/`;
  };

  const base = withTrailingSlash(root.getAttribute("data-base") || "");
  const publicationsPath = root.getAttribute("data-publications-path") || "publications";
  const paramKey = root.getAttribute("data-publication-param") || "paper";

  const resolveUrl = (value, folderPath = "") => {
    if (!value) {
      return "";
    }
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("mailto:") ||
      value.startsWith("/") ||
      value.startsWith("#")
    ) {
      return value;
    }
    if (folderPath && !value.startsWith(publicationsPath)) {
      return `${base}${publicationsPath}/${folderPath}/${value}`;
    }
    return `${base}${value}`;
  };

  const renderInlineStrong = (text) => {
    if (!text) {
      return "";
    }
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  };

  const errorEl = root.querySelector("[data-publication-error]");
  const setError = (message) => {
    if (!errorEl) {
      return;
    }
    errorEl.textContent = message;
    errorEl.style.display = "block";
  };

  const params = new URLSearchParams(window.location.search);
  const folder = params.get(paramKey);
  if (!folder) {
    setError("Missing publication id.");
    return;
  }

  const infoUrl = `${base}${publicationsPath}/${encodeURIComponent(folder)}/info.json`;

  fetch(infoUrl)
    .then((response) => (response.ok ? response.json() : null))
    .then((info) => {
      if (!info) {
        setError("Publication not found.");
        return;
      }

      if (errorEl) {
        errorEl.style.display = "none";
      }

      const title = info.title || folder;
      const titleEl = root.querySelector("[data-publication-title]");
      if (titleEl) {
        titleEl.textContent = title;
      }
      document.title = `${title} | Amir Mehrpanah`;

      const authorsEl = root.querySelector("[data-publication-authors]");
      if (authorsEl) {
        if (info.authors) {
          authorsEl.innerHTML = renderInlineStrong(info.authors);
        } else {
          authorsEl.style.display = "none";
        }
      }

      const description = info.shortSummary || info.abstract || "";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && description) {
        metaDescription.setAttribute("content", description);
      }

      const tagEl = root.querySelector("[data-publication-tag]");
      if (tagEl) {
        const tagParts = [];
        if (info.meta) {
          tagParts.push(info.meta);
        }
        if (info.year) {
          tagParts.push(info.year);
        }
        if (tagParts.length) {
          tagEl.textContent = tagParts.join(" · ");
        } else {
          tagEl.style.display = "none";
        }
      }

      // const summaryEl = root.querySelector("[data-publication-summary]");
      // if (summaryEl) {
      //   if (info.shortSummary) {
      //     summaryEl.textContent = info.shortSummary;
      //   } else {
      //     summaryEl.style.display = "none";
      //   }
      // }

      const abstractEl = root.querySelector("[data-publication-abstract]");
      if (abstractEl) {
        if (info.abstract) {
          abstractEl.textContent = info.abstract;
        } else {
          abstractEl.style.display = "none";
        }
      }

      const heroEl = root.querySelector("[data-publication-hero]");
      if (heroEl) {
        const heroImage = info.heroImage || info.cardImage;
        if (heroImage) {
          heroEl.src = resolveUrl(heroImage, folder);
          heroEl.alt = info.heroImageAlt || info.cardImageAlt || title;
        } else {
          heroEl.style.display = "none";
        }
      }

      const pdfEl = root.querySelector("[data-publication-pdf]");
      if (pdfEl) {
        if (info.pdfUrl) {
          pdfEl.href = resolveUrl(info.pdfUrl, folder);
        } else if (pdfEl.parentElement) {
          pdfEl.parentElement.style.display = "none";
        }
      }
    })
    .catch(() => {
      setError("Publication details unavailable.");
    });
})();
