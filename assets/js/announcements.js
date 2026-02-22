(() => {
  const list = document.querySelector("[data-announcements]");
  if (!list) {
    return;
  }

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

  fetch("assets/data/announcements.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      const limit = Number.isFinite(data.limit) ? data.limit : data.items.length;
      const items = data.items.slice(0, Math.max(limit, 0));
      list.innerHTML = "";

      items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "post-card";
        addText(card, "div", "post-meta", buildMeta(item));

        const title = document.createElement("h3");
        title.className = "post-title";
        if (item.url) {
          const link = document.createElement("a");
          link.href = item.url;
          link.textContent = item.title || "";
          title.appendChild(link);
        } else {
          title.textContent = item.title || "";
        }
        card.appendChild(title);

        addText(card, "p", "post-content", item.summary);
        list.appendChild(card);
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
