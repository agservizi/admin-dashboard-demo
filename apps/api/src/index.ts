import { serve, file } from "bun";
import { PrismaClient } from "@prisma/client";
import { join } from "node:path";

import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const port = Number(process.env.PORT ?? 3001);
const webDist = join(import.meta.dir, "../../web/dist");

// Inject a fetch interceptor that rewrites localhost:PORT API calls to relative URLs.
// This fixes bundles built with a hardcoded dev API base URL.
const FETCH_INTERCEPTOR = `<script>
(function(){var f=window.fetch;window.fetch=function(){var a=[].slice.call(arguments);if(typeof a[0]==='string')a[0]=a[0].replace(/^http:\\/\\/localhost:\\d+/,'');return f.apply(this,a);};})();
</script>`;

function resolveIndexHtml(): string {
  try {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    return readFileSync(join(webDist, "index.html"), "utf8")
      .replace("</head>", FETCH_INTERCEPTOR + "</head>");
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
