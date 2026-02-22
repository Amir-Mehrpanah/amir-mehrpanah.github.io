(() => {
  const list = document.querySelector("[data-posts]");
  if (!list) {
    return;
  }

  const source = list.getAttribute("data-source") || "assets/data/posts.json";
  const base = list.getAttribute("data-base") || "";

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

  const buildMeta = (item) => {
    const parts = [];
    if (item.date) {
      parts.push(item.date);
    }
    if (item.type) {
      parts.push(item.type);
    }
    return parts.join(" \u00b7 ");
  };

  const isPublic = (item) => item.public === true || item.status === "public" || !item.status;

  const buildMedia = (item) => {
    const imageSource = item.cardImage;
    if (!imageSource) {
      return null;
    }
    const media = document.createElement("div");
    media.className = "post-media";
    const img = document.createElement("img");
    img.className = "post-image";
    img.src = resolveUrl(imageSource);
    img.alt = item.cardImageAlt || item.title || "Post image";
    img.loading = "lazy";
    media.appendChild(img);
    return media;
  };

  fetch(source)
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      const limit = Number.isFinite(data.limit) ? data.limit : data.items.length;
      const items = data.items.filter(isPublic).slice(0, Math.max(limit, 0));
      list.innerHTML = "";

      items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "post-card";
        const body = document.createElement("div");
        addText(body, "div", "post-meta", buildMeta(item));

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
        body.appendChild(title);

        addText(body, "p", "post-content", item.summary);
        card.appendChild(body);

        const media = buildMedia(item);
        if (media) {
          card.classList.add("has-media");
          card.appendChild(media);
        }
        list.appendChild(card);
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
