import { Hono } from "hono";
import { cors } from "hono/cors";
import type { PrismaClient } from "@prisma/client";

export function createApp(prisma: PrismaClient) {
  const app = new Hono();

  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

  app.use(
    "/*",
    cors({
      origin: webOrigin,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  app.get("/api/health", (c) =>
    c.json({
      ok: true,
      service: "admin-demo-api",
      time: new Date().toISOString(),
    }),
  );

  app.get("/api/stats", async (c) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, active, inactive, recentWeek] = await prisma.$transaction([
      prisma.resource.count(),
      prisma.resource.count({ where: { status: "active" } }),
      prisma.resource.count({ where: { status: "inactive" } }),
      prisma.resource.count({
        where: { createdAt: { gte: weekAgo } },
      }),
    ]);

    const statusSeries = await prisma.resource.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const chart = statusSeries.map((s) => ({
      status: s.status,
      count: s._count._all,
    }));

    return c.json({
      kpis: {
        totalResources: total,
        activeResources: active,
        inactiveResources: inactive,
        createdLast7Days: recentWeek,
      },
      chart,
    });
  });

  app.get("/api/resources", async (c) => {
    const pageRaw = c.req.query("page") ?? "1";
    const limitRaw = c.req.query("limit") ?? "10";

    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitRaw, 10) || 10));
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.resource.count(),
      prisma.resource.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return c.json({
      data: items.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        created_at: r.createdAt.toISOString(),
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  });

  return app;
}
