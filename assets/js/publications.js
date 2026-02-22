(() => {
  const container = document.querySelector("[data-publications]");
  if (!container) {
    return;
  }

  const scope = container.getAttribute("data-publications") || "index";
  const source = container.getAttribute("data-source") || "assets/data/publications.json";
  const base = container.getAttribute("data-base") || "";

  const resolveUrl = (value) => {
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

  const buildMedia = (item) => {
    if (!item.cardImage) {
      return null;
    }
    const media = document.createElement("div");
    media.className = "publication-media";
    const img = document.createElement("img");
    img.className = "publication-image";
    img.src = resolveUrl(item.cardImage);
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

  const buildCard = (item, summaryKey) => {
    const card = document.createElement("article");
    card.className = "publication-card";

    const body = document.createElement("div");
    body.className = "publication-body";
    body.appendChild(buildTitle(item));
    addText(body, "div", "post-meta", item.meta);
    addText(body, "p", "post-content", item[summaryKey]);
    const pdfLink = buildPdfLink(item);
    if (pdfLink) {
      const actions = document.createElement("div");
      actions.className = "publication-actions";
      actions.appendChild(pdfLink);
      body.appendChild(actions);
    }
    card.appendChild(body);

    const media = buildMedia(item);
    if (media) {
      card.appendChild(media);
    }

    return card;
  };

  fetch(source)
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      const summaryKey = scope === "all" ? "abstract" : "shortSummary";
      const rawLimit = Number.isFinite(data.indexLimit) ? data.indexLimit : data.items.length;
      const limit = scope === "all" ? data.items.length : Math.max(rawLimit, 0);
      const items = data.items.filter(isPublic).slice(0, limit);

      container.innerHTML = "";
      items.forEach((item) => {
        container.appendChild(buildCard(item, summaryKey));
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
