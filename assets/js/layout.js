(() => {
  const socialProfiles = [
    {
      href: "https://scholar.google.com/citations?user=dXcXce4AAAAJ&hl=en",
      label: "Google Scholar",
      iconMarkup: '<i class="ai ai-google-scholar" aria-hidden="true"></i>',
    },
    {
      href: "https://orcid.org/0000-0002-6193-7126",
      label: "ORCID",
      iconMarkup: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.2 8.3h.01"></path>
          <path d="M8.2 10.7v5"></path>
          <path d="M11 15.7v-7.4h2.8a3.4 3.4 0 0 1 0 6.8H11"></path>
        </svg>
      `,
    },
    {
      href: "https://github.com/Amir-Mehrpanah/",
      label: "GitHub",
      iconMarkup: '<i class="fa-brands fa-github" aria-hidden="true"></i>',
    },
    {
      href: "https://www.linkedin.com/in/amir-mehrpanah-770070192/",
      label: "LinkedIn",
      iconMarkup: '<i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>',
    },
  ];

  const iconStylesheets = [
    {
      href: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css",
      key: "font-awesome",
    },
    {
      href: "https://cdnjs.cloudflare.com/ajax/libs/academicons/1.9.4/css/academicons.min.css",
      key: "academicons",
    },
  ];

  const withTrailingSlash = (value) => {
    if (!value) {
      return "";
    }
    return value.endsWith("/") ? value : `${value}/`;
  };

  const ensureIconStylesheets = () => {
    const head = document.head;
    if (!head) {
      return;
    }
    iconStylesheets.forEach(({ href, key }) => {
      if (head.querySelector(`[data-icon-font="${key}"]`)) {
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-icon-font", key);
      head.appendChild(link);
    });
  };

  const buildSocialLinks = (className) => `
    <div class="${className}">
      ${socialProfiles
        .map(
          ({ href, label, iconMarkup }) => `
            <a class="social-link" href="${href}" aria-label="${label}" title="${label}" target="_blank" rel="me noreferrer">
              ${iconMarkup}
            </a>
          `,
        )
        .join("")}
    </div>
  `;

  const buildHeader = (base, active) => `
    <div class="container header-grid">
      <nav class="brand brand-socials" aria-label="Social profiles">
        ${buildSocialLinks("social-links social-links--header")}
      </nav>
      <nav class="nav-links">
        <a href="${base}index.html" data-nav="home">Home</a>
        <a href="${base}publications/index.html" data-nav="publications">Publications</a>
        <a href="${base}cv.html" data-nav="cv">CV</a>
        <a href="${base}blog/index.html" data-nav="blog">Blog</a>
      </nav>
      <button class="theme-toggle" data-theme-toggle type="button" aria-label="Switch theme" title="Switch theme">
        <i class="theme-toggle__icon fa-solid fa-moon" aria-hidden="true"></i>
        <span class="sr-only">Toggle color theme</span>
      </button>
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
        ${buildSocialLinks("social-links social-links--footer")}
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

  ensureIconStylesheets();

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
