import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, posix, resolve } from "node:path";

const repository = "heypablozarate/rams";
const marker = "release.json";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const [command, directory, commit, runId, origin] = process.argv.slice(2);
assert.ok(["stamp", "verify", "verify-live"].includes(command),
  "Usage: node scripts/release-candidate.mjs <stamp|verify|verify-live> <dist> <full-sha> <run-id> [origin]");
assert.ok(directory && /^[a-f0-9]{40}$/.test(commit) && /^\d+$/.test(runId),
  "Supply the exact GitHub commit and workflow run ID");
const dist = resolve(directory);
const forbidden = /(^|\/)(?:\.[^/]+|node_modules|work|test-results)(?:\/|$)|timeless|\.(?:zip|woff2?|pem|pfx)$/i;
function files(path = "") {
  const entries = readdirSync(join(dist, path), { withFileTypes: true });
  return entries.flatMap((entry) => {
    const relative = posix.join(path, entry.name);
    assert.ok(relative === "rams-source/.gitignore" || !forbidden.test(relative),
      "Unexpected release path: " + relative);
    if (entry.isDirectory()) return files(relative);
    assert.ok(entry.isFile(), "Expected a regular file: " + relative);
    return relative === marker ? [] : [relative];
  });
}
const paths = files().sort();
const required = [
  "index.html",
  "components.json",
  "code/src/variants/materials/public-header/glass-tokens.ts.txt",
  "rams-source/components/public-header-glass-tokens.ts",
  "rams-source/rams.json",
  "rams-source/docs/install-prompt.md",
];
assert.ok(required.every((name) => paths.includes(name)), "Incomplete catalog artifact");
const manifest = {
  schemaVersion: 1,
  repository,
  commit,
  runId,
  files: Object.fromEntries(paths.map((path) => [path, sha256(readFileSync(join(dist, path)))])),
};
const manifestText = JSON.stringify(manifest, null, 2) + "\n";
if (command === "stamp") {
  writeFileSync(join(dist, marker), manifestText, { flag: "wx" });
} else {
  assert.equal(sha256(readFileSync(join(dist, marker))), sha256(manifestText),
    "The candidate has a different SHA, run ID or content");
}
if (command === "verify-live") {
  const base = new URL(origin);
  assert.ok(!base.username && !base.password && !base.search && !base.hash && base.pathname === "/");
  assert.ok(base.protocol === "https:" || (base.protocol === "http:" && base.hostname === "127.0.0.1"));
  async function fetchBytes(path) {
    const response = await fetch(new URL(path, base), {
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    assert.ok(response.ok, `HTTP ${response.status} for ${path}`);
    return Buffer.from(await response.arrayBuffer());
  }
  assert.equal(sha256(await fetchBytes(marker)), sha256(manifestText), "Different release is serving");
  const index = await fetchBytes("");
  const indexModule = /<script\b[^>]*src="(\/assets\/[^"]+\.js)"/;
  const modulePath = index.toString().match(indexModule)?.[1];
  const expectedModule = readFileSync(join(dist, "index.html"), "utf8").match(indexModule)?.[1];
  assert.ok(modulePath && modulePath === expectedModule, "The HTML uses a different entry bundle");
  const rawPaths = [...required.slice(1), modulePath.slice(1),
    ...paths.filter((name) => /^assets\/original-motion-print-navigation-.*\.(js|css)$/.test(name))];
  for (const path of rawPaths) {
    assert.equal(sha256(await fetchBytes(path)), manifest.files[path], "Different served bytes: " + path);
  }
  const zip = await fetch(new URL("rams-source.zip", base), { redirect: "error", signal: AbortSignal.timeout(15_000) });
  const zipType = zip.headers.get("content-type") ?? "";
  assert.ok([404, 410].includes(zip.status) || (zip.ok && zipType.startsWith("text/html") &&
    /<!doctype html>/i.test(await zip.text())), "Unexpected response for the retired ZIP link");
}
console.log(`${command}: ${commit} · run ${runId} · ${paths.length} archivos`);
