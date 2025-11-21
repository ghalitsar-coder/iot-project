import { useState, useEffect } from "react";
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
import { Fish, AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FeedControlProps {
  lastFeedTime?: string;
  stockGram?: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const FeedControl = ({
  lastFeedTime,
  stockGram = 0,
  onConfirm,
  isLoading = false,
}: FeedControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Load default amount from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("defaultFeedAmount");
    if (saved) {
      const amount = parseInt(saved);
      setDefaultAmount(amount);
      setCustomAmount(saved);
    } else {
      setCustomAmount("10");
    }
  }, []);

  const isEmpty = stockGram === 0;
  const isLowStock = stockGram > 0 && stockGram <= defaultAmount * 2;
  const feedAmount = parseInt(customAmount) || defaultAmount;
  const isInsufficientStock = stockGram < feedAmount;

  const handleFeed = () => {
    if (isEmpty || isInsufficientStock) {
      return; // Prevent feeding when stock is empty or insufficient
    }
    onConfirm();
    setIsOpen(false);
  };

  const handleOpenDialog = () => {
    // Reset to default when opening
    const saved = localStorage.getItem("defaultFeedAmount");
    setCustomAmount(saved || "10");
    setIsOpen(true);
  };

  const formatLastFeed = (timestamp?: string) => {
    if (!timestamp) return "Belum pernah";
    const date = new Date(timestamp);
    return date.toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-ocean)] transition-all duration-300"
        disabled={isEmpty}
        title={isEmpty ? "Stok pakan habis" : "Beri pakan sekarang"}
      >
        <Fish className="mr-2 h-5 w-5" />
        {isEmpty ? "Stok Pakan Habis" : "Beri Pakan Sekarang"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-primary" />
              Konfirmasi Pemberian Pakan
            </DialogTitle>
            <DialogDescription>
              Pastikan untuk tidak memberi pakan terlalu sering
            </DialogDescription>
          </DialogHeader>

          {isLowStock && (
            <Alert className="bg-orange-500/10 border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription>
                <p className="text-sm font-medium text-orange-600 mb-1">
                  Peringatan Stok Rendah
                </p>
                <p className="text-xs text-orange-600/80">
                  Stok pakan tersisa {stockGram}g. Segera isi ulang untuk
                  mencegah pemberhentian otomatis.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {isInsufficientStock && (
            <Alert className="bg-destructive/10 border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription>
                <p className="text-sm font-medium text-destructive mb-1">
                  Stok Tidak Cukup!
                </p>
                <p className="text-xs text-destructive/80">
                  Jumlah pakan yang diminta ({feedAmount}g) melebihi stok
                  tersisa ({stockGram}g).
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-muted/50 border-border/50">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription>
              <p className="text-sm font-medium mb-1">
                Pemberian Pakan Terakhir:
              </p>
              <p className="text-sm text-card-foreground">
                {formatLastFeed(lastFeedTime)}
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="feed-amount">Jumlah Pakan (gram)</Label>
              <Input
                id="feed-amount"
                type="number"
                min="1"
                max={stockGram}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Masukkan jumlah pakan"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaultAmount}g | Max: {stockGram}g
              </p>
            </div>

            <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jumlah Pakan:</span>
                <span className="font-semibold text-card-foreground">
                  {feedAmount}g
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stok Tersisa:</span>
                <span className="font-semibold text-card-foreground">
                  {stockGram}g
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stok Setelah:</span>
                <span
                  className={cn(
                    "font-semibold",
                    stockGram - feedAmount < defaultAmount * 2
                      ? "text-orange-500"
                      : "text-card-foreground"
                  )}
                >
                  {stockGram - feedAmount}g
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metode:</span>
                <span className="font-semibold text-card-foreground">
                  Double Gate System
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleFeed}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              disabled={
                isEmpty || isInsufficientStock || !customAmount || isLoading
              }
            >
              {isLoading ? "Memberi Pakan..." : "Ya, Beri Pakan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
