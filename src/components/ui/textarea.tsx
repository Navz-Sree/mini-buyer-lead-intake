import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-gray-400",
        destructive: "border-red-300 focus-visible:ring-red-600 focus-visible:border-red-600",
        success: "border-green-300 focus-visible:ring-green-600 focus-visible:border-green-600",
      },
      size: {
        sm: "min-h-[60px] px-2 text-xs",
        md: "min-h-[80px] px-3 text-sm",
        lg: "min-h-[100px] px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }