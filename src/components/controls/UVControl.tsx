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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Clock } from "lucide-react";

interface UVControlProps {
  isActive: boolean;
  onActivate: (durationMinutes: number) => void;
  onDeactivate: () => void;
}

export const UVControl = ({ isActive, onActivate, onDeactivate }: UVControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState("60");

  const handleActivate = () => {
    const minutes = parseInt(duration) || 60;
    onActivate(minutes);
    setIsOpen(false);
  };

  return (
    <>
      {!isActive ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          variant="outline"
          className="w-full border-2 border-accent/50 hover:bg-accent/5 hover:border-accent transition-all duration-300"
        >
          <Zap className="mr-2 h-5 w-5" />
          Aktifkan UV Manual
        </Button>
      ) : (
        <Button
          onClick={onDeactivate}
          size="lg"
          variant="destructive"
          className="w-full"
        >
          <Zap className="mr-2 h-5 w-5" />
          Matikan UV
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Aktifkan UV Sterilizer
            </DialogTitle>
            <DialogDescription>
              Atur durasi manual untuk menjalankan UV sterilizer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Durasi (Menit)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Maksimal 8 jam (480 menit)
              </p>
            </div>

            <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Mode Manual Override:</strong> Jadwal otomatis akan di-pause selama mode manual aktif
              </p>
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
              onClick={handleActivate}
              className="flex-1 bg-gradient-to-r from-accent to-primary"
            >
              Aktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
