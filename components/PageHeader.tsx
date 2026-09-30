import { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-4'>
        {Icon && (
          <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Icon className='size-6' />
          </div>
        )}
        <div>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{title}</h1>
          {description && (
            <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
      </div>
      {actions && <div className='flex shrink-0 gap-2'>{actions}</div>}
    </div>
  );
}
