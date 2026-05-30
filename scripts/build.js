#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper functions
const loadJSON = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Failed to load ${filePath}:`, e.message);
    return null;
  }
};

const saveHTML = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Generated: ${filePath}`);
};

const renderInlineStrong = (text) => {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
};

const resolveUrl = (value, base, collectionPath, folderPath = '') => {
  if (!value) return '';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('/') ||
    value.startsWith('#')
  ) {
    return value;
  }
  if (value.startsWith(`${collectionPath}/`)) {
    return `${base}${value}`;
  }
  if (folderPath && !value.startsWith('assets/')) {
    return `${base}${collectionPath}/${folderPath}/${value}`;
  }
  return `${base}${value}`;
};

const buildListItem = (item, base, collectionPath, folderPath = '') => {
  const linkResolver = (url) => resolveUrl(url, base, collectionPath, folderPath);
  
  let html = '<li>';
  
  // Title and link
  if (item.title) {
    html += '<h3 class="post-title">';
    if (item.url) {
      html += `<a href="${linkResolver(item.url)}">${item.title}</a>`;
    } else {
      html += item.title;
    }
    html += '</h3>';
  }
  
  // Meta info (date, type, subtitle)
  const metaParts = [];
  if (item.type) metaParts.push(item.type);
  if (item.year) metaParts.push(item.year);
  if (metaParts.length > 0) {
    html += `<div class="post-meta">${metaParts.join(' · ')}</div>`;
  }
  if (item.subtitle) {
    html += `<div class="post-meta">${item.subtitle}</div>`;
  }
  
  // Summary
  if (item.shortSummary) {
    html += `<p class="post-summary">${renderInlineStrong(item.shortSummary)}</p>`;
  } else if (item.summary) {
    html += `<p class="post-summary">${renderInlineStrong(item.summary)}</p>`;
  }
  
  html += '</li>';
  return html;
};

const buildCollectionList = (items, base, collectionPath, folderPath = '', limit = null) => {
  if (!items || !Array.isArray(items)) {
    return '<li><div class="post-meta">No items to display.</div></li>';
  }
  
  const filtered = items.filter(item => item.public === true || item.status === 'public' || !item.status);
  const limited = limit ? filtered.slice(0, limit) : filtered;
  
  return limited.map(item => buildListItem(item, base, collectionPath, folderPath)).join('\n');
};

// Generate navigation header HTML
const buildHeader = (active = 'home', base = '') => {
  const socialProfiles = [
    { href: 'mailto:amirmehrpanah@gmail.com', label: 'Email', icon: 'fa-envelope' },
    { href: 'https://scholar.google.com/citations?user=dXcXce4AAAAJ&hl=en', label: 'Google Scholar', icon: 'ai-google-scholar', isAI: true },
    { href: 'https://orcid.org/0000-0002-6193-7126', label: 'ORCID', icon: 'orcid', isSVG: true },
    { href: 'https://github.com/Amir-Mehrpanah/', label: 'GitHub', icon: 'fa-github' },
    { href: 'https://www.linkedin.com/in/amir-mehrpanah-770070192/', label: 'LinkedIn', icon: 'fa-linkedin-in' },
  ];

  const navItems = [
    { href: `${base}index.html`, label: 'Home', key: 'home' },
    { href: `${base}blog/index.html`, label: 'Blog', key: 'blog' },
    { href: `${base}publications/index.html`, label: 'Publications', key: 'publications' },
    { href: `${base}cv.html`, label: 'CV', key: 'cv' },
  ];

  let headerHTML = '<header class="site-header" data-site-header>';
  headerHTML += '<nav class="site-nav">';
  headerHTML += '<div class="nav-brand"><a href="' + base + 'index.html">Amir Mehrpanah</a></div>';
  headerHTML += '<div class="nav-links">';
  
  navItems.forEach(item => {
    const activeClass = item.key === active ? ' aria-current="page"' : '';
    headerHTML += `<a href="${item.href}"${activeClass}>${item.label}</a>`;
  });
  
  headerHTML += '</div>';
  headerHTML += '<div class="nav-socials">';
  
  socialProfiles.forEach(profile => {
    if (profile.isSVG) {
      headerHTML += `<a href="${profile.href}" title="${profile.label}" target="_blank" rel="noopener noreferrer" aria-label="${profile.label}">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8.2 8.3h.01"></path>
          <path d="M8.2 10.7v5"></path>
          <path d="M11 15.7v-7.4h2.8a3.4 3.4 0 0 1 0 6.8H11"></path>
        </svg>
      </a>`;
    } else if (profile.isAI) {
      headerHTML += `<a href="${profile.href}" title="${profile.label}" target="_blank" rel="noopener noreferrer" aria-label="${profile.label}"><i class="ai ${profile.icon}" aria-hidden="true"></i></a>`;
    } else {
      headerHTML += `<a href="${profile.href}" title="${profile.label}" target="_blank" rel="noopener noreferrer" aria-label="${profile.label}"><i class="fa-solid ${profile.icon}" aria-hidden="true"></i></a>`;
    }
  });
  
  headerHTML += '</div>';
  headerHTML += '</nav>';
  headerHTML += '</header>';
  
  return headerHTML;
};

