import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, TrendingDown } from "lucide-react";

interface StockCardProps {
  stockGram: number;
  maxCapacity: number;
}

export const StockCard = ({ stockGram, maxCapacity }: StockCardProps) => {
  const percentage = (stockGram / maxCapacity) * 100;
  const isLow = percentage < 20;

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-ocean)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">Status Stok Pakan</h3>
            </div>
            <p className="text-sm text-muted-foreground">Kapasitas wadah pakan</p>
          </div>
          {isLow && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
              <TrendingDown className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning">Stok Rendah</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-card-foreground">{stockGram}</span>
            <span className="text-xl text-muted-foreground">gram</span>
            <span className="text-sm text-muted-foreground ml-auto">dari {maxCapacity}g</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kapasitas</span>
              <span className="font-medium text-card-foreground">{percentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={percentage} 
              className="h-3 bg-secondary"
              indicatorClassName={isLow ? "bg-warning" : "bg-gradient-to-r from-primary to-accent"}
            />
          </div>

          <div className="pt-3 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Estimasi Hari</p>
                <p className="text-lg font-semibold text-card-foreground">
                  {Math.floor(stockGram / 30)} hari
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Per Pemberian</p>
                <p className="text-lg font-semibold text-card-foreground">~10g</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
