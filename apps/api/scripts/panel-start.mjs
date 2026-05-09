import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const apiRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Patch index.html to reference the actual JS bundle built by Vite
try {
  const webDist = path.join(apiRoot, "..", "web", "dist");
  const indexPath = path.join(webDist, "index.html");
  const assetsDir = path.join(webDist, "assets");
  if (existsSync(indexPath) && existsSync(assetsDir)) {
    const assets = readdirSync(assetsDir);
    const jsFile = assets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
    const cssFile = assets.find((f) => f.startsWith("index-") && f.endsWith(".css"));
    let html = readFileSync(indexPath, "utf8");
    if (jsFile) html = html.replace(/index-[^"]+\.js/g, jsFile);
    if (cssFile) html = html.replace(/index-[^"]+\.css/g, cssFile);
    writeFileSync(indexPath, html, "utf8");
    console.log("[panel-start] index.html patched →", jsFile);
  }
} catch (e) {
  console.warn("[panel-start] index.html patch skipped:", e.message);
}

const migrateMs = Number(process.env.MIGRATE_TIMEOUT_MS ?? 120000);
const skipMigrate =
  process.env.COREHOST_SKIP_MIGRATE === "1" ||
  process.env.SKIP_PRISMA_MIGRATE === "1";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: apiRoot,
      stdio: "inherit",
      env: process.env,
    });
    const t = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5000);
      reject(new Error(`${cmd} ${args.join(" ")} timed out after ${migrateMs}ms`));
    }, migrateMs);
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      clearTimeout(t);
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${cmd} exited ${code}${signal ? ` signal=${signal}` : ""}`,
          ),
        );
    });
  });
}

const serverJs = path.join(apiRoot, "dist", "server-node.js");

if (!skipMigrate) {
  console.log("[panel-start] prisma migrate deploy (timeout:", migrateMs, "ms)");
  try {
    await run("npm", ["exec", "--", "prisma", "migrate", "deploy"]);
  } catch (e) {
    console.error("[panel-start] migrate failed:", e.message);
    process.exit(1);
  }
} else {
  console.warn("[panel-start] skipping prisma migrate (COREHOST_SKIP_MIGRATE)");
}

console.log("[panel-start] execPath:", process.execPath);
console.log("[panel-start] launching", serverJs);
const node = spawn(process.execPath, [serverJs], {
  cwd: apiRoot,
  stdio: "inherit",
  env: process.env,
});
node.on("error", (err) => {
  console.error("[panel-start] server spawn error:", err.message);
  process.exit(1);
});
node.on("exit", (code, signal) => {
  console.error("[panel-start] server exited code=%s signal=%s", code, signal);
  process.exit(code ?? (signal ? 1 : 0));
});
