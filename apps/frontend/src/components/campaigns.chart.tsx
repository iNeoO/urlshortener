import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useCampaignsClicksLastHourByMinute } from "../hooks/query/campaigns.hook";
import { Card } from "./ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
);

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } },
    y: { ticks: { precision: 0 }, grid: { color: "#e2e8f0" } },
  },
};

const getChartConfig = (labels: string[], dataPoints: number[]) => {
  return {
    labels,
    datasets: [
      {
        label: "Clicks per minute",
        data: dataPoints,
        borderColor: "#0f172a",
        backgroundColor: "rgba(15, 23, 42, 0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 2,
      },
    ],
  };
};

export function CampaignClicksLastHourChart() {
  const { data, isLoading, isError, error } =
    useCampaignsClicksLastHourByMinute();

  const points = data?.data ?? [];
  const { labels, counts } = points.reduce<{
    labels: string[];
    counts: number[];
  }>(
    (acc, point) => {
      const date = new Date(point.window);
      acc.labels.push(
        Number.isNaN(date.getTime())
          ? point.window
          : timeFormatter.format(date),
      );
      acc.counts.push(point.count);
      return acc;
    },
    { labels: [], counts: [] },
  );

  const chartData = getChartConfig(labels, counts);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Clicks in the last hour
        </h2>
      </div>
      <div className="mt-4 h-56">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading chart...
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600">
            {error?.message ?? "Failed to load chart data"}
          </div>
        ) : points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No clicks in the last hour.
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </Card>
  );
}
