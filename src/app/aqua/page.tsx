"use client";

import { useState, useEffect } from "react";
import { StockCard } from "@/components/dashboard/StockCard";
import { UVStatusCard } from "@/components/dashboard/UVStatusCard";
import { ActivityHistory } from "@/components/dashboard/ActivityHistory";
import { type ActivityFilters } from "@/components/dashboard/ActivityHistoryFilter";
import { FeedControl } from "@/components/controls/FeedControl";
import { UVControl } from "@/components/controls/UVControl";
import { ScheduleManager } from "@/components/schedule/ScheduleManager";
import { ThemeToggle } from "@/components/theme-toggle";
import { Waves } from "lucide-react";
import { toast } from "sonner";
import {
  useDashboard,
  useManualFeed,
  useManualUV,
  useStopManualUV,
  useUVStatus,
  useHistory,
} from "@/hooks/use-api";

const Index = () => {
  const [isUVActive, setIsUVActive] = useState(false);
  const [uvRemainingMinutes, setUvRemainingMinutes] = useState<number>();
  const [historyFilters, setHistoryFilters] = useState<ActivityFilters>({
    limit: 50,
  });

  // TanStack Query hooks
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: uvStatus } = useUVStatus();
  const { data: historyData = [], isLoading: historyLoading } =
    useHistory(historyFilters);
  const manualFeed = useManualFeed();
  const manualUV = useManualUV();
  const stopManualUV = useStopManualUV();

  const stockGram = dashboard?.stock.amount_gram ?? 0;
  const loading = dashboardLoading;

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
        <div className="grid md:grid-cols-2 gap-6">
          <StockCard stockGram={stockGram} />
          <UVStatusCard
            isActive={isUVActive}
            remainingMinutes={uvRemainingMinutes}
            mode={isUVActive ? "MANUAL" : "OFF"}
            nextSchedule="Senin, 20:00"
          />
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
          isLoading={historyLoading}
        />
      </main>
    </div>
  );
};

export default Index;
