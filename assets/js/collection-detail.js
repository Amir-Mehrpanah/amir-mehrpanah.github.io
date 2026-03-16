(() => {
  const root = document.querySelector("[data-collection-detail]");
  if (!root) {
    return;
  }

  const withTrailingSlash = (value) => {
    if (!value) {
      return "";
    }
    return value.endsWith("/") ? value : `${value}/`;
  };

  const type = root.getAttribute("data-collection-type") || "publication";
  const base = withTrailingSlash(root.getAttribute("data-base") || "");
  const collectionPath = root.getAttribute("data-collection-path") ||
    (type === "post" ? "blog" : "publications");
  const paramKey = root.getAttribute("data-param") || (type === "post" ? "post" : "paper");

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
    if (folderPath && !value.startsWith(collectionPath)) {
      return `${base}${collectionPath}/${folderPath}/${value}`;
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

  const renderBodyHtml = (text) => {
    if (!text) {
      return "";
    }
    // Preserve author-provided HTML (for example <br>) while supporting **bold** markup.
    return String(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  };

  const getFirst = (selectors) => {
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      if (el) {
        return el;
      }
    }
    return null;
  };

  const errorEl = getFirst(["[data-detail-error]", "[data-publication-error]", "[data-post-error]"]);
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
    setError(type === "post" ? "Missing post id." : "Missing publication id.");
    return;
  }

  const infoUrl = `${base}${collectionPath}/${encodeURIComponent(folder)}/info.json`;

  fetch(infoUrl)
    .then((response) => (response.ok ? response.json() : null))
    .then((info) => {
      if (!info) {
        setError(type === "post" ? "Post not found." : "Publication not found.");
        return;
      }

      if (errorEl) {
        errorEl.style.display = "none";
      }

      const title = info.title || folder;
      const titleEl = getFirst(["[data-detail-title]", "[data-publication-title]", "[data-post-title]"]);
      if (titleEl) {
        titleEl.textContent = title;
      }
      document.title = `${title} | Amir Mehrpanah`;

      const metaDescription = document.querySelector('meta[name="description"]');
      const description = type === "post"
        ? info.shortSummary || info.summary || ""
        : info.shortSummary || info.abstract || "";
      if (metaDescription && description) {
        metaDescription.setAttribute("content", description);
      }

      if (type === "publication") {
        const authorsEl = getFirst(["[data-publication-authors]"]);
        if (authorsEl) {
          if (info.authors) {
            authorsEl.innerHTML = renderInlineStrong(info.authors);
          } else {
            authorsEl.style.display = "none";
          }
        }

        const tagEl = getFirst(["[data-publication-tag]"]);
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

        const abstractEl = getFirst(["[data-publication-abstract]"]);
        if (abstractEl) {
          if (info.abstract) {
            const processedAbstract = renderInlineStrong(info.abstract).replace(/\n/g, "<br>");
            abstractEl.innerHTML = processedAbstract;
          } else {
            abstractEl.style.display = "none";
          }
        }

        const pdfEl = getFirst(["[data-publication-pdf]"]);
        if (pdfEl) {
          if (info.pdfUrl) {
            pdfEl.href = resolveUrl(info.pdfUrl, folder);
          } else {
            pdfEl.style.display = "none";
          }
        }

        const videoEl = getFirst(["[data-publication-video]"]);
        if (videoEl) {
          if (info.videoUrl) {
            videoEl.href = resolveUrl(info.videoUrl, folder);
          } else {
            videoEl.style.display = "none";
          }
        }

        const actionsEl = pdfEl?.parentElement || videoEl?.parentElement;
        if (actionsEl && !info.pdfUrl && !info.videoUrl) {
          actionsEl.style.display = "none";
        }
      } else {
        const categoryEl = getFirst(["[data-post-category]"]);
        const dateEl = getFirst(["[data-post-date]"]);
        if (info.meta && categoryEl) {
          categoryEl.textContent = info.meta;
          if (dateEl) {
            dateEl.style.display = "none";
          }
        } else {
          if (categoryEl) {
            const category = info.type || info.category;
            if (category) {
              categoryEl.textContent = category;
            } else {
              categoryEl.style.display = "none";
            }
          }
          if (dateEl) {
            if (info.date) {
              dateEl.textContent = info.date;
            } else {
              dateEl.style.display = "none";
            }
          }
        }

        const leadEl = getFirst(["[data-post-lead]"]);
        if (leadEl) {
          const lead = info.summary || "";
          if (lead) {
            leadEl.textContent = lead;
          } else {
            leadEl.style.display = "none";
          }
        }

        const bodyEl = getFirst(["[data-post-body]"]);
        if (bodyEl) {
          if (info.bodyHtml) {
            bodyEl.innerHTML = renderBodyHtml(info.bodyHtml);
          } else if (info.body) {
            bodyEl.textContent = info.body;
          } else if (info.abstract) {
            bodyEl.textContent = info.abstract;
          } else {
            bodyEl.style.display = "none";
          }
        }
      }

      const heroEl = getFirst(["[data-publication-hero]", "[data-post-hero]"]);
      if (heroEl) {
        const heroImage = info.heroImage || info.cardImage;
        if (heroImage) {
          heroEl.src = resolveUrl(heroImage, folder);
          heroEl.alt = info.heroImageAlt || info.cardImageAlt || title;
        } else {
          heroEl.style.display = "none";
        }
      }
    })
    .catch(() => {
      setError(type === "post" ? "Post details unavailable." : "Publication details unavailable.");
    });
})();
