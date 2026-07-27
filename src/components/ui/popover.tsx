import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { gsap, useGSAP } from "@/lib/motion"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const contentRef = React.useRef<React.ElementRef<typeof PopoverPrimitive.Content>>(null)
  React.useImperativeHandle(ref, () => contentRef.current as React.ElementRef<typeof PopoverPrimitive.Content>)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(contentRef.current, {
        autoAlpha: 0,
        y: 6,
        duration: 0.18,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      })
    })
    return () => media.revert()
  }, { scope: contentRef })

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={contentRef}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-[--radix-popover-content-transform-origin] rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
