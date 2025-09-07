export type PrometheusVectorResult = {
  status: string;
  data: { resultType: 'vector'; result: Array<{ metric: Record<string, string>; value: [number, string] }> };
};

export type Dashboard = {
  id: string;
  name: string;
  config: any;
  createdAt: string;
  updatedAt: string;
};

