import { serve } from "@hono/node-server";
import { PrismaClient } from "@prisma/client";

import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const port = Number(process.env.PORT ?? 3001);
const hostname = process.env.HOST ?? "0.0.0.0";

console.log(`API (Node) listening on http://${hostname}:${port}`);

serve({ fetch: app.fetch, port, hostname });
