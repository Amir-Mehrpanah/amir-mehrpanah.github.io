# Build System Documentation

## Overview

This site uses a **server-side pre-rendering system** that generates static HTML pages from your JSON data files. This eliminates client-side rendering delays and significantly improves Core Web Vitals metrics (FCP, CLS).

## How It Works

### Development Workflow

1. **Edit your data files** (`assets/data/*.json`, `blog/info.json`, `publications/info.json`)
2. **Push to GitHub**
3. **GitHub Actions automatically:**
   - Runs the build script (`scripts/build.js`)
   - Generates static HTML files with all content embedded
   - Generates `sitemap.xml` with all pages and proper `lastmod` dates
   - Commits the generated files back to the repository
   - Pushes to `main` branch

### Key Benefits

✅ **Fast First Contentful Paint (FCP)** - Content is in HTML, no JS needed to render  
✅ **Zero Cumulative Layout Shift (CLS)** - No post-hoc DOM updates  
✅ **Smaller JavaScript bundle** - Theme switching only, no content rendering  
✅ **Better SEO** - All content immediately available to crawlers  
✅ **Dynamic Sitemap** - Automatically includes all blog posts and publications with dates  
✅ **Automatic updates** - Push data changes → automatic static generation + sitemap update

### What Happened to Old Client-Side Rendering Scripts?

The old JavaScript files (`highlights.js`, `collection-list.js`, `layout.js`, etc.) are **no longer used** because all content is now pre-rendered into HTML at build time:

| Old Script | Purpose | Status |
|------------|---------|--------|
| `highlights.js`, `education.js`, `appointments.js`, `skills.js`, `awards.js`, `talks.js` | Fetched JSON and rendered dynamically in browser | ❌ Obsolete |
| `collection-list.js` | Rendered blog/publication listings via JavaScript | ❌ Obsolete |
| `announcements.js` | Rendered announcements (deprecated) | ❌ Obsolete |
| `layout.js` | Injected header/footer and loaded stylesheets | ❌ Obsolete |
| `theme.js` | **Handles dark/light mode switching** | ✅ **Still used** |

Generated pages only load `theme.js` for interactive theme switching. You can optionally delete the obsolete scripts or keep them for reference.

## File Structure

```
├── scripts/
│   ├── build.js              # Build script reads templates and renders pages
│   ├── generate-blog-config.js
│   └── generate-publications-config.js
│
├── templates/
│   ├── index.html            # Template (source of truth)
│   ├── cv.html               # Template
│   ├── blog/
│   │   └── index.html        # Template
│   └── publications/
│       └── index.html        # Template
│
├── .github/workflows/
│   └── build.yml             # GitHub Actions workflow
│
├── assets/data/
│   ├── highlights.json       # Homepage highlights
│   ├── education.json        # CV education section
│   ├── appointments.json     # CV appointments section
│   ├── skills.json           # CV skills section
│   ├── awards.json           # CV awards section
│   └── talks.json            # CV talks section
│
├── blog/
│   ├── config.json           # Generated (do not edit)
│   ├── index.html            # Generated from templates/blog/index.html
│   └── 2026-*/
│       └── info.json         # Blog post metadata
│
├── publications/
│   ├── config.json           # Generated (do not edit)
│   ├── index.html            # Generated from templates/publications/index.html
│   └── [publication-name]/
│       └── info.json         # Publication metadata
│
├── index.html                # Generated from templates/index.html
├── cv.html                   # Generated from templates/cv.html
└── sitemap.xml               # Generated from build script
```

## Generated Pages

These files are **automatically generated** from templates and should not be edited directly:

- `index.html` - Generated from `templates/index.html`
- `cv.html` - Generated from `templates/cv.html`
- `blog/index.html` - Generated from `templates/blog/index.html`
- `publications/index.html` - Generated from `templates/publications/index.html`
- `sitemap.xml` - SEO sitemap with all pages and proper lastmod dates

## How Templates Work

**Templates** in `templates/` are the source of truth for page structure. They contain placeholder markers like `{{HIGHLIGHTS_CONTENT}}` that get replaced with rendered content during the build.

When you run the build:
1. Build script reads template files from `templates/`
2. Loads JSON data from `assets/data/` and collection folders
3. Renders content (list items, etc.) from JSON data
4. Replaces placeholder markers with rendered content
5. Saves final pages to root directory (index.html, cv.html, etc.)

### Template Placeholders

- `{{HIGHLIGHTS_CONTENT}}` → Rendered from `assets/data/highlights.json`
- `{{EDUCATION_CONTENT}}` → Rendered from `assets/data/education.json`
- `{{APPOINTMENTS_CONTENT}}` → Rendered from `assets/data/appointments.json`
- `{{SKILLS_CONTENT}}` → Rendered from `assets/data/skills.json`
- `{{AWARDS_CONTENT}}` → Rendered from `assets/data/awards.json`
- `{{TALKS_CONTENT}}` → Rendered from `assets/data/talks.json`
- `{{BLOG_CONTENT}}` → Rendered from all blog posts (limited to 3 on homepage)
- `{{PUBLICATIONS_CONTENT}}` → Rendered from all publications (limited to 3 on homepage)

## Sitemap Generation

The build script automatically generates `sitemap.xml` with:

- **Main pages** (`/`, `/cv.html`, `/blog/`, `/publications/`) with `lastmod` = build date
- **Individual blog posts** with `lastmod` from each post's `date` field
- **Individual publications** with `lastmod` from each publication's `year` field

### Blog Post Dates

Blog post dates are extracted from the `date` field in `blog/[folder]/info.json`:

