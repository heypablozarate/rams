import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, posix } from "node:path";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
function asset(path) {
  assert.ok(path.startsWith("/") && path === posix.normalize(path) && !path.includes("\\"), "Invalid asset path: " + path);
  return readFileSync(join(dist, path.slice(1)));
}
const json = path => JSON.parse(asset(path));
const sha = bytes => createHash("sha256").update(bytes).digest("hex");

const families = json("/components.json");
const variants = families.entries.flatMap(entry => entry.variants);
assert.equal(families.familyCount, families.entries.length);
assert.equal(families.variantCount, variants.length);
assert.equal(new Set(variants.map(row => row.id)).size, variants.length);
for (const variant of variants) {
  for (const source of variant.sources) {
    assert.equal(sha(asset(source.url)), source.sha256, source.url);
  }
}

const sdk = json("/rams-source/rams.json");
for (const [name, descriptor] of Object.entries(sdk.files)) {
  const bytes = asset("/rams-source/" + name);
  assert.equal(bytes.length, descriptor.bytes, name);
  assert.equal(sha(bytes), descriptor.sha256, name);
}
for (const path of ["/assets/dependency-licenses.md", "/rams-source/NOTICE.md", "/rams-source/fonts/OFL.txt"]) {
  assert.ok(asset(path).length, "Missing release artifact: " + path);
}
const allowedFonts = new Set(["GeistSans-VF.ttf", "GeistSans-Italic-VF.ttf", "GeistSerif-Regular.ttf"].map(name => "rams-source/fonts/" + name));
function inspectTree(dir = "") {
  for (const entry of readdirSync(join(dist, dir), { withFileTypes: true })) {
    const path = posix.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), path);
    assert.notEqual(path, "rams-source.zip", "The catalog must not ship a source ZIP");
    if (entry.isDirectory()) { inspectTree(path); continue; }
    if (/\.(?:ttf|otf|ttc|woff2?|eot)$/i.test(path)) assert.ok(allowedFonts.delete(path), "Unexpected font: " + path);
  }
}
inspectTree();
assert.equal(allowedFonts.size, 0, "The distributable Geist faces are incomplete");
console.log("Verified %d families, %d variants and %d SDK files.", families.familyCount, variants.length, Object.keys(sdk.files).length);
