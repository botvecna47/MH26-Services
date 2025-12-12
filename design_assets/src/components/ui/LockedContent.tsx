import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Button } from './button';

interface LockedContentProps {
  children: ReactNode;
  isLocked: boolean;
  message?: string;
  onUnlock?: () => void;
  variant?: 'blur' | 'overlay' | 'dim';
}

export function LockedContent({
  children,
  isLocked,
  message = 'Available after joining',
  onUnlock,
  variant = 'blur',
}: LockedContentProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className={variant === 'blur' ? 'content-locked' : variant === 'dim' ? 'content-dimmed' : ''}>
        {children}
      </div>
      
      {variant === 'overlay' && (
        <div className="absolute inset-0 bg-locked-overlay backdrop-blur-sm flex items-center justify-center">
          <div className="text-center bg-card border border-border rounded-xl p-8 shadow-lg max-w-sm">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">{message}</p>
            {onUnlock && (
              <Button onClick={onUnlock} className="w-full">
                Sign In to Access
              </Button>
            )}
          </div>
        </div>
      )}
      
      {(variant === 'blur' || variant === 'dim') && onUnlock && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button onClick={onUnlock} size="sm" className="shadow-lg">
            {message}
          </Button>
        </div>
      )}
    </div>
  );
}
