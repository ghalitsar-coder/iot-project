"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Trash2, Fish, Zap, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  convertDayToIndonesian,
  type PakanSchedule,
  type UVSchedule,
} from "@/lib/api";
import {
  useFeederSchedules,
  useCreateFeederSchedule,
  useUpdateFeederSchedule,
  useDeleteFeederSchedule,
  useUVSchedules,
  useCreateUVSchedule,
  useUpdateUVSchedule,
  useDeleteUVSchedule,
} from "@/hooks/use-api";

type DayName = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Predefined feed amount options
const FEED_AMOUNT_OPTIONS = [5, 8, 10, 12, 15, 20, 25, 30];

export const ScheduleManager = () => {
  const { data: feedSchedules = [], isLoading: feedLoading } =
    useFeederSchedules();
  const { data: uvSchedules = [], isLoading: uvLoading } = useUVSchedules();

  const createFeedSchedule = useCreateFeederSchedule();
  const updateFeedSchedule = useUpdateFeederSchedule();
  const deleteFeedSchedule = useDeleteFeederSchedule();

  const createUVSchedule = useCreateUVSchedule();
  const updateUVSchedule = useUpdateUVSchedule();
  const deleteUVSchedule = useDeleteUVSchedule();

  const days: { id: DayName; label: string }[] = [
    { id: "Mon", label: "Senin" },
    { id: "Tue", label: "Selasa" },
    { id: "Wed", label: "Rabu" },
    { id: "Thu", label: "Kamis" },
    { id: "Fri", label: "Jumat" },
    { id: "Sat", label: "Sabtu" },
    { id: "Sun", label: "Minggu" },
  ];

  const [selectedDay, setSelectedDay] = useState<DayName | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "detail">("create");
  const [scheduleType, setScheduleType] = useState<"feed" | "uv">("feed");

  // Form states for creating new schedules
  const [newFeedTime, setNewFeedTime] = useState<string>("");
  const [newFeedAmount, setNewFeedAmount] = useState<number>(10);
  const [newUVStartTime, setNewUVStartTime] = useState<string>("");
  const [newUVEndTime, setNewUVEndTime] = useState<string>("");

  // Edit mode states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFeedTime, setEditFeedTime] = useState<string>("");
  const [editFeedAmount, setEditFeedAmount] = useState<number>(10);
  const [editUVStartTime, setEditUVStartTime] = useState<string>("");
  const [editUVEndTime, setEditUVEndTime] = useState<string>("");

  // Add mode in detail modal
  const [showAddForm, setShowAddForm] = useState(false);

  // Load default feed amount from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("defaultFeedAmount");
    if (saved) {
      const amount = parseInt(saved);
      setNewFeedAmount(amount);
    }
  }, []);

  const loading = feedLoading || uvLoading;

  const getFeedSchedulesForDay = (day: DayName) =>
    feedSchedules.filter((s) => s.day_name === day);
  const getUVSchedulesForDay = (day: DayName) =>
    uvSchedules.filter((s) => s.day_name === day);

  const handleDayClick = (day: DayName, type: "feed" | "uv") => {
    setSelectedDay(day);
    setScheduleType(type);
    const schedules =
      type === "feed" ? getFeedSchedulesForDay(day) : getUVSchedulesForDay(day);
    setModalMode(schedules.length > 0 ? "detail" : "create");
    setNewFeedTime("");
    setNewUVStartTime("");
    setNewUVEndTime("");
    setEditingId(null);
    setShowAddForm(false);

    // Reset to default amount from localStorage
    const saved = localStorage.getItem("defaultFeedAmount");
    if (saved) {
      setNewFeedAmount(parseInt(saved));
    } else {
      setNewFeedAmount(10);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setNewFeedTime("");
    setNewUVStartTime("");
    setNewUVEndTime("");
    setEditingId(null);
    setEditFeedTime("");
    setEditUVStartTime("");
    setEditUVEndTime("");
    setShowAddForm(false);
  };

  const handleCreateFeedSchedule = () => {
    if (!selectedDay || !newFeedTime) return;
    createFeedSchedule.mutate(
      {
        day_name: selectedDay,
        time: newFeedTime,
        amount_gram: newFeedAmount,
        is_active: true,
      },
      {
        onSuccess: () => {
          setNewFeedTime("");
          const saved = localStorage.getItem("defaultFeedAmount");
          setNewFeedAmount(saved ? parseInt(saved) : 10);
          setShowAddForm(false);
          if (modalMode === "create") closeModal();
        },
      }
    );
  };

  const handleCreateUVSchedule = () => {
    if (!selectedDay || !newUVStartTime || !newUVEndTime) return;
    createUVSchedule.mutate(
      {
        day_name: selectedDay,
        start_time: newUVStartTime,
        end_time: newUVEndTime,
        is_active: true,
      },
      {
        onSuccess: () => {
          setNewUVStartTime("");
          setNewUVEndTime("");
          setShowAddForm(false);
          if (modalMode === "create") closeModal();
        },
      }
    );
  };

  const handleEditFeedSchedule = (schedule: PakanSchedule) => {
    setEditingId(schedule.id);
    setEditFeedTime(schedule.time);
    setEditFeedAmount(schedule.amount_gram);
  };

  const handleSaveEditFeedSchedule = (schedule: PakanSchedule) => {
    if (!editFeedTime) return;
    updateFeedSchedule.mutate(
      {
        id: schedule.id,
        data: {
          day_name: schedule.day_name,
          time: editFeedTime,
          amount_gram: editFeedAmount,
          is_active: schedule.is_active,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditFeedTime("");
          setEditFeedAmount(10);
        },
      }
    );
  };

  const handleCancelEditFeed = () => {
    setEditingId(null);
    setEditFeedTime("");
    setEditFeedAmount(10);
  };

  const handleEditUVSchedule = (schedule: UVSchedule) => {
    setEditingId(schedule.id);
    setEditUVStartTime(schedule.start_time);
    setEditUVEndTime(schedule.end_time);
  };

  const handleSaveEditUVSchedule = (schedule: UVSchedule) => {
    if (!editUVStartTime || !editUVEndTime) return;
    updateUVSchedule.mutate(
      {
        id: schedule.id,
        data: {
          day_name: schedule.day_name,
          start_time: editUVStartTime,
          end_time: editUVEndTime,
          is_active: schedule.is_active,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditUVStartTime("");
          setEditUVEndTime("");
        },
      }
    );
  };

  const handleCancelEditUV = () => {
    setEditingId(null);
    setEditUVStartTime("");
    setEditUVEndTime("");
  };

  const handleToggleFeedSchedule = (
    schedule: PakanSchedule,
    isActive: boolean
  ) => {
    updateFeedSchedule.mutate({
      id: schedule.id,
      data: {
        day_name: schedule.day_name,
        time: schedule.time,
        amount_gram: schedule.amount_gram,
        is_active: isActive,
      },
    });
  };

  const handleToggleUVSchedule = (schedule: UVSchedule, isActive: boolean) => {
    updateUVSchedule.mutate({
      id: schedule.id,
      data: {
        day_name: schedule.day_name,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: isActive,
      },
    });
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card shadow-[var(--shadow-card)]">
        <div className="p-6 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat jadwal...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 bg-card shadow-[var(--shadow-card)]">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">
              Pengaturan Jadwal
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Klik hari untuk mengelola jadwal
          </p>
        </div>

        <Tabs defaultValue="feeder" className="p-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="feeder" className="flex items-center gap-2">
              <Fish className="h-4 w-4" />
              Jadwal Pakan
            </TabsTrigger>
            <TabsTrigger value="uv" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Jadwal UV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feeder" className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              ��� Klik hari untuk menambah atau melihat jadwal pakan
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {days.map((day) => {
                const daySchedules = getFeedSchedulesForDay(day.id);
                const hasSchedules = daySchedules.length > 0;
                const activeSchedules = daySchedules.filter((s) => s.is_active);
                return (
                  <button
                    key={day.id}
                    onClick={() => handleDayClick(day.id, "feed")}
                    className={cn(
                      "relative p-4 rounded-lg border-2 transition-all hover:scale-105",
                      "flex flex-col items-center justify-center gap-2 min-h-[100px]",
                      hasSchedules
                        ? "border-primary/50 bg-primary/5 hover:border-primary"
                        : "border-dashed border-border hover:border-primary/50 bg-muted/30"
                    )}
                  >
                    <span className="text-sm font-medium">{day.label}</span>
                    {hasSchedules ? (
                      <>
                        <Badge variant="default" className="text-xs">
                          {daySchedules.length} jadwal
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activeSchedules.length} aktif
                        </span>
                      </>
                    ) : (
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="uv" className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              ��� Klik hari untuk menambah atau melihat jadwal UV
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {days.map((day) => {
                const daySchedules = getUVSchedulesForDay(day.id);
                const hasSchedules = daySchedules.length > 0;
                const activeSchedules = daySchedules.filter((s) => s.is_active);
                return (
                  <button
                    key={day.id}
                    onClick={() => handleDayClick(day.id, "uv")}
                    className={cn(
                      "relative p-4 rounded-lg border-2 transition-all hover:scale-105",
                      "flex flex-col items-center justify-center gap-2 min-h-[100px]",
                      hasSchedules
                        ? "border-accent/50 bg-accent/5 hover:border-accent"
                        : "border-dashed border-border hover:border-accent/50 bg-muted/30"
                    )}
                  >
                    <span className="text-sm font-medium">{day.label}</span>
                    {hasSchedules ? (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {daySchedules.length} jadwal
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activeSchedules.length} aktif
                        </span>
                      </>
                    ) : (
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog
        open={selectedDay !== null}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-[500px]">
          {modalMode === "create" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {scheduleType === "feed" ? (
                    <Fish className="h-5 w-5 text-primary" />
                  ) : (
                    <Zap className="h-5 w-5 text-accent" />
                  )}
                  Buat Jadwal Baru -{" "}
                  {selectedDay && convertDayToIndonesian(selectedDay)}
                </DialogTitle>
                <DialogDescription>
                  {scheduleType === "feed"
                    ? "Tambahkan jadwal pemberian pakan otomatis"
                    : "Tambahkan jadwal UV sterilizer otomatis"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {scheduleType === "feed" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="feed-time">Waktu Pemberian Pakan</Label>
                      <Input
                        id="feed-time"
                        type="time"
                        value={newFeedTime}
                        onChange={(e) => setNewFeedTime(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feed-amount">Berat Pakan (gram)</Label>
                      <Select
                        value={newFeedAmount.toString()}
                        onValueChange={(value) =>
                          setNewFeedAmount(parseInt(value))
                        }
                      >
                        <SelectTrigger id="feed-amount" className="text-lg">
                          <SelectValue placeholder="Pilih berat pakan" />
                        </SelectTrigger>
                        <SelectContent>
                          {FEED_AMOUNT_OPTIONS.map((amount) => (
                            <SelectItem key={amount} value={amount.toString()}>
                              {amount} gram
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <p className="font-medium mb-1">Detail:</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>
                          • Hari:{" "}
                          <strong>
                            {selectedDay && convertDayToIndonesian(selectedDay)}
                          </strong>
                        </li>
                        <li>
                          • Jumlah: <strong>{newFeedAmount} gram</strong>
                        </li>
                        <li>
                          • Status: <strong>Aktif</strong>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="uv-start">Waktu Mulai</Label>
                        <Input
                          id="uv-start"
                          type="time"
                          value={newUVStartTime}
                          onChange={(e) => setNewUVStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uv-end">Waktu Selesai</Label>
                        <Input
                          id="uv-end"
                          type="time"
                          value={newUVEndTime}
                          onChange={(e) => setNewUVEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <p className="font-medium mb-1">Detail:</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>
                          • Hari:{" "}
                          <strong>
                            {selectedDay && convertDayToIndonesian(selectedDay)}
                          </strong>
                        </li>
                        <li>
                          • Status: <strong>Aktif</strong>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  onClick={
                    scheduleType === "feed"
                      ? handleCreateFeedSchedule
                      : handleCreateUVSchedule
                  }
                  disabled={
                    scheduleType === "feed"
                      ? !newFeedTime
                      : !newUVStartTime || !newUVEndTime
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Jadwal
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {scheduleType === "feed" ? (
                    <Fish className="h-5 w-5 text-primary" />
                  ) : (
                    <Zap className="h-5 w-5 text-accent" />
                  )}
                  Jadwal {selectedDay && convertDayToIndonesian(selectedDay)}
                </DialogTitle>
                <DialogDescription>
                  Kelola jadwal untuk hari ini
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
                {scheduleType === "feed"
                  ? selectedDay &&
                    getFeedSchedulesForDay(selectedDay).map((schedule) => (
                      <div key={schedule.id}>
                        {editingId === schedule.id ? (
                          // Edit mode
                          <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-time-${schedule.id}`}>
                                Waktu
                              </Label>
                              <Input
                                id={`edit-time-${schedule.id}`}
                                type="time"
                                value={editFeedTime}
                                onChange={(e) =>
                                  setEditFeedTime(e.target.value)
                                }
                                className="text-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-amount-${schedule.id}`}>
                                Berat Pakan (gram)
                              </Label>
                              <Select
                                value={editFeedAmount.toString()}
                                onValueChange={(value) =>
                                  setEditFeedAmount(parseInt(value))
                                }
                              >
                                <SelectTrigger
                                  id={`edit-amount-${schedule.id}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FEED_AMOUNT_OPTIONS.map((amount) => (
                                    <SelectItem
                                      key={amount}
                                      value={amount.toString()}
                                    >
                                      {amount} gram
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveEditFeedSchedule(schedule)
                                }
                                disabled={!editFeedTime}
                                className="flex-1"
                              >
                                Simpan
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEditFeed}
                                className="flex-1"
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border transition-all",
                              schedule.is_active
                                ? "bg-primary/5 border-primary/20"
                                : "bg-muted/30 border-border/50"
                            )}
                          >
                            <Switch
                              checked={schedule.is_active}
                              onCheckedChange={(checked) =>
                                handleToggleFeedSchedule(schedule, checked)
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {schedule.time}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {schedule.amount_gram}g
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditFeedSchedule(schedule)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                deleteFeedSchedule.mutate(schedule.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  : selectedDay &&
                    getUVSchedulesForDay(selectedDay).map((schedule) => (
                      <div key={schedule.id}>
                        {editingId === schedule.id ? (
                          // Edit mode
                          <div className="p-4 rounded-lg border-2 border-accent bg-accent/5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-start-${schedule.id}`}>
                                  Waktu Mulai
                                </Label>
                                <Input
                                  id={`edit-start-${schedule.id}`}
                                  type="time"
                                  value={editUVStartTime}
                                  onChange={(e) =>
                                    setEditUVStartTime(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-end-${schedule.id}`}>
                                  Waktu Selesai
                                </Label>
                                <Input
                                  id={`edit-end-${schedule.id}`}
                                  type="time"
                                  value={editUVEndTime}
                                  onChange={(e) =>
                                    setEditUVEndTime(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveEditUVSchedule(schedule)
                                }
                                disabled={!editUVStartTime || !editUVEndTime}
                                className="flex-1"
                              >
                                Simpan
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEditUV}
                                className="flex-1"
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border transition-all",
                              schedule.is_active
                                ? "bg-accent/5 border-accent/20"
                                : "bg-muted/30 border-border/50"
                            )}
                          >
                            <Switch
                              checked={schedule.is_active}
                              onCheckedChange={(checked) =>
                                handleToggleUVSchedule(schedule, checked)
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {schedule.start_time}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">
                                  {schedule.end_time}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUVSchedule(schedule)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                deleteUVSchedule.mutate(schedule.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                {/* Add new schedule form in detail modal */}
                {showAddForm ? (
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 space-y-3",
                      scheduleType === "feed"
                        ? "border-primary/50 bg-primary/5"
                        : "border-accent/50 bg-accent/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        Tambah Jadwal Baru
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewFeedTime("");
                          setNewUVStartTime("");
                          setNewUVEndTime("");
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                    {scheduleType === "feed" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="new-feed-time">
                            Waktu Pemberian Pakan
                          </Label>
                          <Input
                            id="new-feed-time"
                            type="time"
                            value={newFeedTime}
                            onChange={(e) => setNewFeedTime(e.target.value)}
                            className="text-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-feed-amount">
                            Berat Pakan (gram)
                          </Label>
                          <Select
                            value={newFeedAmount.toString()}
                            onValueChange={(value) =>
                              setNewFeedAmount(parseInt(value))
                            }
                          >
                            <SelectTrigger id="new-feed-amount">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FEED_AMOUNT_OPTIONS.map((amount) => (
                                <SelectItem
                                  key={amount}
                                  value={amount.toString()}
                                >
                                  {amount} gram
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleCreateFeedSchedule}
                          disabled={!newFeedTime}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Jadwal
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="new-uv-start">Waktu Mulai</Label>
                            <Input
                              id="new-uv-start"
                              type="time"
                              value={newUVStartTime}
                              onChange={(e) =>
                                setNewUVStartTime(e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-uv-end">Waktu Selesai</Label>
                            <Input
                              id="new-uv-end"
                              type="time"
                              value={newUVEndTime}
                              onChange={(e) => setNewUVEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleCreateUVSchedule}
                          disabled={!newUVStartTime || !newUVEndTime}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Jadwal
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-2 border-dashed"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Jadwal Baru
                  </Button>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
