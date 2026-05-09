import { serve } from "bun";
import { PrismaClient } from "@prisma/client";

import { createApp } from "./app";

const prisma = new PrismaClient();
const app = createApp(prisma);

const port = Number(process.env.PORT ?? 3001);

console.log(`API (Bun) listening on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
