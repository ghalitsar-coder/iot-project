"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSensorHistory } from "@/hooks/use-api";
import { Thermometer, Droplets, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TemperatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTemp: number;
  currentHumidity: number;
}

const chartConfig = {
  temperature: {
    label: "Suhu",
    color: "hsl(var(--chart-1))",
  },
  humidity: {
    label: "Kelembaban",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const TemperatureDialog = ({
  open,
  onOpenChange,
  currentTemp,
  currentHumidity,
}: TemperatureDialogProps) => {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const { data: historyData, isLoading } = useSensorHistory(range);

  // Format data untuk chart
  const chartData =
    historyData?.map((item) => {
      const date = new Date(item.recorded_at);
      let timeLabel = "";

      if (range === "24h") {
        timeLabel = date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (range === "7d") {
        timeLabel = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
      } else {
        timeLabel = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
      }

      return {
        time: timeLabel,
        temperature: item.temperature,
        humidity: item.humidity,
      };
    }) || [];

  // Calculate statistics
  const calculateStats = (data: number[]) => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    return { min, max, avg };
  };

  const tempValues = chartData.map((d) => d.temperature);
  const humidityValues = chartData.map((d) => d.humidity);
  const tempStats = calculateStats(tempValues);
  const humidityStats = calculateStats(humidityValues);

  // Calculate trend (comparing current with average)
  const tempTrend = currentTemp > tempStats.avg ? "up" : "down";
  const humidityTrend = currentHumidity > humidityStats.avg ? "up" : "down";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-cyan-500" />
            Grafik Suhu & Kelembaban
          </DialogTitle>
          <DialogDescription>
            Monitoring perubahan suhu dan kelembaban lingkungan akuarium
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Suhu Saat Ini
                </CardDescription>
                <CardTitle className="text-3xl flex items-baseline gap-2">
                  {currentTemp.toFixed(1)}°C
                  {tempTrend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-blue-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Minimum:</span>
                    <span className="font-medium">
                      {tempStats.min.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rata-rata:</span>
                    <span className="font-medium">
                      {tempStats.avg.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maksimum:</span>
                    <span className="font-medium">
                      {tempStats.max.toFixed(1)}°C
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Kelembaban Saat Ini
                </CardDescription>
                <CardTitle className="text-3xl flex items-baseline gap-2">
                  {currentHumidity.toFixed(1)}%
                  {humidityTrend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Minimum:</span>
                    <span className="font-medium">
                      {humidityStats.min.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rata-rata:</span>
                    <span className="font-medium">
                      {humidityStats.avg.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maksimum:</span>
                    <span className="font-medium">
                      {humidityStats.max.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Period Selector */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Rentang Waktu</h3>
            <Select
              value={range}
              onValueChange={(value) => setRange(value as "24h" | "7d" | "30d")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Jam Terakhir</SelectItem>
                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-cyan-500" />
                Grafik Suhu
              </CardTitle>
              <CardDescription>
                Perubahan suhu air dalam{" "}
                {range === "24h"
                  ? "24 jam"
                  : range === "7d"
                  ? "7 hari"
                  : "30 hari"}{" "}
                terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Belum ada data tersedia
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="fillTemperature"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-temperature)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-temperature)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <YAxis
                      domain={[20, 35]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    {/* Optimal range reference lines */}
                    <ReferenceLine
                      y={24}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="3 3"
                      label="Min Optimal"
                    />
                    <ReferenceLine
                      y={30}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="3 3"
                      label="Max Optimal"
                    />
                    <Area
                      dataKey="temperature"
                      type="natural"
                      fill="url(#fillTemperature)"
                      fillOpacity={0.4}
                      stroke="var(--color-temperature)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Humidity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                Grafik Kelembaban
              </CardTitle>
              <CardDescription>
                Perubahan kelembaban udara dalam{" "}
                {range === "24h"
                  ? "24 jam"
                  : range === "7d"
                  ? "7 hari"
                  : "30 hari"}{" "}
                terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Belum ada data tersedia
                </div>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="fillHumidity"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-humidity)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-humidity)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    {/* Normal range reference lines */}
                    <ReferenceLine
                      y={40}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="3 3"
                      label="Min Normal"
                    />
                    <ReferenceLine
                      y={70}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="3 3"
                      label="Max Normal"
                    />
                    <Area
                      dataKey="humidity"
                      type="natural"
                      fill="url(#fillHumidity)"
                      fillOpacity={0.4}
                      stroke="var(--color-humidity)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  📊 <strong>Rentang Optimal:</strong>
                </p>
                <ul className="ml-6 space-y-1">
                  <li>• Suhu air: 24-30°C (ideal untuk ikan tropis)</li>
                  <li>• Kelembaban udara: 40-70% (kondisi normal)</li>
                </ul>
                <p className="mt-3">
                  💡 <strong>Tips:</strong> Jika suhu terlalu tinggi, periksa
                  pencahayaan dan sirkulasi udara. Jika terlalu rendah,
                  pertimbangkan menggunakan heater akuarium.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
