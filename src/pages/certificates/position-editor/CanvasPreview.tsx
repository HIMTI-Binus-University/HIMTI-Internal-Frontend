import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Line, Rect, Textbox, Text } from "fabric";
import { Minus, Plus, Maximize2 } from "lucide-react";
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

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
const roundPosition = (value: number) => Number(value.toFixed(2));

const MIN_TEXT_WIDTH = 40;

const CanvasPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The Textbox itself is the editable text area.
  const textRef = useRef<Textbox | null>(null);
  const labelRef = useRef<Text | null>(null);

  const isInitializedRef = useRef(false);
  const isTransformingRef = useRef(false);
  const renderFrameRef = useRef<number | null>(null);

  const { state, updateTextSettings } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [previewNameIndex, setPreviewNameIndex] = useState(0);

  const requestSmoothRender = (canvas: Canvas) => {
    if (renderFrameRef.current !== null) return;

    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null;
      canvas.requestRenderAll();
    });
  };

  const getDisplayName = () => {
    let name = names[previewNameIndex]?.name || names[0]?.name || "";

    if (textSettings.uppercase) {
      name = name.toUpperCase();
    }

    return name;
  };

  const getScaledFontSize = (
    settings: TextSettings,
    width: number
  ) => {
    const scaleFactor = width / template!.width;
    return settings.fontSize * scaleFactor;
  };

  const updateLabelPosition = (textbox: Textbox) => {
    const label = labelRef.current;
    if (!label) return;

    const bounds = textbox.getBoundingRect();

    label.set({
      left: bounds.left + 5,
      top: bounds.top - 20,
    });

    label.setCoords();
  };

  const configureCornerControls = (textbox: Textbox) => {
    textbox.setControlsVisibility({
      mt: false,
      mb: false,
      ml: true,
      mr: true,
      mtr: false,
      tl: true,
      tr: true,
      bl: true,
      br: true,
    });

    textbox.set({
      lockRotation: true,
      lockScalingFlip: true,
      lockSkewingX: false,
      lockSkewingY: true,
      lockUniScaling: false,
      hasBorders: true,
      borderColor: "#3b82f6",
      cornerColor: "#3b82f6",
      cornerSize: 12,
      transparentCorners: false,
    });
  };

  const applyTextSettingsToFabric = (
    textbox: Textbox,
    settings: TextSettings,
    size: { width: number; height: number }
  ) => {
    if (!template) return;

    const centerX = (settings.x / 100) * size.width;
    const centerY = (settings.y / 100) * size.height;

    const scaledFontSize = getScaledFontSize(settings, size.width);

    const textWidth = Math.max(
      MIN_TEXT_WIDTH,
      (settings.width / 100) * size.width
    );

    let displayName = names[0]?.name || "";
    if (settings.uppercase) {
      displayName = displayName.toUpperCase();
    }

    textbox.set({
      left: centerX,
      top: centerY,
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
      scaleX: 1,
      scaleY: 1,
      selectable: true,
      evented: true,
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

    updateLabelPosition(textbox);
  };

  const drawGuidelines = (
    canvas: Canvas,
    size: { width: number; height: number }
  ) => {
    canvas
      .getObjects()
      .filter((obj: any) => obj.isGuideline)
      .forEach((obj: any) => canvas.remove(obj));

    const margin = 40;

    const marginRect = new Rect({
      left: margin,
      top: margin,
      width: Math.max(0, size.width - margin * 2),
      height: Math.max(0, size.height - margin * 2),
      fill: "transparent",
      stroke: "#3b82f6",
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    });

    (marginRect as any).isGuideline = true;
    canvas.add(marginRect);

    const verticalLine = new Line(
      [size.width / 2, 0, size.width / 2, size.height],
      {
        stroke: "#f97316",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      }
    );

    (verticalLine as any).isGuideline = true;
    canvas.add(verticalLine);

    const horizontalLine = new Line(
      [0, size.height / 2, size.width, size.height / 2],
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

  const createTextArea = (
    canvas: Canvas,
    settings: TextSettings,
    size: { width: number; height: number }
  ) => {
    if (!template || names.length === 0) return;

    const centerX = (settings.x / 100) * size.width;
    const centerY = (settings.y / 100) * size.height;
    const scaledFontSize = getScaledFontSize(settings, size.width);

    const initialWidth = Math.max(
      MIN_TEXT_WIDTH,
      (settings.width / 100) * size.width
    );

    const textbox = new Textbox(getDisplayName(), {
      left: centerX,
      top: centerY,
      originX: "center",
      originY: "center",

      width: initialWidth,
      fontSize: scaledFontSize,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      fill: settings.color,
      textAlign: settings.textAlign as "left" | "center" | "right",
      charSpacing: settings.letterSpacing * 10,
      lineHeight: settings.lineHeight,
      angle: settings.rotation,
      opacity: settings.opacity / 100,

      splitByGrapheme: false,

      selectable: true,
      evented: true,
      editable: false,

      hasBorders: true,
      borderColor: "#3b82f6",
      cornerColor: "#3b82f6",
      cornerSize: 8,
      transparentCorners: false,

      lockRotation: true,
      lockScalingFlip: true,
      lockSkewingX: true,
      lockSkewingY: true,
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
    configureCornerControls(textbox);
    textbox.setCoords();

    textRef.current = textbox;

    const label = new Text("Area nama", {
      left: centerX,
      top: centerY,
      fontSize: 12,
      fill: "#3b82f6",
      fontFamily: "Plus Jakarta Sans",
      selectable: false,
      evented: false,
    });

    labelRef.current = label;
    updateLabelPosition(textbox);

    // ---------------------------------------------
    // MOVING
    // ---------------------------------------------
    textbox.on("moving", () => {
      isTransformingRef.current = true;

      // Let Fabric move the textbox naturally.
      // Only the label follows the textbox.
      updateLabelPosition(textbox);

      requestSmoothRender(canvas);
    });

    // ---------------------------------------------
    // SCALING / RESIZING
    // ---------------------------------------------
    const scalingStartSize = { width: 0, height: 0, fontSize: 0, centerX: 0, centerY: 0 };
    
    textbox.on("scaling", (e: any) => {
      isTransformingRef.current = true;

      const corner = e.transform?.corner;

      if (!scalingStartSize.fontSize) {
        const center = textbox.getCenterPoint();
        scalingStartSize.width = textbox.width || MIN_TEXT_WIDTH;
        scalingStartSize.height = textbox.calcTextHeight() || 0;
        scalingStartSize.fontSize = textbox.fontSize || 72;
        scalingStartSize.centerX = center.x;
        scalingStartSize.centerY = center.y;
      }

      const scaleX = textbox.scaleX || 1;
      const scaleY = textbox.scaleY || 1;

      const isCorner = corner === 'tl' || corner === 'tr' || corner === 'bl' || corner === 'br';
      const isSide = corner === 'ml' || corner === 'mr';

      if (isCorner) {
        const avgScale = Math.sqrt(scaleX * scaleY);
        const newFontSize = Math.max(12, Math.min(500, Math.round(scalingStartSize.fontSize * avgScale)));
        const newWidth = Math.max(MIN_TEXT_WIDTH, scalingStartSize.width * avgScale);
        
        textbox.set({
          fontSize: newFontSize,
          width: newWidth,
          scaleX: 1,
          scaleY: 1,
        });

        textbox.initDimensions();
        
        const centerAfter = textbox.getCenterPoint();
        textbox.set({
          left: textbox.left! + (scalingStartSize.centerX - centerAfter.x),
          top: textbox.top! + (scalingStartSize.centerY - centerAfter.y),
        });
        
        textbox.setCoords();
      } else if (isSide) {
        const newWidth = Math.max(MIN_TEXT_WIDTH, scalingStartSize.width * scaleX);
        
        textbox.set({
          width: newWidth,
          scaleX: 1,
          scaleY: 1,
        });

        textbox.initDimensions();
        
        const centerAfter = textbox.getCenterPoint();
        textbox.set({
          left: textbox.left! + (scalingStartSize.centerX - centerAfter.x),
          top: textbox.top! + (scalingStartSize.centerY - centerAfter.y),
        });
        
        textbox.setCoords();
      }

      updateLabelPosition(textbox);
      requestSmoothRender(canvas);
    });

    // ---------------------------------------------
    // MOUSE RELEASE / SAVE
    // ---------------------------------------------
    textbox.on("modified", () => {
      scalingStartSize.width = 0;
      scalingStartSize.height = 0;
      scalingStartSize.fontSize = 0;
      scalingStartSize.centerX = 0;
      scalingStartSize.centerY = 0;

      const center = textbox.getCenterPoint();
      const finalWidth = textbox.width || MIN_TEXT_WIDTH;
      const finalFontSize = textbox.fontSize || 72;

      const newX = (center.x / size.width) * 100;
      const newY = (center.y / size.height) * 100;
      const newWidth = (finalWidth / size.width) * 100;
      
      const scaleFactor = size.width / template!.width;
      const originalFontSize = Math.round(finalFontSize / scaleFactor);

      isTransformingRef.current = false;

      updateTextSettings({
        x: roundPosition(clampPercent(newX)),
        y: roundPosition(clampPercent(newY)),
        width: roundPosition(clampPercent(newWidth)),
        fontSize: Math.max(12, Math.min(500, originalFontSize)),
      });

      updateLabelPosition(textbox);
      canvas.requestRenderAll();
    });

    canvas.add(label);
    canvas.add(textbox);

    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
  };

  // ------------------------------------------------
  // INITIALIZE FABRIC
  // ------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#f3f4f6",
      renderOnAddRemove: false,
      selection: false,
    });

    fabricRef.current = canvas;

    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const containerWidth = Math.max(
        1,
        containerRef.current.clientWidth - 32
      );

      const aspectRatio = template.height / template.width;
      const newWidth = Math.min(containerWidth, template.width);
      const newHeight = newWidth * aspectRatio;

      setCanvasSize({
        width: newWidth,
        height: newHeight,
      });

      canvas.setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    FabricImage.fromURL(
      template.url,
      {},
      { crossOrigin: "anonymous" }
    ).then((img) => {
      if (!fabricRef.current) return;

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

      canvas.add(img);
      canvas.sendObjectToBack(img);

      drawGuidelines(canvas, {
        width: actualWidth,
        height: actualHeight,
      });

      createTextArea(canvas, textSettings, {
        width: actualWidth,
        height: actualHeight,
      });

      isInitializedRef.current = true;
      canvas.requestRenderAll();
    });

    return () => {
      window.removeEventListener("resize", updateCanvasSize);

      if (renderFrameRef.current !== null) {
        cancelAnimationFrame(renderFrameRef.current);
        renderFrameRef.current = null;
      }

      canvas.dispose();

      fabricRef.current = null;
      textRef.current = null;
      labelRef.current = null;
      isInitializedRef.current = false;
      isTransformingRef.current = false;
    };
  }, [template]);

  // ------------------------------------------------
  // STORE -> FABRIC
  // ------------------------------------------------
  useEffect(() => {
    if (!fabricRef.current || !isInitializedRef.current || !template) {
      return;
    }

    // Never overwrite the live Fabric object during drag/resize.
    if (isTransformingRef.current) {
      return;
    }

    const textbox = textRef.current;

    if (!textbox) return;

    applyTextSettingsToFabric(
      textbox,
      textSettings,
      canvasSize
    );

    fabricRef.current.requestRenderAll();
  }, [
    textSettings,
    names,
    canvasSize,
    template,
    previewNameIndex,
  ]);

  const handleZoomIn = () => {
    if (zoom >= 200) return;

    const newZoom = zoom + 10;
    setZoom(newZoom);

    fabricRef.current?.setZoom(newZoom / 100);
    fabricRef.current?.requestRenderAll();
  };

  const handleZoomOut = () => {
    if (zoom <= 50) return;

    const newZoom = zoom - 10;
    setZoom(newZoom);

    fabricRef.current?.setZoom(newZoom / 100);
    fabricRef.current?.requestRenderAll();
  };

  const handleFit = () => {
    setZoom(100);
    fabricRef.current?.setZoom(1);
    fabricRef.current?.requestRenderAll();
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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Preview editor
        </h3>

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

          <Button
            variant="outline"
            size="sm"
            onClick={handleFit}
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Fit
          </Button>
        </div>
      </div>

      {names.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Preview:</span>
          <Select
            value={previewNameIndex.toString()}
            onValueChange={(value) => setPreviewNameIndex(Number(value))}
          >
            <SelectTrigger className="h-8 w-[250px] text-xs">
              <SelectValue>
                {names[previewNameIndex]?.name || "Pilih nama"}
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
      )}

      <div className="overflow-auto rounded-lg border border-border bg-gray-200 p-4">
        <div className="flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong>Drag kotak</strong> untuk pindah posisi. 
          <strong>Drag 4 pojok</strong> untuk ubah ukuran font.
          <strong>Drag pojok kiri/kanan</strong> untuk ubah lebar area (text auto-wrap).
        </p>
      </div>
    </div>
  );
};

export default CanvasPreview;
