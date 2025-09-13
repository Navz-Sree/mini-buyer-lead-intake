import * as React from "react"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border-2 bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer transition-colors",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-blue-400 checked:bg-blue-600 checked:border-blue-600 checked:text-white",
        secondary: "border-gray-300 hover:border-gray-400 checked:bg-gray-600 checked:border-gray-600 checked:text-white",
        tertiary: "border-gray-300 hover:border-gray-400 checked:bg-gray-100 checked:border-gray-400 checked:text-gray-900",
        destructive: "border-gray-300 hover:border-red-400 checked:bg-red-600 checked:border-red-600 checked:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CheckboxProps 
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof checkboxVariants> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const getIconColor = () => {
      switch (variant) {
        case 'secondary':
          return 'text-white';
        case 'tertiary':
          return 'text-gray-900';
        case 'destructive':
          return 'text-white';
        default:
          return 'text-white';
      }
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(checkboxVariants({ variant }), className)}
          onChange={handleChange}
          {...props}
        />
        <Check className={cn(
          "absolute h-3 w-3 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity",
          getIconColor()
        )} />
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
