import { serve, file } from "bun";
import { PrismaClient } from "@prisma/client";
import { join } from "node:path";

import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const port = Number(process.env.PORT ?? 3001);
const webDist = join(import.meta.dir, "../../web/dist");

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

    return new Response(file(join(webDist, "index.html")));
  },
});
