import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Textbox } from "fabric";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCertificateStore } from "../store";
import type { TextSettings } from "../types";

const CertificatePreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textboxRef = useRef<Textbox | null>(null);
  const backgroundImageRef = useRef<FabricImage | null>(null);

  const { state, getLongestName } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      selection: false,
    });

    fabricRef.current = canvas;

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const aspectRatio = template.height / template.width;
      const newWidth = Math.max(1, Math.min(containerWidth, template.width));
      const newHeight = newWidth * aspectRatio;

      setCanvasSize((prev) =>
        prev.width === newWidth && prev.height === newHeight
          ? prev
          : { width: newWidth, height: newHeight },
      );
      canvas.setDimensions({ width: newWidth, height: newHeight });

      // Keep the template image aligned with the canvas on every resize.
      const backgroundImage = backgroundImageRef.current;
      if (backgroundImage) {
        backgroundImage.set({
          left: 0,
          top: 0,
          scaleX: newWidth / template.width,
          scaleY: newHeight / template.height,
        });
        canvas.requestRenderAll();
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // ResizeObserver also catches layout changes that do not fire a window
    // resize event (e.g. browser zoom, sidebar or panel size changes).
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(updateCanvasSize)
        : null;
    resizeObserver?.observe(containerRef.current!);

    FabricImage.fromURL(
      template.url,
      {},
      {
        crossOrigin: "anonymous",
      }
    ).then((img) => {
      if (!img || !fabricRef.current) return;

      const actualWidth = canvas.getWidth();
      const actualHeight = canvas.getHeight();

      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: actualWidth / template.width,
        scaleY: actualHeight / template.height,
      });

      backgroundImageRef.current = img;

      canvas.add(img);
      canvas.sendObjectToBack(img);
      renderText(canvas, textSettings, { width: actualWidth, height: actualHeight });
    });

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      resizeObserver?.disconnect();
      canvas.dispose();
      fabricRef.current = null;
      textboxRef.current = null;
      backgroundImageRef.current = null;
    };
  }, [template]);

  // Update textbox when settings change (but keep position)
  useEffect(() => {
    if (!textboxRef.current || !fabricRef.current || !template) return;

    const textbox = textboxRef.current;
    const settings = textSettings;

    let displayName = names[currentIndex]?.name || names[0].name;
    if (settings.uppercase) {
      displayName = displayName.toUpperCase();
    }

    const scaleFactor = canvasSize.width / template.width;
    const scaledFontSize = settings.fontSize * scaleFactor;
    const textWidth = Math.max(40, (settings.width / 100) * canvasSize.width);

    textbox.set({
      // Position is stored in template percent, so it must follow the
      // canvas size exactly like the initial render does.
      left: (settings.x / 100) * canvasSize.width,
      top: (settings.y / 100) * canvasSize.height,
      originX: "center",
      originY: "center",
      text: displayName,
      width: textWidth,
      fontSize: scaledFontSize,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      fill: settings.color,
      textAlign: settings.textAlign as "left" | "center" | "right",
      charSpacing: settings.letterSpacing * 10,
      lineHeight: settings.lineHeight,
      angle: settings.rotation,
      opacity: settings.opacity / 100,
    });

    if (settings.shadow.enabled) {
      textbox.set({
        shadow: {
          color: settings.shadow.color,
          blur: settings.shadow.blur,
          offsetX: settings.shadow.offsetX,
          offsetY: settings.shadow.offsetY,
        } as any,
      });
    } else {
      textbox.set({ shadow: null });
    }

    if (settings.stroke.enabled) {
      textbox.set({
        stroke: settings.stroke.color,
        strokeWidth: settings.stroke.width,
        paintFirst: "stroke",
      });
    } else {
      textbox.set({
        stroke: undefined,
        strokeWidth: 0,
      });
    }

    textbox.initDimensions();
    textbox.setCoords();
    fabricRef.current.requestRenderAll();
  }, [textSettings, names, canvasSize, currentIndex, template]);

  const renderText = (canvas: Canvas, settings: TextSettings, size: { width: number; height: number }) => {
    if (!template || names.length === 0) return;

    let displayName = names[currentIndex]?.name || names[0].name;
    if (settings.uppercase) {
      displayName = displayName.toUpperCase();
    }

    const centerX = (settings.x / 100) * size.width;
    const centerY = (settings.y / 100) * size.height;

    const scaleFactor = size.width / template.width;
    const scaledFontSize = settings.fontSize * scaleFactor;
    const textWidth = Math.max(40, (settings.width / 100) * size.width);

    const textbox = new Textbox(displayName, {
      left: centerX,
      top: centerY,
      originX: "center",
      originY: "center",
      width: textWidth,
      fontSize: scaledFontSize,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      fill: settings.color,
      textAlign: settings.textAlign as "left" | "center" | "right",
      charSpacing: settings.letterSpacing * 10,
      lineHeight: settings.lineHeight,
      angle: settings.rotation,
      opacity: settings.opacity / 100,
      selectable: false,
      evented: false,
      editable: false,
      splitByGrapheme: false,
    });

    if (settings.shadow.enabled) {
      textbox.set({
        shadow: {
          color: settings.shadow.color,
          blur: settings.shadow.blur,
          offsetX: settings.shadow.offsetX,
          offsetY: settings.shadow.offsetY,
        } as any,
      });
    }

    if (settings.stroke.enabled) {
      textbox.set({
        stroke: settings.stroke.color,
        strokeWidth: settings.stroke.width,
        paintFirst: "stroke",
      });
    }

    textbox.initDimensions();
    textbox.setCoords();

    textboxRef.current = textbox;
    canvas.add(textbox);
    canvas.renderAll();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < names.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLongestName = () => {
    const longest = getLongestName();
    if (longest) {
      const index = names.findIndex((n) => n.id === longest.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  };

  if (!template) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
        <p className="text-sm text-muted-foreground">
          No template loaded. Please go back to Step 1.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-blue-900">Preview canvas</h3>
        <Select 
          value={currentIndex.toString()} 
          onValueChange={(value) => setCurrentIndex(parseInt(value || "0"))}
        >
          <SelectTrigger className="w-full min-w-0 sm:w-[250px] sm:min-w-[250px]">
            <SelectValue>
              {names[currentIndex]?.name || "Select name"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {names.map((name, index) => (
              <SelectItem key={name.id} value={index.toString()}>
                {name.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Canvas Area */}
      <div className="flex flex-1 items-center justify-center overflow-auto">
        <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="text-muted-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button variant="outline" onClick={handleLongestName}>
          Longest name
        </Button>

        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentIndex === names.length - 1}
          className="text-muted-foreground"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CertificatePreview;
