import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { courseUnits } from "../dist/js/course-data.js";

const root = resolve("dist");
const required = [
  "index.html",
  "css/styles.css",
  "js/app.js",
  "js/course-data.js",
  "js/course-engine.js",
  "js/curriculum.js",
  "js/learning-engine.js",
  "js/subscription.js",
  "assets/owl-guide.png",
  "assets/icon.svg",
  "manifest.webmanifest",
  "sw.js",
];

for (const relativePath of required) {
  if (!existsSync(join(root, relativePath))) {
    throw new Error(`Missing required static asset: ${relativePath}`);
  }
}

const html = readFileSync(join(root, "index.html"), "utf8");
const localReferences = [...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g)]
  .map((match) => match[1]);
for (const reference of localReferences) {
  const target = join(root, reference.slice(2));
  if (!existsSync(target)) throw new Error(`Broken local reference: ${reference}`);
}

const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
if (manifest.name !== "星芽英语" || manifest.start_url !== "./" || manifest.display !== "standalone") {
  throw new Error("Manifest identity or install settings are invalid.");
}
if (!manifest.icons?.some((icon) => icon.src === "./assets/icon.svg")) {
  throw new Error("Manifest icon is missing.");
}

const serviceWorker = readFileSync(join(root, "sw.js"), "utf8");
const cacheMatch = serviceWorker.match(/const PRECACHE_URLS = (\[[\s\S]*?\]);/);
if (!cacheMatch) throw new Error("Service worker precache list is missing.");
const precacheUrls = JSON.parse(cacheMatch[1].replaceAll("'", '"'));
for (const url of precacheUrls) {
  if (url === "./") continue;
  const target = join(root, url.replace(/^\.\//, ""));
  if (!existsSync(target)) throw new Error(`Service worker precaches a missing file: ${url}`);
}

for (const relativePath of ["js/app.js", "js/course-data.js", "js/course-engine.js", "js/curriculum.js", "js/learning-engine.js", "js/subscription.js", "sw.js"]) {
  const syntax = spawnSync(process.execPath, ["--check", join(root, relativePath)], { encoding: "utf8" });
  if (syntax.status !== 0) {
    throw new Error(`JavaScript syntax failed for ${relativePath}: ${syntax.stderr}`);
  }
}

const png = readFileSync(join(root, "assets/owl-guide.png"));
if (png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
  throw new Error("Owl guide is not a valid PNG asset.");
}

const activities = courseUnits.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.activities));
for (const activity of activities) {
  const audioPath = join(root, "assets/audio", `${activity.id}.wav`);
  if (!existsSync(audioPath)) throw new Error(`Missing mobile audio: ${activity.id}`);
  const audio = readFileSync(audioPath);
  if (audio.subarray(0, 4).toString("ascii") !== "RIFF" || audio.subarray(8, 12).toString("ascii") !== "WAVE") {
    throw new Error(`Invalid WAV audio: ${activity.id}`);
  }
  if (audio.length <= 5000) throw new Error(`Empty or too-short WAV audio: ${activity.id}`);
}

console.log(`Static checks passed: ${required.length} required files, ${localReferences.length} page references, ${precacheUrls.length} cached URLs, ${activities.length} mobile audio files.`);
