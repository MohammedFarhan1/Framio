import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'green' | 'red' | 'subtle';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#C4634F] text-white',
    gold:    'bg-[#C9A84C] text-white',
    green:   'bg-emerald-500 text-white',
    red:     'bg-red-500 text-white',
    subtle:  'bg-[#F5EDE5] text-[#C4634F]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
