# Integration Examples

Complete working examples for integrating the API with existing UI components.

## Example 1: Integrate Dashboard Data

### Before (Mock Data):

```tsx
const Index = () => {
  const [stockGram, setStockGram] = useState(450);
  const [isUVActive, setIsUVActive] = useState(false);
  const [activities, setActivities] = useState<Array<...>>([...]);

  // ... rest of component
}
```

### After (API Integration):

```tsx
"use client";

import { useEffect, useState } from "react";
import { dashboardApi, type ActionHistory } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [stockGram, setStockGram] = useState(0);
  const [isUVActive, setIsUVActive] = useState(false);
  const [uvRemainingMinutes, setUvRemainingMinutes] = useState<number>();
  const [activities, setActivities] = useState<ActionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data on mount
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await dashboardApi.getDashboard();

        setStockGram(data.stock.amount_gram);
        setIsUVActive(data.uv.state === "ON");
        setUvRemainingMinutes(
          data.uv.manual_active ? Math.floor(data.uv.remaining / 60) : undefined
        );
        setActivities(data.history);
      } catch (error) {
        toast.error("Gagal memuat data dashboard", {
          description:
            error instanceof Error ? error.message : "Terjadi kesalahan",
        });
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or use skeleton loader
  }

  // ... rest of component
};
```

---

## Example 2: Integrate Manual Feed

### Before (Mock):

```tsx
const handleFeed = () => {
  const newActivity = {
    id: Date.now().toString(),
    // ...
  };
  setActivities([newActivity, ...activities]);
  setStockGram((prev) => Math.max(0, prev - 10));
  toast.success("Pemberian Pakan Berhasil");
};
```

### After (API Integration):

```tsx
import { feederApi } from "@/lib/api";

const handleFeed = async () => {
  try {
    // Get last feed info first for confirmation
    const lastFeed = await feederApi.getLastFeedInfo();

    // Optional: Show confirmation dialog with last feed info
    // (you can use AlertDialog component)

    // Trigger manual feed
    const response = await feederApi.manualFeed();

    toast.success("Pemberian Pakan Berhasil", {
      description: "10 gram pakan telah diberikan ke akuarium",
    });

    // Refresh dashboard data
    const dashboardData = await dashboardApi.getDashboard();
    setStockGram(dashboardData.stock.amount_gram);
    setActivities(dashboardData.history);
  } catch (error) {
    toast.error("Gagal memberikan pakan", {
      description: error instanceof Error ? error.message : "Terjadi kesalahan",
    });
  }
};
```

---

## Example 3: Integrate Manual UV

### Before (Mock):

```tsx
const handleUVActivate = (durationMinutes: number) => {
  setIsUVActive(true);
  setUvRemainingMinutes(durationMinutes);
  toast.success("UV Sterilizer Diaktifkan");
};
```

### After (API Integration):

```tsx
import { uvApi } from "@/lib/api";

const handleUVActivate = async (durationMinutes: number) => {
  try {
    const response = await uvApi.manualUV(durationMinutes);

    setIsUVActive(true);
    setUvRemainingMinutes(durationMinutes);

    toast.success("UV Sterilizer Diaktifkan", {
      description: `Mode manual berjalan selama ${durationMinutes} menit`,
    });

    // Optional: Poll UV status for real-time updates
    startUVPolling();
  } catch (error) {
    toast.error("Gagal mengaktifkan UV", {
      description: error instanceof Error ? error.message : "Terjadi kesalahan",
    });
  }
};

const handleUVDeactivate = async () => {
  try {
    // Note: API doesn't have explicit deactivate endpoint
    // UV will auto-stop when duration ends
    // For now, just update UI
    setIsUVActive(false);
    setUvRemainingMinutes(undefined);

    toast.info("UV Sterilizer Dimatikan", {
      description: "Mode manual dihentikan",
    });

    stopUVPolling();
  } catch (error) {
    toast.error("Gagal mematikan UV");
  }
};

// Optional: Real-time UV status polling
const startUVPolling = () => {
  const interval = setInterval(async () => {
    try {
      const status = await uvApi.getStatus();
      setIsUVActive(status.state === "ON");
      setUvRemainingMinutes(
        status.manual_active ? Math.floor(status.remaining / 60) : undefined
      );

      // Stop polling if UV is off
      if (status.state === "OFF") {
        stopUVPolling();
      }
    } catch (error) {
      console.error("Failed to poll UV status:", error);
    }
  }, 5000); // Poll every 5 seconds

  // Store interval ID for cleanup
  window.uvPollingInterval = interval;
};

const stopUVPolling = () => {
  if (window.uvPollingInterval) {
    clearInterval(window.uvPollingInterval);
    window.uvPollingInterval = undefined;
  }
};
```

---

