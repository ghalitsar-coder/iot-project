"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, TrendingDown, Edit, Settings } from "lucide-react";
import { useUpdateStock } from "@/hooks/use-api";
import { toast } from "sonner";

interface StockCardProps {
  stockGram: number;
  maxCapacity?: number; // Optional, will use setting from localStorage
}

export const StockCard = ({
  stockGram,
  maxCapacity: propMaxCapacity,
}: StockCardProps) => {
  const updateStock = useUpdateStock();

  // Modal states
  const [showEditStock, setShowEditStock] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newStockAmount, setNewStockAmount] = useState<string>("");

  // Settings (stored in localStorage)
  const [maxCapacity, setMaxCapacity] = useState<number>(1000);
  const [tempMaxCapacity, setTempMaxCapacity] = useState<string>("1000");
  const [defaultAmount, setDefaultAmount] = useState<number>(10);
  const [tempDefaultAmount, setTempDefaultAmount] = useState<string>("10");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAmount = localStorage.getItem("defaultFeedAmount");
    if (savedAmount) {
      const amount = parseInt(savedAmount);
      setDefaultAmount(amount);
      setTempDefaultAmount(savedAmount);
    }

    const savedMaxCapacity = localStorage.getItem("maxFeedCapacity");
    if (savedMaxCapacity) {
      const capacity = parseInt(savedMaxCapacity);
      setMaxCapacity(capacity);
      setTempMaxCapacity(savedMaxCapacity);
    } else if (propMaxCapacity) {
      setMaxCapacity(propMaxCapacity);
      setTempMaxCapacity(propMaxCapacity.toString());
    }
  }, [propMaxCapacity]);

  const percentage = (stockGram / maxCapacity) * 100;
  const isLow = percentage < 20;
  const isCritical = stockGram <= defaultAmount * 2; // 2 kali pemberian atau kurang
  const isEmpty = stockGram === 0;

  const handleEditStock = () => {
    setNewStockAmount(stockGram.toString());
    setShowEditStock(true);
  };

  const handleSaveStock = () => {
    const amount = parseInt(newStockAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Jumlah stok tidak valid");
      return;
    }

    updateStock.mutate(amount, {
      onSuccess: () => {
        setShowEditStock(false);
        toast.success("Stok berhasil diperbarui!");
      },
    });
  };

  const handleSaveSettings = () => {
    const amount = parseInt(tempDefaultAmount);
    const capacity = parseInt(tempMaxCapacity);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Jumlah pakan tidak valid");
      return;
    }

    if (isNaN(capacity) || capacity <= 0) {
      toast.error("Kapasitas maksimal tidak valid");
      return;
    }

    setDefaultAmount(amount);
    setMaxCapacity(capacity);
    localStorage.setItem("defaultFeedAmount", amount.toString());
    localStorage.setItem("maxFeedCapacity", capacity.toString());
    setShowSettings(false);
    toast.success(`Pengaturan berhasil disimpan!`);
  };

  const estimatedDays = Math.floor(stockGram / (defaultAmount * 3)); // Assuming 3 feedings per day

  return (
    <>
      <Card className="relative overflow-hidden border-border/50 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-ocean)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Status Stok Pakan
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Kapasitas wadah pakan
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEmpty && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-medium text-destructive">
                    Stok Habis!
                  </span>
                </div>
              )}
              {!isEmpty && isCritical && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-orange-500">
                    Stok Kritis
                  </span>
                </div>
              )}
              {!isEmpty && !isCritical && isLow && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
                  <TrendingDown className="h-4 w-4 text-warning" />
                  <span className="text-xs font-medium text-warning">
                    Stok Rendah
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditStock}
                className="h-8 w-8"
                title="Edit Stok"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTempDefaultAmount(defaultAmount.toString());
                  setTempMaxCapacity(maxCapacity.toString());
                  setShowSettings(true);
                }}
                className="h-8 w-8"
                title="Pengaturan"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-card-foreground">
                {stockGram}
              </span>
              <span className="text-xl text-muted-foreground">gram</span>
              <span className="text-sm text-muted-foreground ml-auto">
                dari {maxCapacity}g
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kapasitas</span>
                <span className="font-medium text-card-foreground">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-3 bg-secondary"
                indicatorClassName={
                  isLow
                    ? "bg-warning"
                    : "bg-gradient-to-r from-primary to-accent"
                }
              />
            </div>

            <div className="pt-3 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Estimasi Hari</p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {estimatedDays} hari
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Per Pemberian</p>
                  <p className="text-lg font-semibold text-card-foreground">
                    ~{defaultAmount}g
                  </p>
                </div>
              </div>

              {/* Warning messages */}
              {isEmpty && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive mb-1">
                    ⚠️ Stok Pakan Habis!
                  </p>
                  <p className="text-xs text-destructive/80">
                    Semua jadwal pemberian pakan telah dinonaktifkan secara
                    otomatis. Silakan isi ulang stok pakan.
                  </p>
                </div>
              )}
              {!isEmpty && isCritical && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-sm font-medium text-orange-600 mb-1">
                    ⚠️ Stok Pakan Kritis!
                  </p>
                  <p className="text-xs text-orange-600/80">
                    Stok hanya cukup untuk{" "}
                    {Math.floor(stockGram / defaultAmount)} kali pemberian.
                    Segera isi ulang untuk mencegah pemberhentian otomatis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Stock Modal */}
      <Dialog open={showEditStock} onOpenChange={setShowEditStock}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Stok Pakan
            </DialogTitle>
            <DialogDescription>
              Perbarui jumlah stok pakan yang tersedia di wadah
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-amount">Jumlah Stok (gram)</Label>
              <Input
                id="stock-amount"
                type="number"
                min="0"
                max={maxCapacity}
                value={newStockAmount}
                onChange={(e) => setNewStockAmount(e.target.value)}
                placeholder="Masukkan jumlah stok"
                className="text-lg"
              />
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Kapasitas maksimal:</strong> {maxCapacity}g
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStock(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveStock}
              disabled={!newStockAmount || updateStock.isPending}
            >
              {updateStock.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Pengaturan Pemberian Pakan
            </DialogTitle>
            <DialogDescription>
              Atur kapasitas wadah dan jumlah default pakan per jadwal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="max-capacity">
                Kapasitas Maksimal Wadah (gram)
              </Label>
              <Input
                id="max-capacity"
                type="number"
                min="100"
                max="10000"
                value={tempMaxCapacity}
                onChange={(e) => setTempMaxCapacity(e.target.value)}
                placeholder="Masukkan kapasitas wadah"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Kapasitas maksimal wadah pakan Anda (contoh: 1000g = 1kg)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-amount">Berat Pakan Default (gram)</Label>
              <Input
                id="default-amount"
                type="number"
                min="1"
                max="100"
                value={tempDefaultAmount}
                onChange={(e) => setTempDefaultAmount(e.target.value)}
                placeholder="Masukkan berat default"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Jumlah pakan yang diberikan per jadwal (disarankan: 5-15g)
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
              <p className="text-muted-foreground">
                <strong>ℹ️ Informasi Penting:</strong>
              </p>
              <ul className="text-muted-foreground space-y-1 ml-4">
                <li>
                  • Kapasitas wadah digunakan untuk perhitungan persentase stok
                </li>
                <li>• Berat default akan digunakan saat membuat jadwal baru</li>
                <li>
                  • Sistem akan memberi peringatan jika stok ≤ 2x berat default
                </li>
                <li>• Jadwal akan dinonaktifkan otomatis jika stok = 0</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={!tempDefaultAmount || !tempMaxCapacity}
            >
              Simpan Pengaturan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
