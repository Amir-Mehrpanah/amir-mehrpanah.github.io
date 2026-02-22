(() => {
  const container = document.querySelector("[data-publications]");
  if (!container) {
    return;
  }

  const scope = container.getAttribute("data-publications") || "index";
  const limitIndex = parseInt(container.getAttribute("data-index-limit"), "infinite");
  const configPath = container.getAttribute("data-config") || "publications/config.json";
  const publicationsPath = container.getAttribute("data-publications-path") || "publications";
  const base = container.getAttribute("data-base") || "";

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
    // If it's a relative path within a publication folder
    if (folderPath && !value.startsWith(publicationsPath)) {
      return `${base}${publicationsPath}/${folderPath}/${value}`;
    }
    return `${base}${value}`;
  };

  const addText = (parent, tag, className, text) => {
    if (!text) {
      return null;
    }
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    el.textContent = text;
    parent.appendChild(el);
    return el;
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

  const addInlineMarkup = (parent, tag, className, text) => {
    if (!text) {
      return null;
    }
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    el.innerHTML = renderInlineStrong(text);
    parent.appendChild(el);
    return el;
  };

  const isPublic = (item) => item.public === true || item.status === "public" || !item.status;

  const buildTitle = (item) => {
    const title = document.createElement("h2");
    title.className = "post-title";
    if (item.url) {
      const link = document.createElement("a");
      link.href = resolveUrl(item.url);
      link.textContent = item.title || "";
      title.appendChild(link);
    } else {
      title.textContent = item.title || "";
    }
    return title;
  };

  const buildMedia = (item, folderPath) => {
    if (!item.cardImage) {
      return null;
    }
    const media = document.createElement("div");
    media.className = "publication-media";
    const img = document.createElement("img");
    img.className = "publication-image";
    img.src = resolveUrl(item.cardImage, folderPath);
    img.alt = item.cardImageAlt || item.title || "Publication image";
    img.loading = "lazy";
    media.appendChild(img);
    return media;
  };

  const buildPdfLink = (item) => {
    if (!item.pdfUrl) {
      return null;
    }
    const link = document.createElement("a");
    link.className = "button";
    link.href = resolveUrl(item.pdfUrl);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "PDF";
    return link;
  };

  const buildCard = (item, summaryKey, folderPath) => {
    const card = document.createElement("article");
    card.className = "publication-card";

    const body = document.createElement("div");
    body.className = "publication-body";
    body.appendChild(buildTitle(item));
    const metaParts = [];
    if (item.meta) {
      metaParts.push(item.meta);
    }
    if (item.year) {
      metaParts.push(item.year);
    }
    addText(body, "div", "post-meta", metaParts.join(" | "));
    addInlineMarkup(body, "div", "publication-authors", item.authors);
    addText(body, "p", "post-content", item[summaryKey]);
    const pdfLink = buildPdfLink(item);
    if (pdfLink) {
      const actions = document.createElement("div");
      actions.className = "publication-actions";
      actions.appendChild(pdfLink);
      body.appendChild(actions);
    }
    card.appendChild(body);

    const media = buildMedia(item, folderPath);
    if (media) {
      card.appendChild(media);
    }

    return card;
  };

  // Load config file to get the list of publication folders
  fetch(resolveUrl(configPath))
    .then((response) => (response.ok ? response.json() : null))
    .then((config) => {
      if (!config || !Array.isArray(config.folders)) {
        return;
      }

      // Load info.json from each folder
      const loadPromises = config.folders.map((folder) => {
        const infoUrl = `${base}${publicationsPath}/${encodeURIComponent(folder)}/info.json`;
        return fetch(infoUrl)
          .then((response) => (response.ok ? response.json() : null))
          .then((info) => {
            if (!info) return null;
            // Create publication item with folder name as title and data from info.json
            const defaultUrl = `${publicationsPath}/paper-template.html?paper=${encodeURIComponent(folder)}`;
            return {
              title: folder,
              folderPath: folder,
              ...info,
              url: info.url ? info.url : defaultUrl
            };
          })
          .catch(() => null);
      });

      return Promise.all(loadPromises).then((items) => ({
        items: items.filter((item) => item !== null)
      }));
    })
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      const summaryKey = scope === "all" ? "abstract" : "shortSummary";
      const limit = Number.isFinite(limitIndex) ? limitIndex : data.items.length;
      const items = data.items.filter(isPublic).slice(0, limit);

      container.innerHTML = "";
      items.forEach((item) => {
        container.appendChild(buildCard(item, summaryKey, item.folderPath));
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
