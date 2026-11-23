import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, FabricImage, Line, Rect, Textbox, Text } from "fabric";
import { Minus, Plus, Maximize2, MousePointer2 } from "lucide-react";
import { ContainerSection } from "@/components/Utils";
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
import { ZOOM_CONFIG } from "../constants";
import InlineNotice from "../components/InlineNotice";
import { describeFit } from "../components/describeFit";
import { createCanvasMeasure, fitName, getBoxWidth } from "../utils/fitName";
import { computeFitWidth } from "../utils/fitCanvas";
import { GUIDELINE_MARGIN, snapToTargets, type SnapResult } from "./snap";

// Space around the canvas inside the measured area: the area's own padding
// (p-3 = 24px) plus the canvas frame (p-2 + 1px border each side = 18px).
const FRAME_CHROME = 42;

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
const roundPosition = (value: number) => Number(value.toFixed(2));

const MIN_TEXT_WIDTH = 40;

type MarkedFabricObject = { isSnapGuide?: boolean };

const removeSnapGuides = (canvas: Canvas) => {
  canvas
    .getObjects()
    .filter((obj) => (obj as MarkedFabricObject).isSnapGuide)
    .forEach((obj) => canvas.remove(obj));
};

const drawSnapGuides = (
  canvas: Canvas,
  snappedX: SnapResult,
  snappedY: SnapResult,
  size: { width: number; height: number }
) => {
  removeSnapGuides(canvas);

  if (snappedX.snappedAt !== null) {
    const guide = new Line([snappedX.snappedAt, 0, snappedX.snappedAt, size.height], {
      stroke: snappedX.kind === "grid" ? "#10b981" : "#ec4899",
      strokeWidth: 1,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
    });

    (guide as MarkedFabricObject).isSnapGuide = true;
    canvas.add(guide);
  }

  if (snappedY.snappedAt !== null) {
    const guide = new Line([0, snappedY.snappedAt, size.width, snappedY.snappedAt], {
      stroke: snappedY.kind === "grid" ? "#10b981" : "#ec4899",
      strokeWidth: 1,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
    });

    (guide as MarkedFabricObject).isSnapGuide = true;
    canvas.add(guide);
  }
};

const CanvasPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  // The scrollable area the canvas is sized to fit inside.
  const areaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<number>(ZOOM_CONFIG.DEFAULT);
  const resizeRef = useRef<() => void>(() => {});

  // The Textbox itself is the editable text area.
  const textRef = useRef<Textbox | null>(null);
  const labelRef = useRef<Text | null>(null);

  const isInitializedRef = useRef(false);
  const isTransformingRef = useRef(false);
  const renderFrameRef = useRef<number | null>(null);

  const { state, updateTextSettings } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [zoom, setZoom] = useState<number>(ZOOM_CONFIG.DEFAULT);
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
      left: bounds.left,
      top: bounds.top - 17,
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

    const displayName = getDisplayName();

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

    const margin = GUIDELINE_MARGIN;

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
    // (z-order is restored after all guidelines are added, see below)

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

    // Guidelines are redrawn on every resize/zoom, which adds them on top of
    // the name box. Send them to the back (above the template image only).
    const objects = canvas.getObjects();
    objects
      .filter((obj: any) => obj.isGuideline)
      .forEach((obj) => canvas.sendObjectToBack(obj));
    const background = objects.find((obj: any) => obj.isTemplateBackground);
    if (background) canvas.sendObjectToBack(background);
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

    // A solid chip, so it stays readable over the template's own text.
    const label = new Text(" Name area ", {
      left: centerX,
      top: centerY,
      fontSize: 11,
      fill: "#ffffff",
      backgroundColor: "#3b82f6",
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

      // Snap is always on: snap the box to canvas midpoints / margin /
      // grid lines first, so the label follows the final position.
      const liveSize = {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
      };

      const snapped = snapToTargets(textbox, liveSize);
      drawSnapGuides(canvas, snapped.x, snapped.y, liveSize);

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

      removeSnapGuides(canvas);

      // Read the live canvas size: the canvas can be resized after this
      // handler was created (responsive column change, window resize), and
      // the captured `size` would then compute wrong percentages.
      const liveWidth = canvas.getWidth();
      const liveHeight = canvas.getHeight();

      const center = textbox.getCenterPoint();
      const finalWidth = textbox.width || MIN_TEXT_WIDTH;
      const finalFontSize = textbox.fontSize || 72;

      const newX = (center.x / liveWidth) * 100;
      const newY = (center.y / liveHeight) * 100;
      const newWidth = (finalWidth / liveWidth) * 100;
      
      // Use the live width, like the position above: `size` was captured when
      // the box was created and is wrong after a resize or zoom.
      const scaleFactor = liveWidth / template!.width;
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

    // Fits the canvas inside the area (width, and height on large screens),
    // then applies the zoom as a multiplier on that fitted size. Everything
    // else (position %, font scale) is derived from the canvas size, so the
    // template image and guidelines are rescaled here as well.
    const updateCanvasSize = () => {
      const area = areaRef.current;
      if (!area) return;

      const aspectRatio = template.height / template.width;
      const availableWidth = Math.max(1, area.clientWidth - FRAME_CHROME);
      const availableHeight =
        window.innerWidth >= 1024 && area.clientHeight > 0
          ? Math.max(1, area.clientHeight - FRAME_CHROME)
          : Number.POSITIVE_INFINITY;

      const fitWidth = computeFitWidth({
        availableWidth,
        availableHeight,
        aspectRatio,
        templateWidth: template.width,
      });
      const newWidth = (fitWidth * zoomRef.current) / 100;
      const newHeight = newWidth * aspectRatio;

      canvas.setDimensions({ width: newWidth, height: newHeight });

      const background = canvas
        .getObjects()
        .find((obj: any) => obj.isTemplateBackground);
      if (background) {
        background.set({
          left: 0,
          top: 0,
          scaleX: newWidth / template.width,
          scaleY: newHeight / template.height,
        });
        drawGuidelines(canvas, { width: newWidth, height: newHeight });
      }

      setCanvasSize((prev) =>
        prev.width === newWidth && prev.height === newHeight
          ? prev
          : { width: newWidth, height: newHeight }
      );
      canvas.requestRenderAll();
    };

    resizeRef.current = updateCanvasSize;
    updateCanvasSize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && areaRef.current
        ? new ResizeObserver(updateCanvasSize)
        : null;
    if (areaRef.current) resizeObserver?.observe(areaRef.current);

    let cancelled = false;

    FabricImage.fromURL(
      template.url,
      {},
      { crossOrigin: "anonymous" }
    ).then((img) => {
      if (cancelled || !fabricRef.current) return;

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

      (img as any).isTemplateBackground = true;
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
      cancelled = true;
      resizeObserver?.disconnect();
      resizeRef.current = () => {};

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

  const applyZoom = (next: number) => {
    const clamped = Math.max(ZOOM_CONFIG.MIN, Math.min(ZOOM_CONFIG.MAX, next));
    zoomRef.current = clamped;
    setZoom(clamped);
    // Re-fit the canvas at the new zoom (size, template and guidelines).
    resizeRef.current();
  };

  const handleZoomIn = () => applyZoom(zoom + ZOOM_CONFIG.STEP);
  const handleZoomOut = () => applyZoom(zoom - ZOOM_CONFIG.STEP);
  const handleFit = () => applyZoom(ZOOM_CONFIG.DEFAULT);

  // How the previewed name will really be drawn (shrunk, shortened, too long).
  const fitNote = useMemo(() => {
    if (!template || names.length === 0) return null;

    const entry = names[previewNameIndex] ?? names[0];
    const fit = fitName(
      entry.name,
      textSettings,
      getBoxWidth(textSettings, template.width),
      createCanvasMeasure(textSettings)
    );

    return describeFit(fit);
  }, [template, names, previewNameIndex, textSettings]);

  if (!template) {
    return (
      <ContainerSection
        icon={MousePointer2}
        title="Preview editor"
        description="Drag the name box to place it."
      >
        <InlineNotice tone="warning">
          No template loaded. Go back to Step 1 to add one.
        </InlineNotice>
      </ContainerSection>
    );
  }

  return (
    <ContainerSection
      icon={MousePointer2}
      title="Preview editor"
      description="Drag the name box to place it. Drag a corner to resize."
      actions={
        <div
          role="group"
          aria-label="Zoom"
          className="flex items-center gap-1.5"
        >
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_CONFIG.MIN}
          >
            <Minus aria-hidden="true" />
          </Button>

          <span
            className="min-w-[3.25rem] text-center text-sm font-medium tabular-nums"
            aria-live="polite"
          >
            {zoom}%
          </span>

          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_CONFIG.MAX}
          >
            <Plus aria-hidden="true" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleFit}>
            <Maximize2 aria-hidden="true" />
            Fit
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 lg:h-full">
        {names.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span id="preview-name-label" className="text-sm text-muted-foreground">
              Preview name
            </span>
            <Select
              value={previewNameIndex.toString()}
              onValueChange={(value) => setPreviewNameIndex(Number(value))}
            >
              <SelectTrigger
                aria-labelledby="preview-name-label"
                className="w-full min-w-0 sm:w-[260px]"
              >
                <SelectValue>
                  {names[previewNameIndex]?.name || "Select name"}
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

        {fitNote && <InlineNotice tone={fitNote.tone}>{fitNote.text}</InlineNotice>}

        {/* Measured area: the canvas is sized to fit inside it and scrolls when zoomed in. */}
        <div
          ref={areaRef}
          className="min-h-[200px] w-full min-w-0 overflow-auto rounded-lg border border-border bg-muted/50 p-3 lg:min-h-0 lg:flex-1"
        >
          <div className="mx-auto w-fit rounded-lg border border-border bg-white p-2 shadow-sm">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </ContainerSection>
  );
};

export default CanvasPreview;
