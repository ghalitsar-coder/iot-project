# API Integration Analysis & Implementation Guide

## 📊 Status Integrasi API vs UI

### ✅ UI yang Sudah Ada & Siap Integrasi

| Component           | Status   | API Endpoints                                                                | Action Required               |
| ------------------- | -------- | ---------------------------------------------------------------------------- | ----------------------------- |
| **StockCard**       | ✅ Ready | `GET /stock`, `PUT /stock`                                                   | Fetch & display stock data    |
| **UVStatusCard**    | ✅ Ready | `GET /uv/status`                                                             | Fetch UV status real-time     |
| **ActivityHistory** | ✅ Ready | `GET /history`                                                               | Fetch and display history     |
| **FeedControl**     | ✅ Ready | `POST /feeder/manual`, `GET /feeder/last-feed`                               | Manual feed with confirmation |
| **UVControl**       | ✅ Ready | `POST /uv/manual`, `GET /uv/status`                                          | Manual UV activation          |
| **ScheduleManager** | ✅ Ready | `GET/POST/PUT/DELETE /feeder/schedules`, `GET/POST/PUT/DELETE /uv/schedules` | CRUD operations               |

### 🚀 API yang Tersedia & Sudah Bisa Digunakan

#### 1. Dashboard API

- ✅ `GET /dashboard` - Mengambil semua data dashboard sekaligus
  - **Keuntungan**: Single endpoint untuk semua data utama
  - **Cocok untuk**: Initial page load

#### 2. Feeder API

- ✅ `GET /feeder/schedules` - List jadwal pakan
- ✅ `POST /feeder/schedules` - Tambah jadwal pakan
- ✅ `PUT /feeder/schedules/{id}` - Update jadwal pakan
- ✅ `DELETE /feeder/schedules/{id}` - Hapus jadwal pakan
- ✅ `POST /feeder/manual` - Manual feed
- ✅ `GET /feeder/last-feed` - Info pakan terakhir

#### 3. UV API

- ✅ `GET /uv/schedules` - List jadwal UV
- ✅ `POST /uv/schedules` - Tambah jadwal UV
- ✅ `PUT /uv/schedules/{id}` - Update jadwal UV
- ✅ `DELETE /uv/schedules/{id}` - Hapus jadwal UV
- ✅ `POST /uv/manual` - Manual UV
- ✅ `GET /uv/status` - Status UV real-time

#### 4. History API

- ✅ `GET /history` - List history dengan filter
  - Query params: `device_type`, `trigger_source`, `status`, `limit`

#### 5. Stock API

- ✅ `GET /stock` - Get current stock
- ✅ `PUT /stock` - Update stock

#### 6. Demo API

- ✅ `POST /demo/seed` - Seed demo data
- ✅ `POST /demo/clear` - Clear demo data

---

## 🎯 UI yang Belum Dibuat (Tapi API Sudah Ada)

### 1. ❌ Stock Update UI

**API Available**: `PUT /stock`

**Missing UI**: Form/Modal untuk update stock pakan secara manual

**Recommendation**:

```tsx
// Component: StockUpdateModal
- Input: amount_gram (number)
- Button: "Update Stock"
- Location: Bisa ditambahkan ke StockCard
```

**Priority**: 🔥 HIGH - User perlu cara untuk refill stock

---

### 2. ❌ Dashboard Overview Page

**API Available**: `GET /dashboard`

**Missing UI**: Page yang memanfaatkan endpoint `/dashboard` untuk load semua data sekaligus

**Current Situation**: `aqua/page.tsx` menggunakan mock data lokal

**Recommendation**:

```tsx
// Update aqua/page.tsx to use:
const { stock, uv, feeder, history } = await dashboardApi.getDashboard();
```

**Priority**: 🔥 HIGH - Ini adalah entry point utama aplikasi

---

### 3. ❌ Demo Mode Controls

**API Available**: `POST /demo/seed`, `POST /demo/clear`

**Missing UI**: Button/Section untuk demo mode

**Recommendation**:

```tsx
// Component: DemoModePanel (Optional - for development)
- Button: "Seed Demo Data"
- Button: "Clear Demo Data"
- Location: Settings page atau development panel
```

**Priority**: 🟡 MEDIUM - Berguna untuk testing dan demo

---

### 4. ❌ History Filters

**API Available**: `GET /history` with query params

**Current UI**: ActivityHistory hanya menampilkan, tidak ada filter

**Missing Features**:

- Filter by device_type (FEEDER/UV)
- Filter by trigger_source (SCHEDULE/MANUAL)
- Filter by status (SUCCESS/FAILED/etc)
- Limit control

**Recommendation**:

```tsx
// Add to ActivityHistory component:
- Dropdown filter: Device Type
- Dropdown filter: Trigger Source
- Dropdown filter: Status
- Input: Limit results
```

**Priority**: 🟡 MEDIUM - Nice to have untuk better UX

---

### 5. ❌ Schedule Toggle (Active/Inactive)

