import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface GlassEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function GlassEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: GlassEmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
          <Icon className="h-8 w-8 text-[#ff6b35]" />
        </div>
        <h3 className="text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-[#ff6b35] hover:bg-[#ff5722] shadow-lg"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
