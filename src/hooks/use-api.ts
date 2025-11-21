import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dashboardApi,
  feederApi,
  uvApi,
  stockApi,
  historyApi,
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
};

// Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardApi.getDashboard(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Feeder Schedules
export function useFeederSchedules() {
  return useQuery({
    queryKey: queryKeys.feederSchedules,
    queryFn: () => feederApi.getSchedules(),
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.stock });
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.uvStatus });
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

// Stock
export function useStock() {
  return useQuery({
    queryKey: queryKeys.stock,
    queryFn: () => stockApi.getStock(),
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amountGram: number) => stockApi.updateStock(amountGram),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
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
  status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "OVERRIDDEN";
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.history(filters),
    queryFn: () => historyApi.getHistory(filters),
  });
}
