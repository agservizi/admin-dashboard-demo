import { serve, file } from "bun";
import { PrismaClient } from "@prisma/client";
import { join } from "node:path";
import { readdirSync } from "node:fs";

import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const port = Number(process.env.PORT ?? 3001);
const webDist = join(import.meta.dir, "../../web/dist");

// Find the actual JS bundle in assets/ to fix stale index.html references
function resolveIndexHtml(): string {
  try {
    const assets = readdirSync(join(webDist, "assets"));
    const jsFile = assets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
    if (!jsFile) return join(webDist, "index.html");
    const cssFile = assets.find((f) => f.startsWith("index-") && f.endsWith(".css"));

    let html = require("node:fs").readFileSync(join(webDist, "index.html"), "utf8");
    // Replace any stale JS bundle reference with the actual one
    html = html.replace(/index-[^"]+\.js/g, jsFile);
    if (cssFile) html = html.replace(/index-[^"]+\.css/g, cssFile);
    return html;
  } catch {
    return "";
  }
}

console.log(`API (Bun) listening on http://0.0.0.0:${port}`);
console.log(`[static] serving frontend from ${webDist}`);

serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    const res = await app.fetch(req);
    if (res.status !== 404) return res;

    const url = new URL(req.url);
    const filePath = join(webDist, url.pathname);
    const f = file(filePath);
    if (await f.exists()) return new Response(f);

    // SPA fallback — serve index.html with corrected bundle reference
    const html = resolveIndexHtml();
    if (html) return new Response(html, { headers: { "Content-Type": "text/html" } });
    return new Response(file(join(webDist, "index.html")));
  },
});