// Generate footer HTML
const buildFooter = () => {
  return `<footer class="site-footer">
    <div class="footer-content">
      <p>&copy; 2024-2026 Amir Mehrpanah. All rights reserved.</p>
    </div>
  </footer>`;
};

// Load data once
const loadAllData = () => ({
  highlights: loadJSON('assets/data/highlights.json'),
  education: loadJSON('assets/data/education.json'),
  appointments: loadJSON('assets/data/appointments.json'),
  awards: loadJSON('assets/data/awards.json'),
  talks: loadJSON('assets/data/talks.json'),
  skills: loadJSON('assets/data/skills.json'),
  blogConfig: loadJSON('blog/config.json'),
  publicationsConfig: loadJSON('publications/config.json'),
});

const loadCollectionItems = (folderPath, configFile) => {
  const config = loadJSON(configFile);
  if (!config || !Array.isArray(config.folders)) return [];
  
  const items = [];
  config.folders.forEach(folder => {
    const infoPath = path.join(folderPath, folder, 'info.json');
    if (fs.existsSync(infoPath)) {
      const info = loadJSON(infoPath);
      if (info) {
        info.folder = folder;
        items.push(info);
      }
    }
  });
  return items;
};

// Build index.html
const buildIndexPage = (data) => {
  const highlightsHTML = data.highlights?.items
    ? buildCollectionList(data.highlights.items, '', '', '', data.highlights.limit)
    : '<li><div class="post-meta">No highlights to display.</div></li>';
  
  const educationHTML = data.education?.items
    ? buildCollectionList(data.education.items, '', '', '', 3)
    : '<li><div class="post-meta">No education to display.</div></li>';
  
  const appointmentsHTML = data.appointments?.items
    ? buildCollectionList(data.appointments.items, '', '', '')
    : '<li><div class="post-meta">No appointments to display.</div></li>';
  
  const blogItems = loadCollectionItems('blog', 'blog/config.json');
  const blogHTML = buildCollectionList(blogItems, '', 'blog', '', 3);
  
  const publicationItems = loadCollectionItems('publications', 'publications/config.json');
  const publicationHTML = buildCollectionList(publicationItems, '', 'publications', '', 3);

  return `<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Amir Mehrpanah | PhD Student at KTH</title>
    <meta name="description"
            content="Homepage of Amir Mehrpanah, PhD student at KTH. Research on explainability and uncertainty in deep neural networks, publications, and updates." />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="https://amir-mehrpanah.github.io/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Amir Mehrpanah" />
    <meta property="og:title" content="Amir Mehrpanah | PhD Student at KTH" />
    <meta property="og:description"
            content="Research on explainability and uncertainty in deep neural networks, publications, and updates." />
    <meta property="og:url" content="https://amir-mehrpanah.github.io/" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Amir Mehrpanah | PhD Student at KTH" />
    <meta name="twitter:description"
            content="Research on explainability and uncertainty in deep neural networks, publications, and updates." />
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Amir Mehrpanah",
            "url": "https://amir-mehrpanah.github.io/",
            "jobTitle": "PhD Student",
            "affiliation": {
                "@type": "CollegeOrUniversity",
                "name": "KTH Royal Institute of Technology"
            },
            "sameAs": [
                "https://scholar.google.com/citations?user=dXcXce4AAAAJ&hl=en",
                "https://orcid.org/0000-0002-6193-7126",
                "https://github.com/Amir-Mehrpanah/",
                "https://www.linkedin.com/in/amir-mehrpanah-770070192/"
            ]
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Source+Serif+4:wght@400;500&display=swap"
        rel="stylesheet" />
    <link rel="stylesheet" href="assets/css/site.css" />
</head>

<body>
    ${buildHeader('home', '')}

    <main>
        <div class="container">
            <section class="hero">
                <div>
                    <h2>Amir Mehrpanah</h2>
                    <div class="meta">PhD student at KTH Royal Institute of Technology</div>
                    <h3>About</h3>
                    <p>
                        I am a PhD student in Computer Science at <a href="https://www.kth.se/">KTH Royal Institute of Technology</a>, supervised by <a href="https://www.csc.kth.se/~azizpour/">Hossein Azizpour</a>, and co-supervised by <a href="https://www.scilifelab.se/researchers/kevin-smith/">Kevin Smith</a> at <a href="https://www.scilifelab.se/">SciLifeLab</a>. 
                        I am interested in theoretical foundations of explainability of deep networks.
                        I have been working on spectral analysis for understanding and explaining deep models trained on vision tasks.
                        <br>
                        I have completed my MSc in Data Science at <a href="https://en.sbu.ac.ir">Shahid Beheshti University of Tehran</a> and my BSc in Applied Mathematics at <a href="https://en.um.ac.ir/">Ferdowsi University of Mashhad</a>. 

                        This site collects news, publications, and maybe research notes.
                    </p>
                    <div class="meta-row">
                        <span><i class="fa-solid fa-location-dot meta-icon" aria-hidden="true"> </i> Stockholm, Sweden</span>
                    </div>
                </div>
                <div class="card">
                    <div class="section-title">
                        <span>Highlights</span>
                    </div>
                    <ul class="list">
                        ${highlightsHTML}
                    </ul>
                </div>
            </section>

            <section class="section">
                <div class="section-title">
                    <span>Resume Snapshot</span>
                    <a href="cv.html">Full CV</a>
                </div>
                <div class="grid-2">
                    <article class="card">
                        <h2 class="post-title">Education</h2>
                        <ul class="list">
                            ${educationHTML}
                        </ul>
                    </article>
                    <article class="card">
                        <h2 class="post-title">Academic Experience</h2>
                        <ul class="list">
                            ${appointmentsHTML}
                        </ul>
                    </article>
                </div>
            </section>

            <section class="section">
                <div class="section-title">
                    <span>Selected Publications</span>
                    <a href="publications/index.html">All publications</a>
                </div>
                <ul class="publication-list">
                    ${publicationHTML}
                </ul>
            </section>

            <section class="section">
                <div class="section-title">
                    <span>Blog Posts</span>
                    <a href="blog/index.html">View blog</a>
                </div>
                <ul class="post-list">
                    ${blogHTML}
                </ul>
            </section>
        </div>
    </main>

    ${buildFooter()}

    <script src="assets/js/theme.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/academicons/1.9.4/css/academicons.min.css" />
</body>

</html>`;
};

