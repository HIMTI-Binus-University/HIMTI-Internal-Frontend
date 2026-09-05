import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText } from "fabric";
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

  const { state, getLongestName } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState("as");

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
      const newWidth = Math.min(containerWidth, template.width);
      const newHeight = newWidth * aspectRatio;

      setCanvasSize({ width: newWidth, height: newHeight });
      canvas.setDimensions({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    FabricImage.fromURL(
      template.url,
      {},
      {
        crossOrigin: "anonymous",
      }
    ).then((img) => {
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
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-blue-900">Preview canvas</h3>
        <Select value={displayMode} onValueChange={(value) => setDisplayMode(value || "as")}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="as">as</SelectItem>
            <SelectItem value="other">other</SelectItem>
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
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="text-muted-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>

        <Button variant="outline" onClick={handleLongestName}>
          Nama terpanjang
        </Button>

        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentIndex === names.length - 1}
          className="text-muted-foreground"
        >
          Berikutnya
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CertificatePreview;
