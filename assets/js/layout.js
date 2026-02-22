(() => {
  const withTrailingSlash = (value) => {
    if (!value) {
      return "";
    }
    return value.endsWith("/") ? value : `${value}/`;
  };

  const buildHeader = (base, active) => `
    <div class="container header-grid">
      <a class="brand" href="${base}index.html">Amir Mehrpanah</a>
      <nav class="nav-links">
        <a href="${base}index.html" data-nav="home">Home</a>
        <a href="${base}publications/index.html" data-nav="publications">Publications</a>
        <a href="${base}cv.html" data-nav="cv">CV</a>
        <a href="${base}blog/index.html" data-nav="blog">Blog</a>
      </nav>
      <button class="theme-toggle" data-theme-toggle type="button">Light Theme</button>
    </div>
  `;

  const buildFooter = () => `
    <div class="container footer-grid">
      <div>
        <strong>Contact</strong>
        <div>
          <a href="mailto:amirmehrpanah@gmail.com">amirmehrpanah@gmail.com</a>
          ·
          <a href="mailto:amirme@kth.se">amirme@kth.se</a>
        </div>
      </div>
      <div>
        <strong>Location</strong>
        <div>Stockholm, Sweden</div>
      </div>
      <div>
        <strong>Profiles</strong>
        <div>
          <a href="https://scholar.google.com/citations?user=dXcXce4AAAAJ&hl=en">Google Scholar</a>
          ·
          <a href="https://orcid.org/0000-0002-6193-7126">ORCID</a>
          ·
          <a href="https://github.com/Amir-Mehrpanah/">GitHub</a>
          ·
          <a href="https://www.linkedin.com/in/amir-mehrpanah-770070192/">Linkedin</a>
        </div>
      </div>
    </div>
  `;

  const setActiveNav = (navRoot, active) => {
    if (!navRoot || !active) {
      return;
    }
    const activeLink = navRoot.querySelector(`[data-nav="${active}"]`);
    if (activeLink) {
      activeLink.classList.add("is-active");
      activeLink.setAttribute("aria-current", "page");
    }
  };

  const headerNodes = document.querySelectorAll("[data-site-header]");
  headerNodes.forEach((node) => {
    const base = withTrailingSlash(node.getAttribute("data-base"));
    const active = node.getAttribute("data-active");
    node.innerHTML = buildHeader(base, active);
    setActiveNav(node, active);
  });

  const footerNodes = document.querySelectorAll("[data-site-footer]");
  footerNodes.forEach((node) => {
    node.innerHTML = buildFooter();
  });
})();
