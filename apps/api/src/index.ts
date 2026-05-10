import { serve, file } from "bun";
import { PrismaClient } from "@prisma/client";
import { join } from "node:path";
import { readFileSync } from "node:fs";

import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const port = Number(process.env.PORT ?? 3001);
const webDist = join(import.meta.dir, "../../web/dist");

// Strips hardcoded localhost:PORT from fetch URLs at runtime.
// Served as an external file so CSP script-src 'self' allows it.
const FIX_JS = `(function(){var f=window.fetch;window.fetch=function(){var a=[].slice.call(arguments);if(typeof a[0]==='string')a[0]=a[0].replace(/^http:\\/\\/localhost:\\d+/,'');return f.apply(this,a);};})();`;

function indexHtmlWithFix(): string {
  try {
    return readFileSync(join(webDist, "index.html"), "utf8")
      .replace("</head>", '<script src="/fix.js"></script></head>');
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
    const url = new URL(req.url);

    if (url.pathname === "/fix.js") {
      return new Response(FIX_JS, { headers: { "Content-Type": "application/javascript" } });
    }

    const res = await app.fetch(req);
    if (res.status !== 404) return res;

    const filePath = join(webDist, url.pathname);
    const f = file(filePath);
    if (await f.exists()) return new Response(f);

    const html = indexHtmlWithFix();
    if (html) return new Response(html, { headers: { "Content-Type": "text/html" } });
    return new Response(file(join(webDist, "index.html")));
  },
});
