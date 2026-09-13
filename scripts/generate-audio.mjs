import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { courseUnits } from "../dist/js/course-data.js";

const outputDirectory = resolve("dist/assets/audio");
const temporaryDirectory = mkdtempSync(join(tmpdir(), "xingya-audio-"));
mkdirSync(outputDirectory, { recursive: true });

try {
  const requestedIds = new Set(process.argv.slice(2));
  const allActivities = courseUnits.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.activities));
  const activities = requestedIds.size ? allActivities.filter((activity) => requestedIds.has(activity.id)) : allActivities;
  for (const activity of activities) {
    const source = join(temporaryDirectory, `${activity.id}.aiff`);
    const output = join(outputDirectory, `${activity.id}.wav`);
    const speech = spawnSync("/usr/bin/say", ["-v", "Samantha", "-r", "155", "-o", source, activity.speech], { encoding: "utf8" });
    if (speech.status !== 0) throw new Error(`Speech generation failed for ${activity.id}: ${speech.stderr}`);
    const conversion = spawnSync("/usr/bin/afconvert", ["-f", "WAVE", "-d", "LEI16@16000", source, output], { encoding: "utf8" });
    if (conversion.status !== 0) throw new Error(`Audio conversion failed for ${activity.id}: ${conversion.stderr}`);
  }
  console.log(`Generated ${activities.length} mobile-ready English audio files.`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