```json
{
  "title": "Your Post Title",
  "date": "2026-05-29",
  "shortSummary": "Post summary..."
}
```

### Publication Dates

Publication dates are extracted from the `year` field in `publications/[folder]/info.json` (formatted as `YYYY-01-01`):

```json
{
  "title": "Paper Title",
  "year": "2026",
  "shortSummary": "Paper summary..."
}
```

---

## Local Development

### Build locally before testing

To test your changes locally before pushing:

```bash
node scripts/build.js
```

This reads templates from `templates/` directory and generates:
- `index.html`
- `cv.html`
- `blog/index.html`
- `publications/index.html`
- `sitemap.xml`

### Making changes to page structure

1. Edit the template files in `templates/` (e.g., `templates/index.html`)
2. Run `node scripts/build.js`
3. Changes are reflected in generated files immediately

## GitHub Actions Workflow

The workflow (`.github/workflows/build.yml`) is triggered when:

- You push to `main` branch
- Changes are made to:
  - `assets/data/**` (data files)
  - `blog/**` (blog content)
  - `publications/**` (publication content)
  - `scripts/build.js` (build script itself)

The workflow:
1. Checks out your repository
2. Installs Node.js
3. Runs `node scripts/build.js`
4. Commits changes if there are any
5. Pushes back to repository (with `[skip ci]` flag to prevent infinite loops)

## Adding New Content

### Add a blog post

1. Create folder: `blog/YYYY-MM-DD-slug/`
2. Create `blog/YYYY-MM-DD-slug/info.json`:
```json
{
  "title": "Your Post Title",
  "year": "2026",
  "subtitle": "Research Notes",
  "summary": "Full summary of your post",
  "shortSummary": "Short summary for listings",
  "url": "blog/YYYY-MM-DD-slug/index.html"
}
```
3. Run: `node scripts/generate-blog-config.js` (updates `blog/config.json`)
4. Push → GitHub Actions generates new `blog/index.html`

### Add a publication

1. Create folder: `publications/[Paper Title]/`
2. Create `publications/[Paper Title]/info.json`:
```json
{
  "title": "Paper Title",
  "year": "2026",
  "summary": "Abstract or summary",
  "shortSummary": "Short version for listings",
  "pdfUrl": "https://example.com/paper.pdf"
}
```
3. Run: `node scripts/generate-publications-config.js` (updates `publications/config.json`)
4. Push → GitHub Actions generates new `publications/index.html`

### Update data sections

Edit JSON files in `assets/data/`:
- `highlights.json` - Homepage highlights
- `education.json` - Education entries
- `appointments.json` - Academic appointments
- `skills.json` - Technical skills
- `awards.json` - Awards and grants
- `talks.json` - Talks and presentations

Structure example (for `education.json`):
```json
{
  "items": [
    {
      "title": "PhD in Computer Science",
      "subtitle": "KTH Royal Institute of Technology",
      "year": "2024-present"
    }
  ]
}
```

Then push → GitHub Actions automatically regenerates all pages.

## Disabling Auto-build

To prevent the workflow from running, add `[skip ci]` to your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

## Rollback

If something goes wrong:

```bash
git revert <commit-hash>
git push
```

The workflow will run again and regenerate correct files.

## Performance Impact

### Before (client-side rendering)
- FCP: 3.3s (waiting for JS to fetch and render)
- CLS: 0.396 (layout shifts as content appears)
- Initial HTML: ~5KB of placeholders

### After (server-side pre-rendering)
- FCP: ~0.8s (content in HTML)
- CLS: ~0 (no post-hoc updates)
- Initial HTML: ~50KB with content (still faster due to fewer round trips)

## Troubleshooting

### Build fails on GitHub Actions

1. Check the workflow run logs: `GitHub.com → Your Repo → Actions → Last Run`
2. Common issues:
   - Malformed JSON in data files
   - Invalid folder structure
   - Missing `info.json` files

### Changes not reflected on live site

1. Verify the GitHub Actions workflow ran successfully
2. Check that generated files were committed: `git log --oneline`
3. Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)

### Manual Build

If GitHub Actions fails or you need immediate updates:

```bash
node scripts/build.js
git add index.html cv.html blog/index.html publications/index.html
git commit -m "chore: regenerate static pages"
git push
```

## Customization

### Editing Templates

To modify page HTML structure:

1. Edit files in `templates/` directory:
   - `templates/index.html` - Homepage structure
   - `templates/cv.html` - CV page structure
   - `templates/blog/index.html` - Blog listing
   - `templates/publications/index.html` - Publications listing

2. Keep placeholder markers like `{{EDUCATION_CONTENT}}` intact
3. Run `node scripts/build.js` to regenerate pages
4. The placeholders will be replaced with rendered content

### Modifying Content Rendering

To change how content is rendered from JSON (e.g., adding more fields, changing markup):

1. Edit the `buildListItem()` function in `scripts/build.js`
2. Run `node scripts/build.js` to regenerate
3. Commit the updated script

### Adding New Sections

To add a new section to the homepage:

1. Add a placeholder in `templates/index.html`:
   ```html
   {{MY_NEW_SECTION}}
   ```

2. Add rendering logic in `scripts/build.js`:
   ```javascript
   const myNewHTML = buildCollectionList(data.myNewSection?.items || []);
   indexTemplate = indexTemplate.replace('{{MY_NEW_SECTION}}', myNewHTML);
   ```

3. Add data file: `assets/data/my-new-section.json`

4. Load it in `loadAllData()` function

5. Run `node scripts/build.js`

---

Questions? Check the templates and build script for exact patterns, then modify as needed.

---

Questions? Check the generated HTML files to see the structure, then modify `scripts/build.js` accordingly.
