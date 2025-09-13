import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={`
      z-50 bg-white text-black text-sm border border-gray-200 rounded-md px-3 py-2 shadow-md relative
      data-[side=top]:after:content-[''] data-[side=top]:after:absolute data-[side=top]:after:top-full
      data-[side=top]:after:left-1/2 data-[side=top]:after:-translate-x-1/2 data-[side=top]:after:border-4
      data-[side=top]:after:border-transparent data-[side=top]:after:border-t-white

      data-[side=bottom]:after:content-[''] data-[side=bottom]:after:absolute data-[side=bottom]:after:bottom-full
      data-[side=bottom]:after:left-1/2 data-[side=bottom]:after:-translate-x-1/2 data-[side=bottom]:after:border-4
      data-[side=bottom]:after:border-transparent data-[side=bottom]:after:border-b-white

      data-[side=left]:after:content-[''] data-[side=left]:after:absolute data-[side=left]:after:left-full
      data-[side=left]:after:top-1/2 data-[side=left]:after:-translate-y-1/2 data-[side=left]:after:border-4
      data-[side=left]:after:border-transparent data-[side=left]:after:border-l-white

      data-[side=right]:after:content-[''] data-[side=right]:after:absolute data-[side=right]:after:right-full
      data-[side=right]:after:top-1/2 data-[side=right]:after:-translate-y-1/2 data-[side=right]:after:border-4
      data-[side=right]:after:border-transparent data-[side=right]:after:border-r-white

      ${className ?? ''}
    `}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