// Build CV page
const buildCVPage = (data) => {
  const educationHTML = data.education?.items
    ? buildCollectionList(data.education.items, '../', '', '')
    : '<li><div class="post-meta">No education to display.</div></li>';
  
  const appointmentsHTML = data.appointments?.items
    ? buildCollectionList(data.appointments.items, '../', '', '')
    : '<li><div class="post-meta">No appointments to display.</div></li>';
  
  const skillsHTML = data.skills?.items
    ? buildCollectionList(data.skills.items, '../', '', '')
    : '<li><div class="post-meta">No skills to display.</div></li>';
  
  const awardsHTML = data.awards?.items
    ? buildCollectionList(data.awards.items, '../', '', '')
    : '<li><div class="post-meta">No awards to display.</div></li>';
  
  const talksHTML = data.talks?.items
    ? buildCollectionList(data.talks.items, '../', '', '')
    : '<li><div class="post-meta">No talks to display.</div></li>';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CV | Amir Mehrpanah</title>
    <meta name="description" content="Academic CV of Amir Mehrpanah: education, appointments, skills, talks, and awards." />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="https://amir-mehrpanah.github.io/cv.html" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Amir Mehrpanah" />
    <meta property="og:title" content="CV | Amir Mehrpanah" />
    <meta property="og:description" content="Academic CV of Amir Mehrpanah." />
    <meta property="og:url" content="https://amir-mehrpanah.github.io/cv.html" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="CV | Amir Mehrpanah" />
    <meta name="twitter:description" content="Academic CV of Amir Mehrpanah." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Source+Serif+4:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="assets/css/site.css" />
  </head>
  <body>
    ${buildHeader('cv', '')}

    <main>
      <div class="container">
        <section class="section">
          <div class="section-title">
            <span>Curriculum Vitae</span>
            <span class="tag">Updated May 2026</span>
          </div>
          <div class="grid-2">
            <article class="card">
              <h2 class="post-title">Education</h2>
              <ul class="list">
                ${educationHTML}
              </ul>
            </article>
            <article class="card">
              <h2 class="post-title">Academic Experience</h2>
              <ul class="list">
                ${appointmentsHTML}
              </ul>
            </article>
          </div>
        </section>

        <section class="section">
          <div class="section-title">
            <span>Technical Experience</span>
          </div>
          <article class="card">
            <ul class="list">
              ${skillsHTML}
            </ul>
          </article>
        </section>

        <section class="section">
          <div class="section-title">
            <span>Awards & Grants</span>
          </div>
          <div class="grid-2">
            <article class="card">
              <h2 class="post-title">Awards & Grants</h2>
              <ul class="list">
                ${awardsHTML}
              </ul>
            </article>
            <article class="card">
              <h2 class="post-title">Selected Talks</h2>
              <ul class="list">
                ${talksHTML}
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>

    ${buildFooter()}

    <script src="assets/js/theme.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/academicons/1.9.4/css/academicons.min.css" />
  </body>
</html>`;
};

// Build blog index
const buildBlogIndexPage = (data) => {
  const blogItems = loadCollectionItems('blog', 'blog/config.json');
  const blogHTML = buildCollectionList(blogItems, '../', 'blog', '');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog | Amir Mehrpanah</title>
    <meta name="description" content="Research updates, announcements, and notes." />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="https://amir-mehrpanah.github.io/blog/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Amir Mehrpanah" />
    <meta property="og:title" content="Blog | Amir Mehrpanah" />
    <meta property="og:description" content="Research updates, announcements, and notes." />
    <meta property="og:url" content="https://amir-mehrpanah.github.io/blog/" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Blog | Amir Mehrpanah" />
    <meta name="twitter:description" content="Research updates, announcements, and notes." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Source+Serif+4:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../assets/css/site.css" />
  </head>
  <body>
    ${buildHeader('blog', '../')}

    <main>
      <div class="container">
        <section class="section">
          <div class="section-title">
            <span>Blog</span>
            <span class="tag">Announcements & Notes</span>
          </div>
          <ul class="post-list">
            ${blogHTML}
          </ul>
        </section>
      </div>
    </main>

    ${buildFooter()}

    <script src="../assets/js/theme.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/academicons/1.9.4/css/academicons.min.css" />
  </body>
</html>`;
};

