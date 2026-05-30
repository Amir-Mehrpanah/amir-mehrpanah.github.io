#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper functions
const loadJSON = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`Failed to load ${filePath}:`, e.message);
    return null;
  }
};

const readTemplate = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error(`Failed to load template ${filePath}:`, e.message);
    process.exit(1);
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

const buildListItem = (item) => {
  let html = '<li>';
  
  // Title
  if (item.title) {
    html += '<div class="post-title">';
    html += item.title;
    html += '</div>';
  }
  
  // Meta (use innerHTML for meta)
  if (item.meta) {
    html += `<div class="post-meta">${item.meta}</div>`;
  }
  
  html += '</li>';
  return html;
};

const buildHighlightItem = (item) => {
  let html = '<li>';
  html += `<a class="highlight-link" href="${item.url || '#'}"${!item.url ? ' aria-disabled="true" tabindex="-1"' : ''}>`;
  
  if (item.title) {
    html += `<div class="post-title">${item.title}</div>`;
  }
  
  // Meta info (type, year)
  const metaParts = [];
  if (item.type) metaParts.push(item.type);
  if (item.year) metaParts.push(item.year);
  if (metaParts.length > 0) {
    html += `<div class="post-meta">${metaParts.join(' · ')}</div>`;
  }
  
  if (item.subtitle) {
    html += `<div class="post-meta">${item.subtitle}</div>`;
  }
  
  if (item.summary) {
    html += `<p class="highlight">${renderInlineStrong(item.summary)}</p>`;
  }
  
  html += '</a></li>';
  return html;
};

const buildCollectionList = (items, limit = null) => {
  if (!items || !Array.isArray(items)) {
    return '<li><div class="post-meta">No items to display.</div></li>';
  }
  
  const filtered = items.filter(item => item.public === true || item.status === 'public' || !item.status);
  const limited = limit ? filtered.slice(0, limit) : filtered;
  
  return limited.map(item => buildListItem(item)).join('\n');
};

const buildPublicationCard = (item) => {
  let html = '<article class="publication-card"><div class="publication-body">';
  
  // Title (with optional link)
  html += '<h2 class="post-title">';
  if (item.url) {
    html += `<a href="${item.url}">${item.folder}</a>`;
  } else {
    html += item.folder;
  }
  html += '</h2>';
  
  // Meta and year
  const metaParts = [];
  if (item.meta) metaParts.push(item.meta);
  if (item.year) metaParts.push(item.year);
  if (metaParts.length > 0) {
    html += `<div class="post-meta">${metaParts.join(' | ')}</div>`;
  }
  
  // Authors (with inline markup support)
  if (item.authors) {
    html += `<div class="publication-authors">${renderInlineStrong(item.authors)}</div>`;
  }
  
  // Summary
  const summary = item.shortSummary || item.abstract || item.summary || '';
  if (summary) {
    html += `<p class="post-content">${renderInlineStrong(summary)}</p>`;
  }
  
  // Actions (PDF/Video links)
  let hasActions = false;
  if (item.pdfUrl || item.videoUrl) {
    html += '<div class="publication-actions">';
    
    if (item.pdfUrl) {
      html += `<a class="button button-icon" href="${item.pdfUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open PDF" title="Open PDF"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></a>`;
      hasActions = true;
    }
    
    if (item.videoUrl) {
      html += `<a class="button button-icon" href="${item.videoUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open YouTube video" title="Open YouTube video"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a>`;
      hasActions = true;
    }
    
    html += '</div>';
  }
  
  html += '</div>';
  
  // Media (card image)
  if (item.cardImage) {
    html += '<div class="publication-media">';
    html += `<img class="publication-image" src="${item.cardImage}" alt="${item.cardImageAlt || item.folder || 'Publication image'}" loading="lazy">`;
    html += '</div>';
  }
  
  html += '</article>';
  return html;
};

