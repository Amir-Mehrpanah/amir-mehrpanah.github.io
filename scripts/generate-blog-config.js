const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const blogDir = path.join(rootDir, "blog");
const configPath = path.join(blogDir, "config.json");
const entries = fs.readdirSync(blogDir, { withFileTypes: true });

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }
  if (typeof value === "number") {
    return Date.UTC(value, 0, 1);
  }
  const trimmed = String(value).trim();
  if (!trimmed) {
    return 0;
  }
  const numeric = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(numeric) && String(numeric) === trimmed) {
    return Date.UTC(numeric, 0, 1);
  }
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const folders = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !name.startsWith("."))
  .map((name) => {
    const infoPath = path.join(blogDir, name, "info.json");
    if (!fs.existsSync(infoPath)) {
      return null;
    }

    try {
      const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
      const timestamp = toTimestamp(info.date || info.year);
      return {
        name,
        timestamp
      };
    } catch (error) {
      return null;
    }
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return b.timestamp - a.timestamp;
    }
    return a.name.localeCompare(b.name);
  })
  .map((entry) => entry.name);

const config = {
  folders
};

fs.writeFileSync(configPath, `${JSON.stringify(config, null, 4)}\n`, "utf8");
console.log(`Wrote ${folders.length} folder(s) to ${configPath}`);
