import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface UVStatusCardProps {
  isActive: boolean;
  remainingMinutes?: number;
  mode: "SCHEDULE" | "MANUAL" | "OFF";
  nextSchedule?: string;
}

export const UVStatusCard = ({ 
  isActive, 
  remainingMinutes, 
  mode,
  nextSchedule 
}: UVStatusCardProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}j ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-ocean)]">
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500",
        isActive 
          ? "bg-gradient-to-br from-accent/10 to-primary/10 opacity-100" 
          : "bg-gradient-to-br from-muted/30 to-secondary/30 opacity-50"
      )} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className={cn(
                "h-5 w-5 transition-colors duration-300",
                isActive ? "text-accent" : "text-muted-foreground"
              )} />
              <h3 className="text-lg font-semibold text-card-foreground">UV Sterilizer</h3>
            </div>
            <p className="text-sm text-muted-foreground">Sistem pembersihan air</p>
          </div>
          
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={cn(
              "transition-all duration-300",
              isActive && "bg-gradient-to-r from-accent to-primary border-0 animate-pulse"
            )}
          >
            {isActive ? "AKTIF" : "MATI"}
          </Badge>
        </div>

        <div className="space-y-4">
          {isActive && remainingMinutes !== undefined && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <Clock className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Sisa Waktu</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {formatTime(remainingMinutes)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Mode Operasi</p>
              <p className="text-sm font-semibold text-card-foreground">
                {mode === "MANUAL" ? "Manual Override" : mode === "SCHEDULE" ? "Terjadwal" : "Standby"}
              </p>
            </div>
            
            {!isActive && nextSchedule && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Jadwal Berikut
                </p>
                <p className="text-sm font-semibold text-card-foreground">{nextSchedule}</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <p>💡 UV sterilizer membantu mengurangi alga dan bakteri berbahaya dalam air akuarium</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
