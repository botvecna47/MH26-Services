import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DataCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  footer?: ReactNode;
}

export function DataCard({ icon: Icon, label, value, change, footer }: DataCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`font-medium ${
              change.trend === 'up'
                ? 'text-success'
                : change.trend === 'down'
                ? 'text-error'
                : 'text-muted-foreground'
            }`}
          >
            {change.value}
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
}