## Example 4: Integrate ScheduleManager

### Complete Updated ScheduleManager Component:

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  feederApi,
  uvApi,
  convertDayToApiFormat,
  convertDayToIndonesian,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
// ... other imports

export const ScheduleManager = () => {
  const [feedSchedules, setFeedSchedules] = useState<PakanSchedule[]>([]);
  const [uvSchedules, setUVSchedules] = useState<UVSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Modal states
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isUVModalOpen, setIsUVModalOpen] = useState(false);

  // Form states
  const [newFeedDay, setNewFeedDay] = useState<string>("");
  const [newFeedTime, setNewFeedTime] = useState<string>("");
  const [newUVDay, setNewUVDay] = useState<string>("");
  const [newUVStartTime, setNewUVStartTime] = useState<string>("");
  const [newUVEndTime, setNewUVEndTime] = useState<string>("");

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const [feedData, uvData] = await Promise.all([
        feederApi.getSchedules(),
        uvApi.getSchedules(),
      ]);

      setFeedSchedules(feedData);
      setUVSchedules(uvData);
    } catch (error) {
      toast.error("Gagal memuat jadwal", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Feed Schedule Addition
  const handleAddFeedSchedule = async () => {
    if (!newFeedDay || !newFeedTime) {
      toast.error("Form tidak lengkap", {
        description: "Mohon isi semua field yang diperlukan",
      });
      return;
    }

    try {
      const apiDay = convertDayToApiFormat(newFeedDay);

      // Validasi maksimal 5 jadwal per hari
      const schedulesForDay = feedSchedules.filter(
        (s) => s.day_name === apiDay
      );
      if (schedulesForDay.length >= 5) {
        toast.error("Batas maksimal tercapai", {
          description: `Maksimal 5 jadwal pakan per hari untuk ${newFeedDay}.`,
        });
        return;
      }

      const newSchedule = await feederApi.createSchedule({
        day_name: apiDay,
        time: newFeedTime,
        amount_gram: 10,
        is_active: true,
      });

      setFeedSchedules([...feedSchedules, newSchedule]);
      setIsFeedModalOpen(false);
      setNewFeedDay("");
      setNewFeedTime("");

      toast.success("Jadwal pakan ditambahkan", {
        description: `${newFeedDay} pukul ${newFeedTime}`,
      });
    } catch (error) {
      toast.error("Gagal menambahkan jadwal", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  };

  // Handle UV Schedule Addition
  const handleAddUVSchedule = async () => {
    if (!newUVDay || !newUVStartTime || !newUVEndTime) {
      toast.error("Form tidak lengkap", {
        description: "Mohon isi semua field yang diperlukan",
      });
      return;
    }

    try {
      const apiDay = convertDayToApiFormat(newUVDay);

      const newSchedule = await uvApi.createSchedule({
        day_name: apiDay,
        start_time: newUVStartTime,
        end_time: newUVEndTime,
        is_active: true,
      });

      setUVSchedules([...uvSchedules, newSchedule]);
      setIsUVModalOpen(false);
      setNewUVDay("");
      setNewUVStartTime("");
      setNewUVEndTime("");

      toast.success("Jadwal UV ditambahkan", {
        description: `${newUVDay} dari ${newUVStartTime} hingga ${newUVEndTime}`,
      });
    } catch (error) {
      toast.error("Gagal menambahkan jadwal", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  };

  // Handle Delete Feed Schedule
  const handleDeleteFeedSchedule = async (id: number) => {
    try {
      await feederApi.deleteSchedule(id);
      setFeedSchedules(feedSchedules.filter((s) => s.id !== id));
      toast.info("Jadwal pakan dihapus");
    } catch (error) {
      toast.error("Gagal menghapus jadwal");
    }
  };

  // Handle Delete UV Schedule
  const handleDeleteUVSchedule = async (id: number) => {
    try {
      await uvApi.deleteSchedule(id);
      setUVSchedules(uvSchedules.filter((s) => s.id !== id));
      toast.info("Jadwal UV dihapus");
    } catch (error) {
      toast.error("Gagal menghapus jadwal");
    }
  };

  // Handle Toggle Feed Schedule
  const handleToggleFeedSchedule = async (
    schedule: PakanSchedule,
    isActive: boolean
  ) => {
    try {
      const updated = await feederApi.updateSchedule(schedule.id, {
        day_name: schedule.day_name,
        time: schedule.time,
        amount_gram: schedule.amount_gram,
        is_active: isActive,
      });

      setFeedSchedules(
        feedSchedules.map((s) => (s.id === schedule.id ? updated : s))
      );
    } catch (error) {
      toast.error("Gagal mengupdate jadwal");
      // Revert UI
      loadSchedules();
    }
  };

  // Handle Toggle UV Schedule
  const handleToggleUVSchedule = async (
    schedule: UVSchedule,
    isActive: boolean
  ) => {
    try {
      const updated = await uvApi.updateSchedule(schedule.id, {
        day_name: schedule.day_name,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: isActive,
      });

      setUVSchedules(
        uvSchedules.map((s) => (s.id === schedule.id ? updated : s))
      );
    } catch (error) {
      toast.error("Gagal mengupdate jadwal");
      // Revert UI
      loadSchedules();
    }
  };

  if (loading) {
    return <div>Loading schedules...</div>;
  }

  return (
    <Card>
      {/* ... render UI dengan converted day names */}
      {feedSchedules.map((schedule) => (
        <div key={schedule.id}>
          <Badge>{convertDayToIndonesian(schedule.day_name)}</Badge>
          <span>{schedule.time}</span>
          <Switch
            checked={schedule.is_active}
            onCheckedChange={(checked) =>
              handleToggleFeedSchedule(schedule, checked)
            }
          />
          <Button onClick={() => handleDeleteFeedSchedule(schedule.id)}>
            Delete
          </Button>
        </div>
      ))}
      {/* ... rest of component */}
    </Card>
  );
};
```

---

## Example 5: Add Stock Update Modal

### New Component: StockUpdateModal.tsx

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { stockApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStock: number;
  onStockUpdated: (newStock: number) => void;
}

export const StockUpdateModal = ({
  isOpen,
  onClose,
  currentStock,
  onStockUpdated,
}: StockUpdateModalProps) => {
  const [newStock, setNewStock] = useState(currentStock.toString());
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const amount = parseInt(newStock);

    if (isNaN(amount) || amount < 0) {
      toast.error("Jumlah tidak valid", {
        description: "Mohon masukkan angka yang valid (minimal 0)",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await stockApi.updateStock(amount);

      onStockUpdated(result.amount_gram);
      onClose();

      toast.success("Stock berhasil diupdate", {
        description: `Stock pakan sekarang: ${result.amount_gram} gram`,
      });
    } catch (error) {
      toast.error("Gagal mengupdate stock", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Stock Pakan
          </DialogTitle>
          <DialogDescription>
            Masukkan jumlah stock pakan terbaru setelah refill
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stock-amount">Jumlah Stock (gram)</Label>
            <Input
              id="stock-amount"
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Masukkan jumlah dalam gram"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Stock saat ini: <strong>{currentStock} gram</strong>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Menyimpan..." : "Update Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### Update StockCard to include update button:

```tsx
import { useState } from "react";
import { StockUpdateModal } from "./StockUpdateModal";

export const StockCard = ({
  stockGram,
  maxCapacity,
  onStockUpdate,
}: StockCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ... existing code

  return (
    <Card>
      {/* ... existing content */}

      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
        <Package className="mr-2 h-4 w-4" />
        Update Stock
      </Button>

      <StockUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStock={stockGram}
        onStockUpdated={onStockUpdate}
      />
    </Card>
  );
};
```

---

## Example 6: Add History Filters

### Update ActivityHistory Component:

```tsx
"use client";

import { useState } from "react";
import { historyApi, type ActionHistory } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const ActivityHistory = () => {
  const [activities, setActivities] = useState<ActionHistory[]>([]);
  const [deviceFilter, setDeviceFilter] = useState<"FEEDER" | "UV" | "ALL">(
    "ALL"
  );
  const [sourceFilter, setSourceFilter] = useState<
    "SCHEDULE" | "MANUAL" | "ALL"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };

      if (deviceFilter !== "ALL") params.device_type = deviceFilter;
      if (sourceFilter !== "ALL") params.trigger_source = sourceFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const data = await historyApi.getHistory(params);
      setActivities(data);
    } catch (error) {
      toast.error("Gagal memuat history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [deviceFilter, sourceFilter, statusFilter]);

  return (
    <Card>
      <div className="flex gap-4 mb-4">
        <Select value={deviceFilter} onValueChange={setDeviceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Device</SelectItem>
            <SelectItem value="FEEDER">Feeder</SelectItem>
            <SelectItem value="UV">UV Sterilizer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Trigger</SelectItem>
            <SelectItem value="SCHEDULE">Schedule</SelectItem>
            <SelectItem value="MANUAL">Manual</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={loadHistory}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ... render activities */}
    </Card>
  );
};
```

---

## 🔧 Environment Variables

Don't forget to add to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🚀 Quick Test

After integration, test with:

```bash
# 1. Seed demo data
curl -X POST http://localhost:8080/api/v1/demo/seed

# 2. Test in browser
# Navigate to your app and verify all data loads

# 3. Clear demo data
curl -X POST http://localhost:8080/api/v1/demo/clear
```
