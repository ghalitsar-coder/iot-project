import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { History, Fish, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ActionHistory, type PaginationMeta } from "@/lib/api";
import {
  ActivityHistoryFilter,
  type ActivityFilters,
} from "./ActivityHistoryFilter";
import { Fragment } from "react";

interface ActivityHistoryProps {
  activities: ActionHistory[];
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  pagination?: PaginationMeta;
  isLoading?: boolean;
}

export const ActivityHistory = ({
  activities,
  filters,
  onFiltersChange,
  pagination,
  isLoading = false,
}: ActivityHistoryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-success/10 text-success border-success/20";
      case "FAILED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "RUNNING":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDeviceIcon = (type: string) => {
    return type === "FEEDER" ? (
      <Fish className="h-4 w-4" />
    ) : (
      <Zap className="h-4 w-4" />
    );
  };

  // Calculate active filters count
  const activeFiltersCount = [
    filters.device_type,
    filters.trigger_source,
    filters.status,
    filters.date_from,
    filters.date_to,
  ].filter(Boolean).length;

  return (
    <Card className="border-border/50 bg-card shadow-[var(--shadow-card)]">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">
                Riwayat Aktivitas
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Log aktivitas sistem real-time
            </p>
          </div>
          <ActivityHistoryFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-6 space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-30 animate-pulse" />
              <p>Memuat aktivitas...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                  "bg-card/50 border-border/50"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-full",
                    activity.device_type === "FEEDER"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/10 text-accent"
                  )}
                >
                  {getDeviceIcon(activity.device_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-card-foreground">
                      {activity.device_type === "FEEDER"
                        ? "Pemberian Pakan"
                        : "UV Sterilizer"}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {activity.trigger_source === "MANUAL"
                        ? "Manual"
                        : "Terjadwal"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.start_time).toLocaleString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {activity.value && activity.value > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.device_type === "FEEDER"
                        ? `Jumlah: ${activity.value}g`
                        : `Durasi: ${Math.floor(activity.value / 60)} menit`}
                    </p>
                  )}
                </div>

                <Badge
                  className={cn("shrink-0", getStatusColor(activity.status))}
                >
                  {activity.status === "SUCCESS"
                    ? "Berhasil"
                    : activity.status === "FAILED"
                    ? "Gagal"
                    : "Berjalan"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Pagination Controls */}
      {pagination && pagination.total_pages > 1 && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Halaman {pagination.page} dari {pagination.total_pages} • Total{" "}
              {pagination.total} data
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (pagination.page > 1) {
                        onFiltersChange({
                          ...filters,
                          page: pagination.page - 1,
                        });
                      }
                    }}
                    className={cn(
                      pagination.page === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.total_pages ||
                      Math.abs(page - pagination.page) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    // Add ellipsis if there's a gap
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <Fragment key={page}>
                        {showEllipsis && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() =>
                              onFiltersChange({
                                ...filters,
                                page,
                              })
                            }
                            isActive={page === pagination.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </Fragment>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (pagination.page < pagination.total_pages) {
                        onFiltersChange({
                          ...filters,
                          page: pagination.page + 1,
                        });
                      }
                    }}
                    className={cn(
                      pagination.page === pagination.total_pages &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </Card>
  );
};
