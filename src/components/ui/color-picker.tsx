"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Pipette } from "lucide-react"

import { cn } from "@/lib/utils"
import { gsap, useGSAP } from "@/lib/motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#64748B",
]

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  disabled?: boolean
}

const ColorPickerPopover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, ...props }, ref) => {
  const popoverRef = React.useRef<React.ElementRef<typeof PopoverPrimitive.Content>>(null)
  React.useImperativeHandle(ref, () => popoverRef.current as React.ElementRef<typeof PopoverPrimitive.Content>)
  
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(popoverRef.current, {
        autoAlpha: 0,
        y: 6,
        duration: 0.18,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      })
    })
    return () => media.revert()
  }, { scope: popoverRef })

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={popoverRef}
        sideOffset={6}
        className={cn(
          "z-50 w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
ColorPickerPopover.displayName = "ColorPickerPopover"

export const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  ({ value = "#000000", onChange, disabled }, ref) => {
    const [color, setColor] = React.useState(value)
    const [inputValue, setInputValue] = React.useState(value)

    React.useEffect(() => {
      setColor(value)
      setInputValue(value)
    }, [value])

    const handleColorChange = (newColor: string) => {
      setColor(newColor)
      setInputValue(newColor)
      onChange?.(newColor)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInputValue(val)
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        setColor(val)
        onChange?.(val)
      }
    }

    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm transition-colors duration-150 hover:bg-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
            )}
          >
            <div
              className="h-5 w-5 shrink-0 rounded border border-border"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 truncate text-left text-foreground">
              {color.toUpperCase()}
            </span>
            <Pipette className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverPrimitive.Trigger>
        <ColorPickerPopover align="start">
          <div className="space-y-3">
            <div>
              <Label htmlFor="color-input" className="text-xs text-muted-foreground">
                Hex Color
              </Label>
              <Input
                id="color-input"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                maxLength={7}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preset Colors</Label>
              <div className="mt-1.5 grid grid-cols-10 gap-1.5">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => handleColorChange(presetColor)}
                    className={cn(
                      "h-6 w-6 rounded border-2 transition-all hover:scale-110",
                      color.toUpperCase() === presetColor.toUpperCase()
                        ? "border-primary ring-2 ring-ring/20"
                        : "border-border"
                    )}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>
          </div>
        </ColorPickerPopover>
      </PopoverPrimitive.Root>
    )
  }
)
ColorPicker.displayName = "ColorPicker"
