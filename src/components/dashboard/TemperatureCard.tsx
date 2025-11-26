"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, Droplets, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSensorData } from "@/hooks/use-api";
import { TemperatureDialog } from "./TemperatureDialog";

export const TemperatureCard = () => {
  const { data: sensorData, isLoading } = useSensorData();
  const [showHistory, setShowHistory] = useState(false);

  // Temperature ranges for aquarium
  const getTemperatureStatus = (temp: number) => {
    if (temp < 24)
      return {
        status: "DINGIN",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      };
    if (temp > 30)
      return {
        status: "PANAS",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      };
    return {
      status: "OPTIMAL",
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    };
  };

  // Humidity status
  const getHumidityStatus = (humidity: number) => {
    if (humidity < 40) return { status: "RENDAH", color: "text-orange-500" };
    if (humidity > 70) return { status: "TINGGI", color: "text-blue-500" };
    return { status: "NORMAL", color: "text-green-500" };
  };

  const temperature = sensorData?.temperature ?? 0;
  const humidity = sensorData?.humidity ?? 0;
  const tempStatus = getTemperatureStatus(temperature);
  const humidityStatus = getHumidityStatus(humidity);

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return "Tidak tersedia";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card
        className="relative overflow-hidden border-border/50 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-ocean)] cursor-pointer"
        onClick={() => setShowHistory(true)}
      >
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            "bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
          )}
        />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="h-5 w-5 text-cyan-500" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Suhu & Kelembaban
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitoring lingkungan akuarium
              </p>
            </div>

            <Badge
              variant="secondary"
              className={cn(
                "transition-all duration-300",
                tempStatus.bg,
                tempStatus.border,
                "border"
              )}
            >
              <span className={tempStatus.color}>{tempStatus.status}</span>
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Temperature Display */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <Thermometer className="h-10 w-10 text-cyan-500" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Suhu Air</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-card-foreground">
                    {isLoading ? "--" : temperature.toFixed(1)}
                  </p>
                  <span className="text-xl text-muted-foreground">°C</span>
                </div>
              </div>
            </div>

            {/* Humidity Display */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <Droplets className="h-10 w-10 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Kelembaban</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-card-foreground">
                    {isLoading ? "--" : humidity.toFixed(1)}
                  </p>
                  <span className="text-xl text-muted-foreground">%</span>
                </div>
              </div>
              <Badge variant="outline" className={humidityStatus.color}>
                {humidityStatus.status}
              </Badge>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Terakhir Update
                </p>
                <p className="text-sm font-semibold text-card-foreground">
                  {formatLastUpdated(sensorData?.recorded_at)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Status Sensor
                </p>
                <p className="text-sm font-semibold text-card-foreground">
                  {isLoading
                    ? "○ Loading..."
                    : sensorData
                    ? "✓ Aktif"
                    : "✕ Tidak Tersedia"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  💡 Rentang suhu optimal: 24-30°C
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistory(true);
                  }}
                  className="text-xs"
                >
                  Lihat Grafik →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <TemperatureDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        currentTemp={temperature}
        currentHumidity={humidity}
      />
    </>
  );
};
