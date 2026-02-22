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
      data.items.forEach((item) => {
        const li = document.createElement("li");
        addText(li, "div", "post-title", item.title);
        addText(li, "div", "post-meta", item.meta);
        list.appendChild(li);
      });
    })
    .catch(() => {
      // Keep the fallback text on error.
    });
})();
