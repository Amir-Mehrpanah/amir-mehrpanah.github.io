(() => {
  const list = document.querySelector("[data-education]");
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

  fetch("assets/data/education.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      list.innerHTML = "";
      const indexLimit = list.getAttribute("data-index-limit");
      const items = indexLimit ? data.items.slice(0, parseInt(indexLimit)) : data.items;
      items.forEach((item) => {
        const li = document.createElement("li");
        addText(li, "div", "post-title", item.title);
        const metaEl = document.createElement("div");
        metaEl.className = "post-meta";
        metaEl.innerHTML = item.meta;
        li.appendChild(metaEl);
        list.appendChild(li);
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