const buildPostCard = (item) => {
  let html = '<article class="post-card"><div>';
  
  // Meta (date | type)
  let metaText = '';
  if (item.meta) {
    metaText = item.meta;
  } else {
    const parts = [];
    if (item.date) parts.push(item.date);
    if (item.type) parts.push(item.type);
    metaText = parts.join(' | ');
  }
  
  if (metaText) {
    html += `<div class="post-meta">${metaText}</div>`;
  }
  
  // Title (with optional link)
  html += '<h2 class="post-title">';
  if (item.url) {
    html += `<a href="${item.url}">${item.title}</a>`;
  } else {
    html += item.title;
  }
  html += '</h2>';
  
  // Summary
  const summary = item.shortSummary || item.summary || '';
  if (summary) {
    html += `<p class="post-content">${renderInlineStrong(summary)}</p>`;
  }
  
  html += '</div>';
  
  // Media (card image)
  if (item.cardImage) {
    html += '<div class="post-media">';
    html += `<img class="post-image" src="${item.cardImage}" alt="${item.cardImageAlt || item.title || 'Post image'}" loading="lazy">`;
    html += '</div>';
  }
  
  html += '</article>';
  return html;
};

const buildPublicationList = (items, limit = null) => {
  if (!items || !Array.isArray(items)) {
    return '';
  }
  
  const filtered = items.filter(item => item.public === true || item.status === 'public' || !item.status);
  const limited = limit ? filtered.slice(0, limit) : filtered;
  
  return limited.map(item => buildPublicationCard(item)).join('\n');
};

const buildPostList = (items, limit = null) => {
  if (!items || !Array.isArray(items)) {
    return '';
  }
  
  const filtered = items.filter(item => item.public === true || item.status === 'public' || !item.status);
  const limited = limit ? filtered.slice(0, limit) : filtered;
  
  return limited.map(item => buildPostCard(item)).join('\n');
};

