# Blog System

A file-based blog where each post lives in its own folder. The list page and detail page are both populated dynamically from `info.json` files via JavaScript.

---

## Directory Layout

```
blog/
  config.json              ← auto-generated index of post folders
  index.html               ← post list page
  post-template.html       ← generic post detail page
  README.md
  2026-02-22-my-post/
    info.json              ← required metadata file
    index.html             ← optional custom post page
```

---

## 1. Regenerating `config.json`

`config.json` is **not edited by hand**. Run the generator whenever you add, remove, or rename a post folder:

```bash
node scripts/generate-blog-config.js
```

The script:
- Scans `blog/` for sub-directories that contain an `info.json`.
- Reads the `date` (or `year`) field from each `info.json` to determine order.
- Sorts posts **newest-first** (alphabetically by folder name as a tiebreaker).
- Writes the sorted list of folder names to `blog/config.json`.

> Folders that lack an `info.json`, or whose `info.json` cannot be parsed, are silently skipped.

---

## 2. `info.json` Reference

Every post folder must contain an `info.json`. All fields are optional unless noted.

| Field | Type | Description |
|---|---|---|
| `title` | string | **Required.** Post title shown on the card and detail page. |
| `date` | string | ISO date (`"2026-02-22"`). Used for sorting and display. |
| `meta` | string | Combined label shown on the card (e.g. `"Feb 22, 2026 \| Research Notes"`). When present it replaces the separate date/category rendering on the detail page. |
| `shortSummary` | string | Card excerpt used in blog list/card views. |
| `summary` | string | Lead paragraph on the detail page. |
| `body` | string | Plain-text body shown on the detail page. |
| `bodyHtml` | string | HTML body for the detail page. Preserves author HTML (for example `<br>`) and also supports `**bold**` inline markup. Takes precedence over `body`. |
| `cardImage` | string | Path to the card thumbnail image (relative to the post folder, or a full URL). |
| `cardImageAlt` | string | Alt text for the card thumbnail. |
| `heroImage` | string | Hero image on the detail page. Falls back to `cardImage` if absent. |
| `heroImageAlt` | string | Alt text for the hero image. |
| `type` / `category` | string | Post category label, used on the detail page when `meta` is not set. |
| `url` | string \| `false` | Controls click behaviour — see §3 below. |
| `useTemplate` | boolean | Set to `false` to open `index.html` inside the post folder instead of the template. |
| `status` | string | Set to `"public"` (or omit) to show the post. Any other value hides it from the list. |
| `public` | boolean | Alternatively, set to `true` to explicitly mark the post as visible. |

---

## 3. Click / URL Behaviour

The system resolves where a post card links using the following priority:

1. **`url: false`** (also `null` or `""`) — the post title is **not a link**; the card is non-clickable.
2. **`url: "<path>"`** — an explicit URL is used as-is (relative or absolute).
3. **`useTemplate: false`** — links to `blog/<folder>/index.html` (the custom page inside the folder).
4. **No `url` field at all** — defaults to `blog/post-template.html?post=<folder-name>`, which populates the generic template from `info.json`.

### Custom post page

If you create an `index.html` inside the post folder, you have two ways to activate it:

```jsonc
// Option A: explicit path
{ "url": "blog/2026-02-22-my-post/index.html" }

// Option B: suppress the template
{ "useTemplate": false }
```

---

## 4. Post Detail Page (`post-template.html`)

The template receives the folder name via the query string:

```
blog/post-template.html?post=2026-02-22-my-post
```

It fetches `blog/2026-02-22-my-post/info.json` and fills the following slots:

| HTML attribute | Filled from |
|---|---|
| `data-post-title` | `title` |
| `data-post-date` | `date` (hidden when `meta` is set) |
| `data-post-category` | `meta`, then `type`/`category` |
| `data-post-lead` | `summary` |
| `data-post-body` | `bodyHtml` (HTML) › `body` (text) › `abstract` |
| `data-post-hero` | `heroImage` › `cardImage` |

The page `<title>` and `<meta name="description">` are also updated automatically.

---

## 5. Post List (`index.html`)

The list is driven by `[data-collection]` attributes on the container element:

```html
<div class="post-list"
     data-collection="blog"
     data-card-variant="post"
     data-summary-key="shortSummary"
     data-config="blog/config.json"
     data-collection-path="blog"
     data-base="../">
```

Relevant attributes:

| Attribute | Description |
|---|---|
| `data-config` | Path to `config.json`. |
| `data-collection-path` | Folder that contains the post sub-directories. |
| `data-card-variant` | `"post"` for blog cards, `"publication"` for publication cards. |
| `data-summary-key` | Which `info.json` field to use as the card excerpt. |
| `data-index-limit` | Optional integer — cap the number of cards rendered (useful for homepage previews). |
| `data-base` | Base path prefix prepended to all resolved URLs. |

---

## 6. Visibility Filtering

A post is **shown** only if one of these conditions is met in `info.json`:

- `status` field is absent (default public).
- `status` is `"public"`.
- `public` is `true`.

Any other `status` value (e.g. `"draft"`, `"hidden"`) will exclude the post from the rendered list even if its folder is listed in `config.json`.

---

## 7. Inline Markup

`**word**` inside `bodyHtml`, `meta`, and `authors` fields is rendered as `<strong>word</strong>`. For `bodyHtml`, raw HTML is preserved (for example `<br>`), so treat it as trusted authored content.

---

## 8. Adding a New Post — Checklist

1. Create a folder: `blog/YYYY-MM-DD-my-slug/`
2. Add `info.json` with at minimum `title` and `date`.
3. (Optional) Add `index.html` for a custom layout.
4. Run `node scripts/generate-blog-config.js` to update `config.json`.
