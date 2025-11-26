"use client";

import { useState, useEffect } from "react";
import { StockCard } from "@/components/dashboard/StockCard";
import { UVStatusCard } from "@/components/dashboard/UVStatusCard";
import { TemperatureCard } from "@/components/dashboard/TemperatureCard";
import { ActivityHistory } from "@/components/dashboard/ActivityHistory";
import { type ActivityFilters } from "@/components/dashboard/ActivityHistoryFilter";
import { FeedControl } from "@/components/controls/FeedControl";
import { UVControl } from "@/components/controls/UVControl";
import { ScheduleManager } from "@/components/schedule/ScheduleManager";
import { ThemeToggle } from "@/components/theme-toggle";
import { Waves } from "lucide-react";
import { toast } from "sonner";
import {
  useStock,
  useManualFeed,
  useManualUV,
  useStopManualUV,
  useUVStatus,
  useHistoryWithPagination,
  useUVSchedules,
} from "@/hooks/use-api";
import { convertDayToIndonesian, type UVSchedule } from "@/lib/api";

const Index = () => {
  const [isUVActive, setIsUVActive] = useState(false);
  const [uvRemainingMinutes, setUvRemainingMinutes] = useState<number>();
  const [historyFilters, setHistoryFilters] = useState<ActivityFilters>({
    page: 1,
    page_size: 50,
  });

  // TanStack Query hooks
  const { data: stock, isLoading: stockLoading } = useStock();
  const { data: uvStatus } = useUVStatus();
  const { data: uvSchedules = [] } = useUVSchedules();
  const { data: historyResponse, isLoading: historyLoading } =
    useHistoryWithPagination(historyFilters);
  const manualFeed = useManualFeed();
  const manualUV = useManualUV();
  const stopManualUV = useStopManualUV();

  const historyData = historyResponse?.data ?? [];
  const historyPagination = historyResponse?.pagination;

  const stockGram = stock?.amount_gram ?? 0;
  const loading = stockLoading;

  // Update UV state when status changes
  useEffect(() => {
    if (uvStatus) {
      setIsUVActive(uvStatus.state === "ON");
      setUvRemainingMinutes(
        uvStatus.manual_active ? Math.floor(uvStatus.remaining / 60) : undefined
      );
    }
  }, [uvStatus]);

  const handleFeed = () => {
    manualFeed.mutate(undefined, {
      onSuccess: () => {
        // Dashboard will auto-refetch due to invalidateQueries in useManualFeed
        toast.success("Pemberian Pakan Berhasil", {
          description: "Stok akan diperbarui sebentar lagi",
        });
      },
    });
  };

  const handleUVActivate = (durationMinutes: number) => {
    manualUV.mutate(durationMinutes, {
      onSuccess: () => {
        setIsUVActive(true);
        setUvRemainingMinutes(durationMinutes);
      },
    });
  };

  const handleUVDeactivate = () => {
    stopManualUV.mutate(undefined, {
      onSuccess: () => {
        setIsUVActive(false);
        setUvRemainingMinutes(undefined);
      },
    });
  };

  const lastFeedActivity = historyData.find(
    (a) => a.device_type === "FEEDER" && a.status === "SUCCESS"
  );

  // Calculate next UV schedule
  const getNextUVSchedule = (): string => {
    const activeSchedules = uvSchedules.filter((s) => s.is_active);
    if (activeSchedules.length === 0) return "Tidak ada jadwal";

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    // Map day names to day numbers
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    // Find the next upcoming schedule
    let nextSchedule: UVSchedule | null = null;
    let minDiff = Number.MAX_SAFE_INTEGER;

    for (const schedule of activeSchedules) {
      const scheduleDay = dayMap[schedule.day_name];
      const [hours, minutes] = schedule.start_time.split(":").map(Number);
      const scheduleTime = hours * 60 + minutes;

      // Calculate difference in minutes
      let dayDiff = scheduleDay - currentDay;
      if (dayDiff < 0) dayDiff += 7; // Next week
      if (dayDiff === 0 && scheduleTime < currentTime) dayDiff = 7; // Today but already passed

      const totalDiff = dayDiff * 24 * 60 + (scheduleTime - currentTime);

      if (totalDiff > 0 && totalDiff < minDiff) {
        minDiff = totalDiff;
        nextSchedule = schedule;
      }
    }

    if (!nextSchedule) return "Tidak ada jadwal";

    return `${convertDayToIndonesian(nextSchedule.day_name)}, ${
      nextSchedule.start_time
    }`;
  };

  const nextUVSchedule = getNextUVSchedule();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Waves className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(/aquariumHero)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

        <div className="relative container mx-auto px-4 py-12">
          {/* Theme Toggle - Top Right */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>

          {/* Title - Centered */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Waves className="h-10 w-10 text-primary animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Smart Aquarium Controller
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sistem kontrol akuarium otomatis dengan pemberi pakan cerdas dan
              UV sterilizer
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-12 space-y-8">
        {/* Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StockCard stockGram={stockGram} />
          <UVStatusCard
            isActive={isUVActive}
            remainingMinutes={uvRemainingMinutes}
            mode={isUVActive ? "MANUAL" : "OFF"}
            nextSchedule={nextUVSchedule}
          />
          <TemperatureCard />
        </div>

        {/* Control Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          <FeedControl
            lastFeedTime={lastFeedActivity?.start_time}
            stockGram={stockGram}
            onConfirm={handleFeed}
            isLoading={manualFeed.isPending}
          />
          <UVControl
            isActive={isUVActive}
            onActivate={handleUVActivate}
            onDeactivate={handleUVDeactivate}
          />
        </div>

        {/* Schedule Manager */}
        <ScheduleManager />

        {/* Activity History */}
        <ActivityHistory
          activities={historyData}
          filters={historyFilters}
          onFiltersChange={setHistoryFilters}
          pagination={historyPagination}
          isLoading={historyLoading}
        />
      </main>
    </div>
  );
};

export default Index;
