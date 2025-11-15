import { ReactNode } from 'react';

interface ContentCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ContentCard({ title, description, children, footer, className = '' }: ContentCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border">
          {title && <h3 className="mb-1">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-muted">
          {footer}
        </div>
      )}
    </div>
  );
}