// Build publications index
const buildPublicationsIndexPage = (data) => {
  const publicationItems = loadCollectionItems('publications', 'publications/config.json');
  const publicationHTML = buildCollectionList(publicationItems, '../', 'publications', '');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Publications | Amir Mehrpanah</title>
  <meta name="description" content="Selected publications and research output." />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="https://amir-mehrpanah.github.io/publications/" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Amir Mehrpanah" />
  <meta property="og:title" content="Publications | Amir Mehrpanah" />
  <meta property="og:description" content="Selected publications and research output." />
  <meta property="og:url" content="https://amir-mehrpanah.github.io/publications/" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Publications | Amir Mehrpanah" />
  <meta name="twitter:description" content="Selected publications and research output." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Source+Serif+4:wght@400;500&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="../assets/css/site.css" />
</head>
<body>
  ${buildHeader('publications', '../')}

  <main>
    <div class="container">
      <section class="section">
        <div class="section-title">
          <span>Publications</span>
          <span class="tag">Updated May 2026</span>
        </div>
        <ul class="publication-list">
          ${publicationHTML}
        </ul>
      </section>
    </div>
  </main>

  ${buildFooter()}

  <script src="../assets/js/theme.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/academicons/1.9.4/css/academicons.min.css" />
</body>
</html>`;
};

// Main build function
const main = () => {
  console.log('🏗️  Building static site...\n');
  
  const data = loadAllData();
  
  // Build main pages
  saveHTML('index.html', buildIndexPage(data));
  saveHTML('cv.html', buildCVPage(data));
  saveHTML('blog/index.html', buildBlogIndexPage(data));
  saveHTML('publications/index.html', buildPublicationsIndexPage(data));
  
  console.log('\n✅ Build complete!');
};

main();
