import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText, Line, Rect, Text } from "fabric";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import type { TextSettings } from "../types";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const roundPosition = (value: number) => Number(value.toFixed(2));

const CanvasPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boundingBoxRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const labelRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const isTransformingRef = useRef(false);
  const renderFrameRef = useRef<number | null>(null);

  const { state, updateTextSettings } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const requestSmoothRender = (canvas: Canvas) => {
    // Fabric already handles its own transform rendering. This only schedules
    // our extra render once per animation frame for the linked text/label.
    if (renderFrameRef.current !== null) return;

    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null;
      canvas.requestRenderAll();
    });
  };

  const drawGuidelines = (
    canvas: Canvas,
    size: { width: number; height: number }
  ) => {
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (obj.isGuideline) {
        canvas.remove(obj);
      }
    });

    const margin = 40;
    const marginRect = new Rect({
      left: margin,
      top: margin,
      width: size.width - margin * 2,
      height: size.height - margin * 2,
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

  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#f3f4f6",
      renderOnAddRemove: false,
    });

    fabricRef.current = canvas;

    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const containerWidth = Math.max(1, containerRef.current.clientWidth - 32);
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

      // Use the current actual canvas size instead of the initial 800x600 state.
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
      drawGuidelines(canvas, { width: actualWidth, height: actualHeight });
      renderText(canvas, textSettings, {
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
      boundingBoxRef.current = null;
      textRef.current = null;
      labelRef.current = null;
      isInitializedRef.current = false;
    };
  }, [template]);

  useEffect(() => {
    if (!fabricRef.current || !isInitializedRef.current) return;

    // Never overwrite Fabric's live transform while the user is dragging.
    if (isTransformingRef.current) return;

    if (boundingBoxRef.current && textRef.current && labelRef.current && template) {
      const textX = (textSettings.x / 100) * canvasSize.width;
      const textY = (textSettings.y / 100) * canvasSize.height;
      const textWidth = (textSettings.width / 100) * canvasSize.width;
      const scaleFactor = canvasSize.width / template.width;
      const scaledFontSize = textSettings.fontSize * scaleFactor;

      let displayName = names[0]?.name || "";
      if (textSettings.uppercase) {
        displayName = displayName.toUpperCase();
      }

      textRef.current.set({
        left: textX,
        top: textY,
        text: displayName,
        fontSize: scaledFontSize,
        fontFamily: textSettings.fontFamily,
        fontWeight: textSettings.fontWeight,
        fill: textSettings.color,
        textAlign: textSettings.textAlign,
        charSpacing: textSettings.letterSpacing * 10,
        lineHeight: textSettings.lineHeight,
      });

      const textHeight = textRef.current.height || scaledFontSize;
      const boxPadding = 4;
      const boxHeight = textHeight + boxPadding * 2;

      const boundingBox = boundingBoxRef.current;
      boundingBox.set({
        left: textX - textWidth / 2,
        top: textY - boxHeight / 2,
        width: textWidth,
        height: boxHeight,
        scaleX: 1,
        scaleY: 1,
      });

      labelRef.current.set({
        left: textX - textWidth / 2 + 5,
        top: textY - boxHeight / 2 - 20,
      });

      boundingBox.setCoords();
      textRef.current.setCoords();
      labelRef.current.setCoords();
      fabricRef.current.requestRenderAll();
    }
  }, [textSettings, names, canvasSize, template]);

  const syncLinkedObjects = (boundingBox: any, text: any, label: any) => {
    if (boundingBox.left === undefined || boundingBox.top === undefined) return;

    const currentWidth = boundingBox.width * (boundingBox.scaleX || 1);
    const currentHeight = boundingBox.height * (boundingBox.scaleY || 1);
    const centerX = boundingBox.left + currentWidth / 2;
    const centerY = boundingBox.top + currentHeight / 2;

    text.set({
      left: centerX,
      top: centerY,
    });

    label.set({
      left: boundingBox.left + 5,
      top: boundingBox.top - 20,
    });

    text.setCoords();
    label.setCoords();
  };

  const renderText = (
    canvas: Canvas,
    settings: TextSettings,
    size: { width: number; height: number }
  ) => {
    if (!template || names.length === 0) return;

    let displayName = names[0].name;
    if (settings.uppercase) {
      displayName = displayName.toUpperCase();
    }

    const textX = (settings.x / 100) * size.width;
    const textY = (settings.y / 100) * size.height;
    const textWidth = (settings.width / 100) * size.width;

    const scaleFactor = size.width / template.width;
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
    textRef.current = text;

    const textHeight = text.height || scaledFontSize;
    const boxPadding = 4;
    const boxHeight = textHeight + boxPadding * 2;

    const label = new Text("Area nama", {
      left: textX - textWidth / 2 + 5,
      top: textY - boxHeight / 2 - 20,
      fontSize: 12,
      fill: "#3b82f6",
      fontFamily: "Plus Jakarta Sans",
      selectable: false,
      evented: false,
    });
    labelRef.current = label;

    const boundingBox = new Rect({
      left: textX - textWidth / 2,
      top: textY - boxHeight / 2,
      width: textWidth,
      height: boxHeight,
      fill: "transparent",
      stroke: "#3b82f6",
      strokeWidth: 2,
      selectable: true,
      evented: true,
      hasControls: true,
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
    boundingBoxRef.current = boundingBox;

    const handleTransform = () => {
      syncLinkedObjects(boundingBox, text, label);
      requestSmoothRender(canvas);
    };

    boundingBox.on("moving", () => {
      isTransformingRef.current = true;
      handleTransform();
    });

    boundingBox.on("scaling", () => {
      isTransformingRef.current = true;
      handleTransform();
    });

    boundingBox.on("modified", () => {
      const left = boundingBox.left ?? 0;
      const top = boundingBox.top ?? 0;
      const currentWidth = boundingBox.width * (boundingBox.scaleX || 1);
      const currentHeight = boundingBox.height * (boundingBox.scaleY || 1);

      // Convert the live Fabric position to percentages BEFORE resetting scale.
      const newX = ((left + currentWidth / 2) / size.width) * 100;
      const newY = ((top + currentHeight / 2) / size.height) * 100;
      const newWidth = (currentWidth / size.width) * 100;

      // Calculate new font size based on average of width and height change
      const originalWidth = textWidth;
      const originalHeight = (text.height || scaledFontSize) + 8;
      const scaleRatioWidth = currentWidth / originalWidth;
      const scaleRatioHeight = currentHeight / originalHeight;
      const scaleRatio = Math.sqrt(scaleRatioWidth * scaleRatioHeight);
      const newFontSize = Math.round(settings.fontSize * scaleRatio);

      // IMPORTANT: normalize the Fabric object first, then update React/Zustand.
      // This prevents the store update from fighting with an active Fabric transform.
      boundingBox.set({
        width: currentWidth,
        height: currentHeight,
        scaleX: 1,
        scaleY: 1,
      });
      boundingBox.setCoords();

      syncLinkedObjects(boundingBox, text, label);
      canvas.requestRenderAll();

      isTransformingRef.current = false;

      updateTextSettings({
        x: roundPosition(clampPercent(newX)),
        y: roundPosition(clampPercent(newY)),
        width: roundPosition(clampPercent(newWidth)),
        fontSize: Math.max(12, Math.min(500, newFontSize)),
      });
    });

    canvas.add(label);
    canvas.add(text);
    canvas.add(boundingBox);
    canvas.setActiveObject(boundingBox);
    canvas.requestRenderAll();
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      const newZoom = zoom + 10;
      setZoom(newZoom);
      fabricRef.current?.setZoom(newZoom / 100);
      fabricRef.current?.requestRenderAll();
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      const newZoom = zoom - 10;
      setZoom(newZoom);
      fabricRef.current?.setZoom(newZoom / 100);
      fabricRef.current?.requestRenderAll();
    }
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
          <Button variant="outline" size="sm" onClick={handleFit}>
            <Maximize2 className="mr-2 h-4 w-4" />
            Fit
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-border bg-gray-200 p-4">
        <div className="flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          Geser garis biru untuk memindahkan nama. Tarik titik kanan untuk
          mengubah lebar. Posisi disimpan relatif terhadap ukuran template.
        </p>
      </div>
    </div>
  );
};

export default CanvasPreview;
