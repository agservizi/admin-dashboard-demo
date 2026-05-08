export type StatsResponse = {
  kpis: {
    totalResources: number;
    activeResources: number;
    inactiveResources: number;
    createdLast7Days: number;
  };
  chart: { status: string; count: number }[];
};

export type ResourceRow = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export type ResourcesResponse = {
  data: ResourceRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
