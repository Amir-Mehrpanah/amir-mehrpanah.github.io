(() => {
  const list = document.querySelector("[data-awards]");
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

  fetch("assets/data/awards.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data || !Array.isArray(data.items)) {
        return;
      }

      list.innerHTML = "";
      data.items.forEach((item) => {
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
