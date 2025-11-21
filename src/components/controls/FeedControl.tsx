import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fish, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeedControlProps {
  lastFeedTime?: string;
  onConfirm: () => void;
}

export const FeedControl = ({ lastFeedTime, onConfirm }: FeedControlProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFeed = () => {
    onConfirm();
    setIsOpen(false);
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
        onClick={() => setIsOpen(true)}
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-ocean)] transition-all duration-300"
      >
        <Fish className="mr-2 h-5 w-5" />
        Beri Pakan Sekarang
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

          <Alert className="bg-muted/50 border-border/50">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription>
              <p className="text-sm font-medium mb-1">Pemberian Pakan Terakhir:</p>
              <p className="text-sm text-card-foreground">{formatLastFeed(lastFeedTime)}</p>
            </AlertDescription>
          </Alert>

          <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jumlah Pakan:</span>
              <span className="font-semibold text-card-foreground">~10 gram</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Metode:</span>
              <span className="font-semibold text-card-foreground">Double Gate System</span>
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
            >
              Ya, Beri Pakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
