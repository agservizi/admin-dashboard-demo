import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { apiGet } from "@/lib/api";
import type { ResourceRow, ResourcesResponse } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PAGE_SIZE = 10;

function statusVariant(
  s: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    default:
      return "outline";
  }
}

export function ResourcesPage() {
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<ResourcesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ResourceRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiGet<ResourcesResponse>(
          `/api/resources?page=${page}&limit=${PAGE_SIZE}`,
        );
        if (!cancelled) {
          setPayload(res);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Errore");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const columns = useMemo<ColumnDef<ResourceRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Stato",
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Creato il",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleString("it-IT"),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: payload?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: payload?.totalPages ?? 0,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Errore nel caricamento risorse</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const totalPages = payload?.totalPages ?? 1;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Risorse</CardTitle>
          <CardDescription>
            Tabella paginata (10 righe per pagina) da PostgreSQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="w-full rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => setSelected(row.original)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            setSelected(row.original);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Apri dettaglio ${row.original.name}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nessun record.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="gap-1 pl-2.5"
                  aria-label="Pagina precedente"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Precedente
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="text-muted-foreground flex h-9 items-center px-3 text-sm tabular-nums">
                  Pagina {page} di {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="gap-1 pr-2.5"
                  aria-label="Pagina successiva"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Successiva
                  <ChevronRight className="size-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              Dettaglio risorsa (dialogo demo)
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex flex-row items-center gap-2">
                <span className="text-muted-foreground">Stato:</span>
                <Badge variant={statusVariant(selected.status)}>
                  {selected.status}
                </Badge>
              </div>
              <div className="flex flex-row flex-wrap gap-2">
                <span className="text-muted-foreground">ID:</span>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {selected.id}
                </code>
              </div>
              <p>
                <span className="text-muted-foreground">Creato:</span>{" "}
                {new Date(selected.created_at).toLocaleString("it-IT")}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
