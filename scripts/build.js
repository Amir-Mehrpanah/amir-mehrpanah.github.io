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
    html += '<h3 class="post-title">';
    html += item.title;
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

const buildCollectionList = (items, limit = null) => {
  if (!items || !Array.isArray(items)) {
    return '<li><div class="post-meta">No items to display.</div></li>';
  }
  
  const filtered = items.filter(item => item.public === true || item.status === 'public' || !item.status);
  const limited = limit ? filtered.slice(0, limit) : filtered;
  
  return limited.map(item => buildListItem(item)).join('\n');
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
  const highlightsHTML = buildCollectionList(highlightsData, data.highlights?.limit);
  
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
  const blogHTML = buildCollectionList(blogItems, 3);
  const blogAllHTML = buildCollectionList(blogItems);
  
  // Load publication items
  const publicationItems = loadCollectionItems('publications', 'publications/config.json');
  const publicationHTML = buildCollectionList(publicationItems, 3);
  const publicationAllHTML = buildCollectionList(publicationItems);
  
  // Build index.html
  let indexTemplate = readTemplate('templates/index.html');
  indexTemplate = indexTemplate.replace('{{HIGHLIGHTS_CONTENT}}', highlightsHTML);
  indexTemplate = indexTemplate.replace('{{EDUCATION_CONTENT}}', educationHTML);
  indexTemplate = indexTemplate.replace('{{APPOINTMENTS_CONTENT}}', appointmentsHTML);
  indexTemplate = indexTemplate.replace('{{PUBLICATIONS_CONTENT}}', publicationHTML);
  indexTemplate = indexTemplate.replace('{{BLOG_CONTENT}}', blogHTML);
  saveHTML('index.html', indexTemplate);
  
  // Build cv.html
  let cvTemplate = readTemplate('templates/cv.html');
  cvTemplate = cvTemplate.replace('{{EDUCATION_CONTENT}}', educationHTML);
  cvTemplate = cvTemplate.replace('{{APPOINTMENTS_CONTENT}}', appointmentsHTML);
  cvTemplate = cvTemplate.replace('{{SKILLS_CONTENT}}', skillsHTML);
  cvTemplate = cvTemplate.replace('{{AWARDS_CONTENT}}', awardsHTML);
  cvTemplate = cvTemplate.replace('{{TALKS_CONTENT}}', talksHTML);
  saveHTML('cv.html', cvTemplate);
  
  // Build blog/index.html
  let blogTemplate = readTemplate('templates/blog/index.html');
  blogTemplate = blogTemplate.replace('{{BLOG_CONTENT}}', blogAllHTML);
  saveHTML('blog/index.html', blogTemplate);
  
  // Build publications/index.html
  let publicationTemplate = readTemplate('templates/publications/index.html');
  publicationTemplate = publicationTemplate.replace('{{PUBLICATIONS_CONTENT}}', publicationAllHTML);
  saveHTML('publications/index.html', publicationTemplate);
  
  // Build sitemap
  fs.writeFileSync('sitemap.xml', buildSitemap(), 'utf-8');
  console.log('✓ Generated: sitemap.xml');
  
  console.log('\n✅ Build complete!');
};

main();