const buildHeader = (base = '', active = 'home') => {
  const navItems = [
    { href: `${base}index.html`, label: 'Home', nav: 'home' },
    { href: `${base}publications/index.html`, label: 'Publications', nav: 'publications' },
    { href: `${base}cv.html`, label: 'CV', nav: 'cv' },
    { href: `${base}blog/index.html`, label: 'Blog', nav: 'blog' }
  ];
  
  const socialLinks = [
    { href: 'mailto:amirmehrpanah@gmail.com', label: 'Email', icon: '<i class="fa-solid fa-envelope" aria-hidden="true"></i>' },
    { href: 'https://scholar.google.com/citations?user=dXcXce4AAAAJ&hl=en', label: 'Google Scholar', icon: '<i class="ai ai-google-scholar" aria-hidden="true"></i>' },
    { href: 'https://orcid.org/0000-0002-6193-7126', label: 'ORCID', icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M8.2 8.3h.01"></path><path d="M8.2 10.7v5"></path><path d="M11 15.7v-7.4h2.8a3.4 3.4 0 0 1 0 6.8H11"></path></svg>' },
    { href: 'https://github.com/Amir-Mehrpanah/', label: 'GitHub', icon: '<i class="fa-brands fa-github" aria-hidden="true"></i>' },
    { href: 'https://www.linkedin.com/in/amir-mehrpanah-770070192/', label: 'LinkedIn', icon: '<i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>' }
  ];
  
  let html = '<div class="container header-grid"><nav class="brand brand-socials" aria-label="Social profiles"><div class="social-links social-links--header">';
  
  socialLinks.forEach(link => {
    html += `<a class="social-link" href="${link.href}" aria-label="${link.label}" title="${link.label}" target="_blank" rel="me noreferrer">${link.icon}</a>`;
  });
  
  html += '</div></nav><nav class="nav-links">';
  
  navItems.forEach(item => {
    const isActive = item.nav === active;
    const ariaCurrent = isActive ? ' aria-current="page"' : '';
    const activeClass = isActive ? ' is-active' : '';
    html += `<a href="${item.href}" data-nav="${item.nav}"${ariaCurrent} class="${activeClass}">${item.label}</a>`;
  });
  
  html += '</nav><button class="theme-toggle" data-theme-toggle type="button" aria-label="Switch theme" title="Switch theme"><i class="theme-toggle__icon fa-solid fa-moon" aria-hidden="true"></i><span class="sr-only">Toggle color theme</span></button></div>';
  
  return html;
};

const buildFooter = () => {
  const socialLinks = [
    { href: 'mailto:amirmehrpanah@gmail.com', label: 'Email', icon: '<i class="fa-solid fa-envelope" aria-hidden="true"></i>' },
    { href: 'https://scholar.google.com/citations?user=dXcXce4AAAAJ&hl=en', label: 'Google Scholar', icon: '<i class="ai ai-google-scholar" aria-hidden="true"></i>' },
    { href: 'https://orcid.org/0000-0002-6193-7126', label: 'ORCID', icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M8.2 8.3h.01"></path><path d="M8.2 10.7v5"></path><path d="M11 15.7v-7.4h2.8a3.4 3.4 0 0 1 0 6.8H11"></path></svg>' },
    { href: 'https://github.com/Amir-Mehrpanah/', label: 'GitHub', icon: '<i class="fa-brands fa-github" aria-hidden="true"></i>' },
    { href: 'https://www.linkedin.com/in/amir-mehrpanah-770070192/', label: 'LinkedIn', icon: '<i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>' }
  ];
  
  let html = '<div class="container footer-grid"><div><strong>Location</strong><div><i class="fa-solid fa-location-dot meta-icon" aria-hidden="true"> </i> Stockholm, Sweden</div></div><div><strong>Contact</strong><div class="social-links social-links--footer">';
  
  socialLinks.forEach(link => {
    html += `<a class="social-link" href="${link.href}" aria-label="${link.label}" title="${link.label}" target="_blank" rel="me noreferrer">${link.icon}</a>`;
  });
  
  html += '</div></div></div>';
  
  return html;
};

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

// Build sitemap.xml
const buildSitemap = () => {
  const baseUrl = 'https://amir-mehrpanah.github.io';
  
  let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapXML += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  const addUrl = (loc, lastmod, changefreq = 'monthly', priority = 0.8) => {
    sitemapXML += '  <url>\n';
    sitemapXML += `    <loc>${loc}</loc>\n`;
    sitemapXML += `    <lastmod>${lastmod}</lastmod>\n`;
    sitemapXML += `    <changefreq>${changefreq}</changefreq>\n`;
    sitemapXML += `    <priority>${priority}</priority>\n`;
    sitemapXML += '  </url>\n';
  };
  
  // Main pages
  addUrl(`${baseUrl}/`, '2026-05-30', 'weekly', 1.0);
  addUrl(`${baseUrl}/cv.html`, '2026-05-30', 'monthly', 0.9);
  addUrl(`${baseUrl}/blog/`, '2026-05-30', 'monthly', 0.9);
  addUrl(`${baseUrl}/publications/`, '2026-05-30', 'monthly', 0.9);
  
  // Individual blog posts
  const blogItems = loadCollectionItems('blog', 'blog/config.json');
  blogItems.forEach(item => {
    const date = item.date || '2026-01-01';
    const folder = item.folder;
    addUrl(`${baseUrl}/blog/${folder}/`, date, 'monthly', 0.8);
  });
  
  // Individual publications
  const publicationItems = loadCollectionItems('publications', 'publications/config.json');
  publicationItems.forEach(item => {
    const date = item.year ? `${item.year}-01-01` : '2026-01-01';
    const folder = item.folder;
    addUrl(`${baseUrl}/publications/${folder}/`, date, 'monthly', 0.8);
  });
  
  sitemapXML += '</urlset>';
  
  return sitemapXML;
};

// Load all data
const loadAllData = () => ({
  highlights: loadJSON('assets/data/highlights.json'),
  education: loadJSON('assets/data/education.json'),
  appointments: loadJSON('assets/data/appointments.json'),
  awards: loadJSON('assets/data/awards.json'),
  talks: loadJSON('assets/data/talks.json'),
  skills: loadJSON('assets/data/skills.json'),
});

// Main build function
const main = () => {
  console.log('🏗️  Building static site from templates...\n');
  
  const data = loadAllData();
  
  // Load highlights
  const highlightsData = data.highlights?.items || [];
  const filteredHighlights = highlightsData.filter(item => item.public === true || item.status === 'public' || !item.status);
  const limitedHighlights = data.highlights?.limit ? filteredHighlights.slice(0, data.highlights.limit) : filteredHighlights;
  const highlightsHTML = limitedHighlights.map(item => buildHighlightItem(item)).join('\n');
  
  // Load education
  const educationHTML = buildCollectionList(data.education?.items || []);
  
  // Load appointments
  const appointmentsHTML = buildCollectionList(data.appointments?.items || []);
  
  // Load skills
  const skillsHTML = buildCollectionList(data.skills?.items || []);
  
  // Load awards
  const awardsHTML = buildCollectionList(data.awards?.items || []);
  
  // Load talks
  const talksHTML = buildCollectionList(data.talks?.items || []);
  
  // Load blog items
  const blogItems = loadCollectionItems('blog', 'blog/config.json');
  const blogHTML = buildPostList(blogItems, 3);
  const blogAllHTML = buildPostList(blogItems);
  
  // Load publication items
  const publicationItems = loadCollectionItems('publications', 'publications/config.json');
  const publicationHTML = buildPublicationList(publicationItems, 3);
  const publicationAllHTML = buildPublicationList(publicationItems);
  
  // Build header and footer HTML
  const headerHTML = buildHeader('', 'home');
  const headerHTMLBlog = buildHeader('../', 'blog');
  const headerHTMLPublications = buildHeader('../', 'publications');
  const footerHTML = buildFooter();
  
  // Build index.html
  let indexTemplate = readTemplate('templates/index.html');
  indexTemplate = indexTemplate.replace('{{HEADER_CONTENT}}', headerHTML);
  indexTemplate = indexTemplate.replace('{{HIGHLIGHTS_CONTENT}}', highlightsHTML);
  indexTemplate = indexTemplate.replace('{{EDUCATION_CONTENT}}', educationHTML);
  indexTemplate = indexTemplate.replace('{{APPOINTMENTS_CONTENT}}', appointmentsHTML);
  indexTemplate = indexTemplate.replace('{{PUBLICATIONS_CONTENT}}', publicationHTML);
  indexTemplate = indexTemplate.replace('{{BLOG_CONTENT}}', blogHTML);
  indexTemplate = indexTemplate.replace('{{FOOTER_CONTENT}}', footerHTML);
  saveHTML('index.html', indexTemplate);
  
  // Build cv.html
  let cvTemplate = readTemplate('templates/cv.html');
  cvTemplate = cvTemplate.replace('{{HEADER_CONTENT}}', buildHeader('', 'cv'));
  cvTemplate = cvTemplate.replace('{{EDUCATION_CONTENT}}', educationHTML);
  cvTemplate = cvTemplate.replace('{{APPOINTMENTS_CONTENT}}', appointmentsHTML);
  cvTemplate = cvTemplate.replace('{{SKILLS_CONTENT}}', skillsHTML);
  cvTemplate = cvTemplate.replace('{{AWARDS_CONTENT}}', awardsHTML);
  cvTemplate = cvTemplate.replace('{{TALKS_CONTENT}}', talksHTML);
  cvTemplate = cvTemplate.replace('{{FOOTER_CONTENT}}', footerHTML);
  saveHTML('cv.html', cvTemplate);
  
  // Build blog/index.html
  let blogTemplate = readTemplate('templates/blog/index.html');
  blogTemplate = blogTemplate.replace('{{HEADER_CONTENT_BLOG}}', headerHTMLBlog);
  blogTemplate = blogTemplate.replace('{{BLOG_CONTENT}}', blogAllHTML);
  blogTemplate = blogTemplate.replace('{{FOOTER_CONTENT}}', footerHTML);
  saveHTML('blog/index.html', blogTemplate);
  
  // Build publications/index.html
  let publicationTemplate = readTemplate('templates/publications/index.html');
  publicationTemplate = publicationTemplate.replace('{{HEADER_CONTENT_PUBLICATIONS}}', headerHTMLPublications);
  publicationTemplate = publicationTemplate.replace('{{PUBLICATIONS_CONTENT}}', publicationAllHTML);
  publicationTemplate = publicationTemplate.replace('{{FOOTER_CONTENT}}', footerHTML);
  saveHTML('publications/index.html', publicationTemplate);
  
  // Build sitemap
  fs.writeFileSync('sitemap.xml', buildSitemap(), 'utf-8');
  console.log('✓ Generated: sitemap.xml');
  
  console.log('\n✅ Build complete!');
};

main();
