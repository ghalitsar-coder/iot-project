import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dashboardApi,
  feederApi,
  uvApi,
  stockApi,
  historyApi,
  sensorApi,
  type PakanScheduleInput,
  type UVScheduleInput,
} from "@/lib/api";
import { toast } from "sonner";

// Query Keys
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  feederSchedules: ["feeder", "schedules"] as const,
  uvSchedules: ["uv", "schedules"] as const,
  uvStatus: ["uv", "status"] as const,
  stock: ["stock"] as const,
  history: (filters?: {
    device_type?: string;
    trigger_source?: string;
    status?: string;
  }) => ["history", filters] as const,
  sensorCurrent: ["sensor", "current"] as const,
  sensorHistory: (range?: '24h' | '7d' | '30d') => ["sensor", "history", range] as const,
};

// Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardApi.getDashboard(),
  });
}

// Feeder Schedules
export function useFeederSchedules() {
  return useQuery({
    queryKey: queryKeys.feederSchedules,
    queryFn: () => feederApi.getSchedules(),
    select: (response) => response.data, // Extract data from paginated response
  });
}

export function useCreateFeederSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PakanScheduleInput) => feederApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feederSchedules });
      toast.success("Jadwal Pakan Ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal Menambahkan Jadwal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    },
  });
}

export function useUpdateFeederSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PakanScheduleInput }) =>
      feederApi.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feederSchedules });
      toast.success("Jadwal Pakan Diupdate");
    },
    onError: () => {
      toast.error("Gagal Mengupdate Jadwal");
    },
  });
}

export function useDeleteFeederSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => feederApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feederSchedules });
      toast.info("Jadwal Pakan Dihapus");
    },
    onError: () => {
      toast.error("Gagal Menghapus Jadwal");
    },
  });
}

export function useManualFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => feederApi.manualFeed(),
    onSuccess: () => {
      // Invalidate related queries to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.stock });
      queryClient.invalidateQueries({ queryKey: ["history"] }); // Invalidate all history queries
      toast.success("Pemberian Pakan Berhasil", {
        description: "Pakan telah diberikan secara manual",
      });
    },
    onError: (error) => {
      toast.error("Gagal Memberikan Pakan", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    },
  });
}

// UV Schedules
export function useUVSchedules() {
  return useQuery({
    queryKey: queryKeys.uvSchedules,
    queryFn: () => uvApi.getSchedules(),
    select: (response) => response.data, // Extract data from paginated response
  });
}

export function useCreateUVSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UVScheduleInput) => uvApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.uvSchedules });
      toast.success("Jadwal UV Ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal Menambahkan Jadwal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    },
  });
}

export function useUpdateUVSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UVScheduleInput }) =>
      uvApi.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.uvSchedules });
      toast.success("Jadwal UV Diupdate");
    },
    onError: () => {
      toast.error("Gagal Mengupdate Jadwal");
    },
  });
}

export function useDeleteUVSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => uvApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.uvSchedules });
      toast.info("Jadwal UV Dihapus");
    },
    onError: () => {
      toast.error("Gagal Menghapus Jadwal");
    },
  });
}

export function useUVStatus() {
  return useQuery({
    queryKey: queryKeys.uvStatus,
    queryFn: () => uvApi.getStatus(),
    refetchInterval: (query) => {
      // Poll every 5 seconds if UV is active
      const data = query.state.data;
      return data?.manual_active ? 5000 : false;
    },
  });
}

export function useManualUV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (durationMinutes: number) => uvApi.manualUV(durationMinutes),
    onSuccess: () => {
      // Invalidate related queries to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.uvStatus });
      queryClient.invalidateQueries({ queryKey: ["history"] }); // Invalidate all history queries
      toast.success("UV Sterilizer Diaktifkan", {
        description: "UV telah diaktifkan secara manual",
      });
    },
    onError: (error) => {
      toast.error("Gagal Mengaktifkan UV", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    },
  });
}

export function useStopManualUV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => uvApi.stopManualUV(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.uvStatus });
      queryClient.invalidateQueries({ queryKey: ["history"] }); // Invalidate all history queries
      toast.success("UV Manual Dihentikan", {
        description: "Sinar UV telah dimatikan",
      });
    },
    onError: (error) => {
      toast.error("Gagal Menghentikan UV", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    },
  });
}

// Stock
export function useStock() {
  return useQuery({
    queryKey: queryKeys.stock,
    queryFn: () => stockApi.getStock(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time stock updates
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amountGram: number) => stockApi.updateStock(amountGram),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock });
      toast.success("Stock Diupdate");
    },
    onError: () => {
      toast.error("Gagal Mengupdate Stock");
    },
  });
}

// History
export function useHistory(filters?: {
  device_type?: "FEEDER" | "UV";
  trigger_source?: "SCHEDULE" | "MANUAL";
  status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "OVERRIDDEN" | "STOPPED";
  date_from?: Date;
  date_to?: Date;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: queryKeys.history(filters),
    queryFn: () => historyApi.getHistory(filters),
    select: (response) => response.data, // Extract data from paginated response
  });
}

// History with full pagination metadata
export function useHistoryWithPagination(filters?: {
  device_type?: "FEEDER" | "UV";
  trigger_source?: "SCHEDULE" | "MANUAL";
  status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "OVERRIDDEN" | "STOPPED";
  date_from?: Date;
  date_to?: Date;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: queryKeys.history(filters),
    queryFn: () => historyApi.getHistory(filters),
    // Return full response including pagination metadata
  });
}

// ============================================================================
// SENSOR HOOKS
// ============================================================================

/**
 * Get current sensor data (temperature & humidity)
 */
export function useSensorData() {
  return useQuery({
    queryKey: queryKeys.sensorCurrent,
    queryFn: () => sensorApi.getCurrentData(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time monitoring
  });
}

/**
 * Get sensor history for charts
 */
export function useSensorHistory(range?: '24h' | '7d' | '30d') {
  return useQuery({
    queryKey: queryKeys.sensorHistory(range),
    queryFn: () => sensorApi.getHistory({ range, page_size: 200 }), // Get more data for charts
    select: (response) => response.data, // Extract data array from paginated response
  });
}

