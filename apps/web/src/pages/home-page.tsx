import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";

import { apiGet } from "@/lib/api";
import type { StatsResponse } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartBase = {
  count: { label: "Quantità", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function HomePage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<StatsResponse>("/api/stats");
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Errore sconosciuto");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Impossibile caricare le statistiche</AlertTitle>
        <AlertDescription>
          {error ?? "Risposta non valida"} — verifica che l&apos;API sia in
          esecuzione e che{" "}
          <code className="text-xs">VITE_API_URL</code> sia corretto.
        </AlertDescription>
      </Alert>
    );
  }

  const { kpis, chart } = data;

  const kpisList = [
    {
      title: "Risorse totali",
      value: kpis.totalResources,
      hint: "In archivio",
    },
    {
      title: "Attive",
      value: kpis.activeResources,
      hint: "Stato active",
    },
    {
      title: "Inattive",
      value: kpis.inactiveResources,
      hint: "Stato inactive",
    },
    {
      title: "Nuove (7g)",
      value: kpis.createdLast7Days,
      hint: "create negli ultimi 7 giorni",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpisList.map((k) => (
          <Card key={k.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{k.title}</CardTitle>
              <Badge variant="secondary">SQL</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{k.value}</div>
              <CardDescription>{k.hint}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per stato</CardTitle>
          <CardDescription>
            Dati aggregati da PostgreSQL (group by status).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartBase} className="aspect-auto h-[320px] w-full">
            <BarChart data={chart} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="status"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chart.map((_, index) => (
                  <Cell
                    key={chart[index]!.status}
                    fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
