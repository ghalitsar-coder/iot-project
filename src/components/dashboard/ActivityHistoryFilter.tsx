"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ActivityFilters {
  device_type?: "FEEDER" | "UV";
  trigger_source?: "SCHEDULE" | "MANUAL";
  status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "OVERRIDDEN";
  date_from?: Date;
  date_to?: Date;
  page?: number;
  page_size?: number;
}

interface ActivityHistoryFilterProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  activeFiltersCount: number;
}

export const ActivityHistoryFilter = ({
  filters,
  onFiltersChange,
  activeFiltersCount,
}: ActivityHistoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ActivityFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: ActivityFilters = { page: 1, page_size: 50 };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleClearDate = (type: "from" | "to") => {
    setLocalFilters((prev) => {
      const updated = { ...prev };
      if (type === "from") {
        delete updated.date_from;
      } else {
        delete updated.date_to;
      }
      return updated;
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Riwayat Aktivitas</SheetTitle>
          <SheetDescription>
            Sesuaikan filter untuk menampilkan data yang Anda butuhkan
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Device Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="device-type">Tipe Perangkat</Label>
            <Select
              value={localFilters.device_type || "all"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  device_type:
                    value === "all" ? undefined : (value as "FEEDER" | "UV"),
                }))
              }
            >
              <SelectTrigger id="device-type">
                <SelectValue placeholder="Semua Perangkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Perangkat</SelectItem>
                <SelectItem value="FEEDER">🐟 Feeder (Pakan)</SelectItem>
                <SelectItem value="UV">⚡ UV Sterilizer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trigger Source Filter */}
          <div className="space-y-2">
            <Label htmlFor="trigger-source">Sumber Pemicu</Label>
            <Select
              value={localFilters.trigger_source || "all"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  trigger_source:
                    value === "all"
                      ? undefined
                      : (value as "SCHEDULE" | "MANUAL"),
                }))
              }
            >
              <SelectTrigger id="trigger-source">
                <SelectValue placeholder="Semua Sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sumber</SelectItem>
                <SelectItem value="SCHEDULE">📅 Terjadwal</SelectItem>
                <SelectItem value="MANUAL">✋ Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || "all"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  status:
                    value === "all"
                      ? undefined
                      : (value as ActivityFilters["status"]),
                }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="SUCCESS">✅ Berhasil</SelectItem>
                <SelectItem value="FAILED">❌ Gagal</SelectItem>
                <SelectItem value="RUNNING">⏳ Berjalan</SelectItem>
                <SelectItem value="PENDING">⏸️ Menunggu</SelectItem>
                <SelectItem value="OVERRIDDEN">🔄 Ditimpa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label>Rentang Tanggal</Label>

            {/* Date From */}
            <div className="space-y-2">
              <Label
                htmlFor="date-from"
                className="text-sm text-muted-foreground"
              >
                Dari Tanggal
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-from"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.date_from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.date_from ? (
                      format(localFilters.date_from, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal mulai</span>
                    )}
                    {localFilters.date_from && (
                      <X
                        className="ml-auto h-4 w-4 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearDate("from");
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.date_from}
                    onSelect={(date) =>
                      setLocalFilters((prev) => ({ ...prev, date_from: date }))
                    }
                    initialFocus
                    disabled={(date) =>
                      localFilters.date_to ? date > localFilters.date_to : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label
                htmlFor="date-to"
                className="text-sm text-muted-foreground"
              >
                Sampai Tanggal
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-to"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.date_to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.date_to ? (
                      format(localFilters.date_to, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal akhir</span>
                    )}
                    {localFilters.date_to && (
                      <X
                        className="ml-auto h-4 w-4 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearDate("to");
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.date_to}
                    onSelect={(date) =>
                      setLocalFilters((prev) => ({ ...prev, date_to: date }))
                    }
                    initialFocus
                    disabled={(date) =>
                      localFilters.date_from
                        ? date < localFilters.date_from
                        : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Page Size Filter */}
          <div className="space-y-2">
            <Label htmlFor="page-size">Jumlah Data Per Halaman</Label>
            <Select
              value={String(localFilters.page_size || 50)}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  page_size: parseInt(value),
                }))
              }
            >
              <SelectTrigger id="page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 Data</SelectItem>
                <SelectItem value="20">20 Data</SelectItem>
                <SelectItem value="50">50 Data</SelectItem>
                <SelectItem value="100">100 Data</SelectItem>
                <SelectItem value="200">200 Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="flex-1"
          >
            Reset Filter
          </Button>
          <Button onClick={handleApplyFilters} className="flex-1">
            Terapkan Filter
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
