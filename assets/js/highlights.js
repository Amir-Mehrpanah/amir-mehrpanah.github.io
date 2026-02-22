(() => {
  const list = document.querySelector("[data-highlights]");
  if (!list) {
    return;
  }

  const buildMeta = (item) => {
    const parts = [];
    if (item.type) {
      parts.push(item.type);
    }
    if (item.year) {
      parts.push(item.year);
    }
    return parts.join(" · ");
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

  fetch("assets/data/highlights.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      const limit = Number.isFinite(data.limit) ? data.limit : data.items.length;
      const items = data.items.slice(0, Math.max(limit, 0));
      list.innerHTML = "";

      items.forEach((item) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.className = "highlight-link";
        link.href = item.url || "#";
        if (!item.url) {
          link.setAttribute("aria-disabled", "true");
          link.tabIndex = -1;
        }

        addText(link, "div", "post-title", item.title);
        addText(link, "div", "post-meta", buildMeta(item));
        addText(link, "div", "post-meta", item.subtitle);
        addText(link, "p", "highlight", item.summary);

        li.appendChild(link);
        list.appendChild(li);
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
