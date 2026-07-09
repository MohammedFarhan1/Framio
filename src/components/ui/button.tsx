import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4634F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:  'bg-[#C4634F] text-white hover:bg-[#B05540] shadow-md hover:shadow-lg',
        outline:  'border-2 border-[#C4634F] text-[#C4634F] bg-transparent hover:bg-[#C4634F] hover:text-white',
        ghost:    'text-[#2D1F1A] hover:bg-[#F5EDE5]',
        gold:     'bg-[#C9A84C] text-white hover:bg-[#B8963E] shadow-md hover:shadow-lg',
        subtle:   'bg-[#F5EDE5] text-[#C4634F] hover:bg-[#EDE0D6]',
        danger:   'bg-red-500 text-white hover:bg-red-600 shadow-md',
        link:     'text-[#C4634F] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-9 px-4 text-xs rounded-lg',
        md:   'h-11 px-6',
        lg:   'h-13 px-8 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