**API Available**: `PUT /feeder/schedules/{id}`, `PUT /uv/schedules/{id}`

**Current UI**: ScheduleManager punya Switch, tapi belum ter-integrasi dengan API

**Missing**:

- API call saat toggle switch
- Optimistic update atau loading state

**Recommendation**:

```tsx
// Update ScheduleManager:
const handleToggle = async (id: number, isActive: boolean) => {
  await feederApi.updateSchedule(id, { ...schedule, is_active: isActive });
};
```

**Priority**: 🔥 HIGH - Switch sudah ada tapi belum functional

---

### 6. ❌ Real-time Status Updates

**API Available**: `GET /uv/status`

**Missing UI**: Auto-refresh untuk status UV

**Recommendation**:

```tsx
// Add polling or WebSocket for real-time updates
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await uvApi.getStatus();
    setUVStatus(status);
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

**Priority**: 🟡 MEDIUM - Better UX untuk monitor UV

---

### 7. ❌ Error Handling & Loading States

**API Available**: All endpoints

**Missing**:

- Loading spinners
- Error messages
- Retry logic
- Optimistic updates

**Recommendation**:

```tsx
// Add to all API calls:
- try/catch blocks
- Loading states
- Error toasts
- Skeleton loaders
```

**Priority**: 🔥 HIGH - Essential untuk production

---

## 📝 Step-by-Step Integration Plan

### Phase 1: Core Data Integration (HIGH PRIORITY)

**1. Update `aqua/page.tsx` to use Dashboard API**

```tsx
import { dashboardApi } from "@/lib/api";

// Replace mock data with API call
useEffect(() => {
  async function loadDashboard() {
    try {
      const data = await dashboardApi.getDashboard();
      setStockGram(data.stock.amount_gram);
      setIsUVActive(data.uv.state === "ON");
      setUvRemainingMinutes(Math.floor(data.uv.remaining / 60));
      setActivities(data.history);
    } catch (error) {
      toast.error("Gagal memuat data dashboard");
    }
  }
  loadDashboard();
}, []);
```

**2. Integrate ScheduleManager with API**

```tsx
// Load schedules on mount
useEffect(() => {
  async function loadSchedules() {
    const [feedSchedules, uvSchedules] = await Promise.all([
      feederApi.getSchedules(),
      uvApi.getSchedules()
    ])
    setFeedSchedules(feedSchedules)
    setUVSchedules(uvSchedules)
  }
  loadSchedules()
}, [])

// Update add/delete handlers to call API
const handleAddFeedSchedule = async () => {
  await feederApi.createSchedule({...})
  // Refresh list
}
```

**3. Integrate Manual Controls**

```tsx
// FeedControl
const handleFeed = async () => {
  try {
    await feederApi.manualFeed();
    toast.success("Pakan berhasil diberikan");
    // Refresh data
  } catch (error) {
    toast.error("Gagal memberikan pakan");
  }
};

// UVControl
const handleUVActivate = async (duration: number) => {
  try {
    await uvApi.manualUV(duration);
    toast.success("UV berhasil diaktifkan");
  } catch (error) {
    toast.error("Gagal mengaktifkan UV");
  }
};
```

---

### Phase 2: Enhanced Features (MEDIUM PRIORITY)

**4. Add Stock Update UI**

- Create `StockUpdateModal` component
- Add button to `StockCard`
- Implement `PUT /stock` call

**5. Add History Filters**

- Add filter controls to `ActivityHistory`
- Implement query params

**6. Add Real-time Updates**

- Implement polling for UV status
- Add auto-refresh for history

---

### Phase 3: Polish & Optimization (LOW PRIORITY)

**7. Add Demo Mode Controls**

- Create settings/dev panel
- Add seed/clear buttons

**8. Optimize Performance**

- Add React Query or SWR for caching
- Implement optimistic updates
- Add debouncing for API calls

**9. Add Error Boundaries**

- Wrap components with error boundaries
- Add retry mechanisms
- Implement offline detection

---

## 🔧 Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

For production:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.aquarium.local/api/v1
```

---

## 📦 Recommended Additional Libraries

```bash
npm install @tanstack/react-query  # For data fetching & caching
npm install swr                     # Alternative to react-query
npm install axios                   # Alternative to fetch
```

---

## ✅ Integration Checklist

- [ ] Setup API base URL in environment variables
- [ ] Integrate Dashboard API in `aqua/page.tsx`
- [ ] Integrate ScheduleManager CRUD operations
- [ ] Integrate Manual Feed control
- [ ] Integrate Manual UV control
- [ ] Add error handling & loading states
- [ ] Add Stock Update UI
- [ ] Add History filters
- [ ] Add real-time status updates
- [ ] Add Demo mode controls
- [ ] Test all API integrations
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Optimize with React Query/SWR

---

## 🎯 Quick Start Example

See `INTEGRATION_EXAMPLE.md` for complete working examples of each integration.
