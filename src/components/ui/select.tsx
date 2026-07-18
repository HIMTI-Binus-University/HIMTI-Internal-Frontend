import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 data-[placeholder]:text-muted-foreground",
      className,
    )}
    {...props}
  >
    <span className="min-w-0 flex-1 truncate">{children}</span>
    <SelectPrimitive.Icon>
      <ChevronDown className="h-4 w-4 shrink-0 stroke-[1.75] text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup> & {
    align?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Positioner>["align"]
    sideOffset?: number
  }
>(({ className, children, align = "start", sideOffset = 6, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      align={align}
      alignItemWithTrigger={false}
      sideOffset={sideOffset}
      className="z-50 outline-none"
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          "max-h-[min(20rem,var(--available-height))] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.List>{children}</SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex min-h-9 cursor-default select-none items-center rounded-md py-2 pl-9 pr-3 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="absolute left-3 flex h-4 w-4 items-center justify-center text-primary">
      <Check className="h-4 w-4 stroke-[2.25]" />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
