const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicationsDir = path.join(rootDir, "publications");
const configPath = path.join(publicationsDir, "config.json");
const entries = fs.readdirSync(publicationsDir, { withFileTypes: true });
const folders = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !name.startsWith("."))
  .map((name) => {
    const infoPath = path.join(publicationsDir, name, "info.json");
    if (!fs.existsSync(infoPath)) {
      return null;
    }

    try {
      const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
      const year = Number.parseInt(info.year, 10);
      return {
        name,
        year: Number.isNaN(year) ? 0 : year
      };
    } catch (error) {
      return null;
    }
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.name.localeCompare(b.name);
  })
  .map((entry) => entry.name);

const config = {
  comment: "regenerate by running node scripts/generate-publication-config.js",
  folders
};

fs.writeFileSync(configPath, `${JSON.stringify(config, null, 4)}\n`, "utf8");
console.log(`Wrote ${folders.length} folder(s) to ${configPath}`);
