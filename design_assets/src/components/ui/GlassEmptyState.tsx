import { ReactNode } from 'react';

interface GlassEmptyStateProps {
  icon: ReactNode;
  message: string;
  action?: ReactNode;
}

export function GlassEmptyState({
  icon,
  message,
  action,
}: GlassEmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-[#ff6b35]">
          {icon}
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}