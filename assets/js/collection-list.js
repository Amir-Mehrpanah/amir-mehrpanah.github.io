(() => {
  const containers = document.querySelectorAll("[data-collection]");
  if (!containers.length) {
    return;
  }

  const resolveUrl = (value, base, collectionPath, folderPath = "") => {
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
    if (value.startsWith(`${collectionPath}/`)) {
      return `${base}${value}`;
    }
    if (folderPath && !value.startsWith("assets/")) {
      return `${base}${collectionPath}/${folderPath}/${value}`;
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

  const getSummary = (item, summaryKey) => {
    if (summaryKey && item[summaryKey]) {
      return item[summaryKey];
    }
    return item.shortSummary || item.summary || "";
  };

  const buildTitle = (item, linkResolver) => {
    const title = document.createElement("h2");
    title.className = "post-title";
    if (item.url) {
      const link = document.createElement("a");
      link.href = linkResolver(item.url);
      link.textContent = item.title || "";
      title.appendChild(link);
    } else {
      title.textContent = item.title || "";
    }
    return title;
  };

  const buildPublicationMedia = (item, linkResolver) => {
    if (!item.cardImage) {
      return null;
    }
    const media = document.createElement("div");
    media.className = "publication-media";
    const img = document.createElement("img");
    img.className = "publication-image";
    img.src = linkResolver(item.cardImage);
    img.alt = item.cardImageAlt || item.title || "Publication image";
    img.loading = "lazy";
    media.appendChild(img);
    return media;
  };

  const buildPostMedia = (item, linkResolver) => {
    if (!item.cardImage) {
      return null;
    }
    const media = document.createElement("div");
    media.className = "post-media";
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = linkResolver(item.cardImage);
    img.alt = item.cardImageAlt || item.title || "Post image";
    img.loading = "lazy";
    media.appendChild(img);
    return media;
  };

  const buildPdfLink = (item, linkResolver) => {
    if (!item.pdfUrl) {
      return null;
    }
    const link = document.createElement("a");
    link.className = "button button-icon";
    link.href = linkResolver(item.pdfUrl);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Open PDF");
    link.setAttribute("title", "Open PDF");
    link.innerHTML = '<i class="fa-solid fa-file-pdf" aria-hidden="true"></i>';
    return link;
  };

  const buildVideoLink = (item, linkResolver) => {
    if (!item.videoUrl) {
      return null;
    }
    const link = document.createElement("a");
    link.className = "button button-icon";
    link.href = linkResolver(item.videoUrl);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Open YouTube video");
    link.setAttribute("title", "Open YouTube video");
    link.innerHTML = '<i class="fa-brands fa-youtube" aria-hidden="true"></i>';
    return link;
  };

  const buildPostMeta = (item) => {
    if (item.meta) {
      return item.meta;
    }
    const parts = [];
    if (item.date) {
      parts.push(item.date);
    }
    if (item.type) {
      parts.push(item.type);
    }
    return parts.join(" | ");
  };

  const buildPublicationCard = (item, summaryKey, linkResolver) => {
    const card = document.createElement("article");
    card.className = "publication-card";

    const body = document.createElement("div");
    body.className = "publication-body";
    body.appendChild(buildTitle(item, linkResolver));

    const metaParts = [];
    if (item.meta) {
      metaParts.push(item.meta);
    }
    if (item.year) {
      metaParts.push(item.year);
    }
    addText(body, "div", "post-meta", metaParts.join(" | "));
    addInlineMarkup(body, "div", "publication-authors", item.authors);
    addText(body, "p", "post-content", getSummary(item, summaryKey));

    const pdfLink = buildPdfLink(item, linkResolver);
    const videoLink = buildVideoLink(item, linkResolver);
    if (pdfLink || videoLink) {
      const actions = document.createElement("div");
      actions.className = "publication-actions";
      if (pdfLink) {
        actions.appendChild(pdfLink);
      }
      if (videoLink) {
        actions.appendChild(videoLink);
      }
      body.appendChild(actions);
    }

    card.appendChild(body);

    const media = buildPublicationMedia(item, linkResolver);
    if (media) {
      card.appendChild(media);
    }

    return card;
  };

  const buildPostCard = (item, summaryKey, linkResolver) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const body = document.createElement("div");
    addText(body, "div", "post-meta", buildPostMeta(item));
    body.appendChild(buildTitle(item, linkResolver));
    addText(body, "p", "post-content", getSummary(item, summaryKey));
    card.appendChild(body);

    const media = buildPostMedia(item, linkResolver);
    if (media) {
      card.classList.add("has-media");
      card.appendChild(media);
    }

    return card;
  };

  const buildDefaultUrl = (variant, collectionPath, folder) => {
    if (variant === "publication") {
      return `${collectionPath}/paper-template.html?paper=${encodeURIComponent(folder)}`;
    }
    return `${collectionPath}/post-template.html?post=${encodeURIComponent(folder)}`;
  };

  const resolveItemUrl = (info, variant, collectionPath, folder) => {
    if (info.url === false || info.url === "" || info.url === null) {
      return "";
    }
    if (info.url) {
      return info.url;
    }
    if (variant === "post" && info.useTemplate === false) {
      return `${collectionPath}/${encodeURIComponent(folder)}/index.html`;
    }
    return buildDefaultUrl(variant, collectionPath, folder);
  };

  const initContainer = (container) => {
    const collectionPath = container.getAttribute("data-collection-path") ||
      container.getAttribute("data-collection") ||
      "publications";
    const configPath = container.getAttribute("data-config") || `${collectionPath}/config.json`;
    const base = container.getAttribute("data-base") || "";
    const variant = container.getAttribute("data-card-variant") || "publication";
    const summaryAttr = container.getAttribute("data-summary-key") || "";
    const summaryKey = summaryAttr === "all" ? "abstract" : summaryAttr || "shortSummary";
    const limitValue = container.getAttribute("data-index-limit");
    const limitAttr = limitValue === null ? null : Number.parseInt(limitValue, 10);

    const linkResolver = (value, folderPath = "") =>
      resolveUrl(value, base, collectionPath, folderPath);

    fetch(linkResolver(configPath))
      .then((response) => (response.ok ? response.json() : null))
      .then((config) => {
        if (!config || !Array.isArray(config.folders)) {
          return null;
        }

        const loadPromises = config.folders.map((folder) => {
          const infoUrl = `${base}${collectionPath}/${encodeURIComponent(folder)}/info.json`;
          return fetch(infoUrl)
            .then((response) => (response.ok ? response.json() : null))
            .then((info) => {
              if (!info) {
                return null;
              }
              return {
                title: folder,
                folderPath: folder,
                ...info,
                url: resolveItemUrl(info, variant, collectionPath, folder)
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

        const maxItems = Number.isFinite(limitAttr) ? Math.max(limitAttr, 0) : data.items.length;
        const items = data.items.filter(isPublic).slice(0, maxItems);
        container.innerHTML = "";

        items.forEach((item) => {
          const linkForItem = (value) => linkResolver(value, item.folderPath);
          const card = variant === "post"
            ? buildPostCard(item, summaryKey, linkForItem)
            : buildPublicationCard(item, summaryKey, linkForItem);
          container.appendChild(card);
        });
      })
      .catch(() => {
        // Keep the fallback text on error.
      });
  };

  containers.forEach(initContainer);
})();
