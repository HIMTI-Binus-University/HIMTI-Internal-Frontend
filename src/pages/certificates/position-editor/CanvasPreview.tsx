import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText, Line, Rect, Text } from "fabric";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import type { TextSettings } from "../types";

const CanvasPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { state, updateTextSettings } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const drawGuidelines = (canvas: Canvas) => {
    // Remove existing guidelines
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (obj.isGuideline) {
        canvas.remove(obj);
      }
    });

    // Margin border (dashed blue)
    const margin = 40;
    const marginRect = new Rect({
      left: margin,
      top: margin,
      width: canvasSize.width - margin * 2,
      height: canvasSize.height - margin * 2,
      fill: "transparent",
      stroke: "#3b82f6",
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    });
    (marginRect as any).isGuideline = true;
    canvas.add(marginRect);

    // Vertical center guideline (orange)
    const verticalLine = new Line(
      [canvasSize.width / 2, 0, canvasSize.width / 2, canvasSize.height],
      {
        stroke: "#f97316",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      }
    );
    (verticalLine as any).isGuideline = true;
    canvas.add(verticalLine);

    // Horizontal center guideline (orange)
    const horizontalLine = new Line(
      [0, canvasSize.height / 2, canvasSize.width, canvasSize.height / 2],
      {
        stroke: "#f97316",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      }
    );
    (horizontalLine as any).isGuideline = true;
    canvas.add(horizontalLine);
  };

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
      drawGuidelines(canvas);
      renderText(canvas, textSettings);
    });

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [template]);

  useEffect(() => {
    if (fabricRef.current) {
      drawGuidelines(fabricRef.current);
      renderText(fabricRef.current, textSettings);
    }
  }, [textSettings, names, canvasSize]);

  const renderText = (canvas: Canvas, settings: TextSettings) => {
    // Remove existing text and bounding box
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (obj.isTextArea) {
        canvas.remove(obj);
      }
    });

    if (!template || names.length === 0) return;

    let displayName = names[0].name;
    if (settings.uppercase) {
      displayName = displayName.toUpperCase();
    }

    const textX = (settings.x / 100) * canvasSize.width;
    const textY = (settings.y / 100) * canvasSize.height;
    const textWidth = (settings.width / 100) * canvasSize.width;

    const scaleFactor = canvasSize.width / template.width;
    const scaledFontSize = settings.fontSize * scaleFactor;

    // Bounding box (blue rectangle)
    const boundingBox = new Rect({
      left: textX - textWidth / 2,
      top: textY - 30,
      width: textWidth,
      height: 60,
      fill: "transparent",
      stroke: "#3b82f6",
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
      hasBorders: false,
      lockRotation: true,
      lockScalingY: true,
      lockScalingFlip: true,
    });
    (boundingBox as any).isTextArea = true;

    // Label "Area nama"
    const label = new Text("Area nama", {
      left: textX - textWidth / 2 + 5,
      top: textY - 50,
      fontSize: 12,
      fill: "#3b82f6",
      fontFamily: "Plus Jakarta Sans",
      selectable: false,
      evented: false,
    });
    (label as any).isTextArea = true;

    // Text object
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
    (text as any).isTextArea = true;

    boundingBox.on("moving", () => {
      if (!boundingBox.left || !boundingBox.top) return;
      const newX = ((boundingBox.left + textWidth / 2) / canvasSize.width) * 100;
      const newY = ((boundingBox.top + 30) / canvasSize.height) * 100;
      updateTextSettings({ x: Math.round(newX), y: Math.round(newY) });
      
      // Update text and label position
      text.set({
        left: boundingBox.left + textWidth / 2,
        top: boundingBox.top + 30,
      });
      label.set({
        left: boundingBox.left + 5,
        top: boundingBox.top - 20,
      });
      canvas.renderAll();
    });

    boundingBox.on("scaling", () => {
      if (!boundingBox.scaleX) return;
      const newWidth = ((textWidth * boundingBox.scaleX) / canvasSize.width) * 100;
      updateTextSettings({ width: Math.round(newWidth) });
      boundingBox.set({ scaleX: 1, width: textWidth * boundingBox.scaleX });
      canvas.renderAll();
    });

    canvas.add(boundingBox);
    canvas.add(label);
    canvas.add(text);
    canvas.renderAll();
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      const newZoom = zoom + 10;
      setZoom(newZoom);
      fabricRef.current?.setZoom(newZoom / 100);
      fabricRef.current?.renderAll();
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      const newZoom = zoom - 10;
      setZoom(newZoom);
      fabricRef.current?.setZoom(newZoom / 100);
      fabricRef.current?.renderAll();
    }
  };

  const handleFit = () => {
    setZoom(100);
    fabricRef.current?.setZoom(1);
    fabricRef.current?.renderAll();
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
    <div ref={containerRef} className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Preview editor</h3>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={handleFit}>
            <Maximize2 className="mr-2 h-4 w-4" />
            Fit
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto rounded-lg border border-border bg-gray-200 p-4">
        <div className="flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          Geser garis biru untuk memindahkan nama. Tarik titik kanan untuk mengubah lebar. 
          Posisi disimpan relatif terhadap ukuran template.
        </p>
      </div>
    </div>
  );
};

export default CanvasPreview;
