// API Helper for Smart Aquarium Controller
// Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://iot-backend-cursor-production.up.railway.app/api/v1';

// Type definitions based on OpenAPI schema
export interface PakanSchedule {
  id: number;
  day_name: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  time: string; // HH:MM format
  amount_gram: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PakanScheduleInput {
  day_name: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  time: string;
  amount_gram?: number;
  is_active?: boolean;
}

export interface UVSchedule {
  id: number;
  day_name: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UVScheduleInput {
  day_name: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface ActionHistory {
  id: number;
  device_type: 'FEEDER' | 'UV';
  trigger_source: 'SCHEDULE' | 'MANUAL';
  start_time: string;
  end_time: string | null;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'OVERRIDDEN' | 'STOPPED';
  value: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface Stock {
  id: number;
  amount_gram: number;
  updated_at: string;
}

export interface UVStatus {
  state: 'ON' | 'OFF';
  remaining: number;
  last_updated: string;
  manual_active: boolean;
  manual_end_time: string | null;
}

export interface DeviceStatus {
  status: 'IDLE' | 'DISPENSING' | 'ON' | 'OFF';
  remaining: number;
  last_updated: string;
}

export interface DashboardResponse {
  stock: {
    amount_gram: number;
  };
  uv: UVStatus;
  feeder: DeviceStatus;
}

export interface LastFeedInfo {
  exists: boolean;
  day?: string;
  time?: string;
  date?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Network error',
      { originalError: error }
    );
  }
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardApi = {
  /**
   * Get complete dashboard data
   */
  getDashboard: (): Promise<DashboardResponse> => {
    return apiFetch<DashboardResponse>('/dashboard');
  },
};

// ============================================================================
// FEEDER API
// ============================================================================

export const feederApi = {
  /**
   * Get all feeder schedules with pagination
   */
  getSchedules: (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<PakanSchedule>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }
    
    const query = queryParams.toString();
    const endpoint = query ? `/feeder/schedules?${query}` : '/feeder/schedules';
    
    return apiFetch<PaginatedResponse<PakanSchedule>>(endpoint);
  },

  /**
   * Create new feeder schedule
   */
  createSchedule: (data: PakanScheduleInput): Promise<PakanSchedule> => {
    return apiFetch<PakanSchedule>('/feeder/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing feeder schedule
   */
  updateSchedule: (
    id: number,
    data: PakanScheduleInput
  ): Promise<PakanSchedule> => {
    return apiFetch<PakanSchedule>(`/feeder/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete feeder schedule
   */
  deleteSchedule: (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/feeder/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Trigger manual feed
   */
  manualFeed: (): Promise<{
    message: string;
    action_id: number;
    last_feed: { day: string; time: string };
  }> => {
    return apiFetch('/feeder/manual', {
      method: 'POST',
    });
  },

  /**
   * Get last feed information
   */
  getLastFeedInfo: (): Promise<LastFeedInfo> => {
    return apiFetch<LastFeedInfo>('/feeder/last-feed');
  },
};

// ============================================================================
// UV API
// ============================================================================

export const uvApi = {
  /**
   * Get all UV schedules with pagination
   */
  getSchedules: (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<UVSchedule>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }
    
    const query = queryParams.toString();
    const endpoint = query ? `/uv/schedules?${query}` : '/uv/schedules';
    
    return apiFetch<PaginatedResponse<UVSchedule>>(endpoint);
  },

  /**
   * Create new UV schedule
   */
  createSchedule: (data: UVScheduleInput): Promise<UVSchedule> => {
    return apiFetch<UVSchedule>('/uv/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing UV schedule
   */
  updateSchedule: (id: number, data: UVScheduleInput): Promise<UVSchedule> => {
    return apiFetch<UVSchedule>(`/uv/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete UV schedule
   */
  deleteSchedule: (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/uv/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Trigger manual UV
   */
  manualUV: (
    durationMinutes: number
  ): Promise<{
    message: string;
    action_id: number;
    duration_sec: number;
    end_time: string;
  }> => {
    return apiFetch('/uv/manual', {
      method: 'POST',
      body: JSON.stringify({ duration_minutes: durationMinutes }),
    });
  },

  /**
   * Stop running manual UV
   */
  stopManualUV: (): Promise<{
    message: string;
    action_id: number;
    stopped_at: string;
  }> => {
    return apiFetch('/uv/manual/stop', {
      method: 'POST',
    });
  },

  /**
   * Get UV status
   */
  getStatus: (): Promise<UVStatus> => {
    return apiFetch<UVStatus>('/uv/status');
  },
};

// ============================================================================
// HISTORY API
// ============================================================================

export const historyApi = {
  /**
   * Get action history with optional filters
   */
  getHistory: (params?: {
    device_type?: 'FEEDER' | 'UV';
    trigger_source?: 'SCHEDULE' | 'MANUAL';
    status?: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'OVERRIDDEN' | 'STOPPED';
    date_from?: Date;
    date_to?: Date;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ActionHistory>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.device_type) {
      queryParams.append('device_type', params.device_type);
    }
    if (params?.trigger_source) {
      queryParams.append('trigger_source', params.trigger_source);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.date_from) {
      queryParams.append('date_from', params.date_from.toISOString());
    }
    if (params?.date_to) {
      queryParams.append('date_to', params.date_to.toISOString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }

    const query = queryParams.toString();
    const endpoint = query ? `/history?${query}` : '/history';
    
    return apiFetch<PaginatedResponse<ActionHistory>>(endpoint);
  },
};

// ============================================================================
// STOCK API
// ============================================================================

export const stockApi = {
  /**
   * Get current stock
   */
  getStock: (): Promise<Stock> => {
    return apiFetch<Stock>('/stock');
  },

  /**
   * Update stock amount
   */
  updateStock: (amountGram: number): Promise<Stock> => {
    return apiFetch<Stock>('/stock', {
      method: 'PUT',
      body: JSON.stringify({ amount_gram: amountGram }),
    });
  },
};

// ============================================================================
// DEMO API
// ============================================================================

export const demoApi = {
  /**
   * Seed demo data
   */
  seedData: (): Promise<{
    message: string;
    stock: number;
    schedules: { feeder: number; uv: number };
  }> => {
    return apiFetch('/demo/seed', {
      method: 'POST',
    });
  },

  /**
   * Clear demo data
   */
  clearData: (): Promise<{ message: string }> => {
    return apiFetch('/demo/clear', {
      method: 'POST',
    });
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert day name from Indonesian to API format
 */
export function convertDayToApiFormat(
  day: string
): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' {
  const dayMap: Record<string, 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'> = {
    Senin: 'Mon',
    Selasa: 'Tue',
    Rabu: 'Wed',
    Kamis: 'Thu',
    Jumat: 'Fri',
    Sabtu: 'Sat',
    Minggu: 'Sun',
    'Setiap Hari': 'Mon', // Default for "Every day"
  };
  return dayMap[day] || 'Mon';
}

/**
 * Convert day name from API format to Indonesian
 */
export function convertDayToIndonesian(
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
): string {
  const dayMap: Record<string, string> = {
    Mon: 'Senin',
    Tue: 'Selasa',
    Wed: 'Rabu',
    Thu: 'Kamis',
    Fri: 'Jumat',
    Sat: 'Sabtu',
    Sun: 'Minggu',
  };
  return dayMap[day] || day;
}

/**
 * Format date from ISO string to Indonesian format
 */
export function formatDateIndonesian(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options);
}

/**
 * Calculate duration in human readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
}
