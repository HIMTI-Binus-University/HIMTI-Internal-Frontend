import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText } from "fabric";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import type { TextSettings } from "../types";

const CertificatePreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { state } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentIndex] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#f3f4f6",
      selection: false,
    });

    fabricRef.current = canvas;

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const aspectRatio = template.height / template.width;
      const newWidth = Math.min(containerWidth, template.width);
      const newHeight = newWidth * aspectRatio;

      setCanvasSize({ width: newWidth, height: newHeight });
      canvas.setDimensions({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    FabricImage.fromURL(template.url, {}, {
      crossOrigin: "anonymous",
    }).then((img) => {
      if (!img || !fabricRef.current) return;

      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: canvasSize.width / template.width,
        scaleY: canvasSize.height / template.height,
      });

      canvas.add(img);
      canvas.sendObjectToBack(img);
      renderText(canvas, textSettings, currentIndex);
    });

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [template]);

  useEffect(() => {
    if (fabricRef.current) {
      renderText(fabricRef.current, textSettings, currentIndex);
    }
  }, [textSettings, names, canvasSize, currentIndex]);

  const renderText = (canvas: Canvas, settings: TextSettings, index: number) => {
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type === "text") {
        canvas.remove(obj);
      }
    });

    if (!template || names.length === 0) return;

    let displayName = names[index]?.name || names[0].name;
    if (settings.uppercase) {
      displayName = displayName.toUpperCase();
    }

    const textX = (settings.x / 100) * canvasSize.width;
    const textY = (settings.y / 100) * canvasSize.height;

    const scaleFactor = canvasSize.width / template.width;
    const scaledFontSize = settings.fontSize * scaleFactor;

    const text = new FabricText(displayName, {
      left: textX,
      top: textY,
      fontSize: scaledFontSize,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      fill: settings.color,
      textAlign: settings.textAlign as "left" | "center" | "right",
      charSpacing: settings.letterSpacing * 10,
      lineHeight: settings.lineHeight,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    canvas.add(text);
    canvas.renderAll();
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      const newZoom = zoom + 10;
      setZoom(newZoom);
      fabricRef.current?.setZoom(newZoom / 100);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      const newZoom = zoom - 10;
      setZoom(newZoom);
      fabricRef.current?.setZoom(newZoom / 100);
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
    <div ref={containerRef} className="flex h-full flex-col items-center justify-center gap-4">
      <div className="rounded-lg border border-border bg-muted/10 p-2">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 50}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[60px] text-center text-sm font-medium">
          {zoom}%
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CertificatePreview;
