#!/usr/bin/env node
import fs from "node:fs/promises";
import { runEslint, partitionPilot, groupByRule, getConfigHash, getVersions, CONFIG_FILE } from "./boundaries-lib.mjs";

const mode = process.argv.find(a => a.startsWith("--mode="))?.split("=")[1] || "all";
const globs = mode === "all" ? ["**/*.{ts,tsx,js,jsx}"] : ["**/*.{ts,tsx,js,jsx}"];

const items = await runEslint(globs);
const { pilot, nonPilot } = partitionPilot(items);

const versions = await getVersions();
const configHash = await getConfigHash();

const data = {
  mode,
  versions,
  configHash,
  configFile: CONFIG_FILE,
  totals: {
    pilot: { total: pilot.length, byRule: groupByRule(pilot) },
    nonPilot: { total: nonPilot.length, byRule: groupByRule(nonPilot) },
    overall: { total: items.length, byRule: groupByRule(items) }
  },
  items: { pilot, nonPilot }
};

await fs.mkdir("ci", { recursive: true });
if (process.argv.includes("--write-baseline")) {
  const baseline = {
    frozenAt: new Date().toISOString(),
    configHash,
    violationsByRule: data.totals.overall.byRule,
    pilotTotals: data.totals.pilot,
    items: data.items,
    allowedPatterns: JSON.parse(await fs.readFile("ci/boundaries-allowlist.json", "utf8").catch(()=>"{}"))
  };
  await fs.writeFile("ci/boundaries-baseline.json", JSON.stringify(baseline, null, 2) + "\n", "utf8");
}

process.stdout.write(JSON.stringify(data, null, 2) + "\n");
