import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Shadow, Textbox } from "fabric";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

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
import InlineNotice from "../components/InlineNotice";
import { describeFit } from "../components/describeFit";
import { getBoxWidth, type FitResult } from "../utils/fitName";
import { computeFitWidth } from "../utils/fitCanvas";

interface CertificatePreviewProps {
  fits: FitResult[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

// Space the canvas frame takes around the canvas: p-2 (16px) + border (2px).
const FRAME_CHROME = 18;

const CertificatePreview = ({ fits, currentIndex, onIndexChange }: CertificatePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const textboxRef = useRef<Textbox | null>(null);
  const backgroundReadyRef = useRef(false);

  const { state, getLongestName } = useCertificateStore();
  const { template, names, textSettings } = state;

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Draws (or updates) the name on the canvas from the latest props. Kept in a
  // ref so the canvas setup effect can call the current version after the
  // template image has loaded.
  const applyRef = useRef<() => void>(() => {});
  applyRef.current = () => {
    const canvas = fabricRef.current;
    const fit = fits[currentIndex] ?? fits[0];
    if (!canvas || !template || !backgroundReadyRef.current || !fit) return;

    const settings = textSettings;
    const scale = canvas.getWidth() / template.width;
    const boxWidth = getBoxWidth(settings, template.width) * scale;

    let textbox = textboxRef.current;
    if (!textbox) {
      textbox = new Textbox(fit.text, {
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        editable: false,
        splitByGrapheme: false,
      });
      textboxRef.current = textbox;
      canvas.add(textbox);
    }

    textbox.set({
      left: (settings.x / 100) * canvas.getWidth(),
      top: (settings.y / 100) * canvas.getHeight(),
      text: fit.text,
      width: boxWidth,
      fontSize: fit.fontSize * scale,
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      fill: settings.color,
      textAlign: settings.textAlign as "left" | "center" | "right",
      charSpacing: settings.letterSpacing * 10,
      lineHeight: settings.lineHeight,
      angle: settings.rotation,
      opacity: settings.opacity / 100,
      shadow: settings.shadow.enabled
        ? new Shadow({
            color: settings.shadow.color,
            blur: settings.shadow.blur,
            offsetX: settings.shadow.offsetX,
            offsetY: settings.shadow.offsetY,
          })
        : null,
      stroke: settings.stroke.enabled ? settings.stroke.color : undefined,
      strokeWidth: settings.stroke.enabled ? settings.stroke.width : 0,
      paintFirst: settings.stroke.enabled ? "stroke" : "fill",
    });

    textbox.initDimensions();
    textbox.setCoords();
    canvas.requestRenderAll();
  };

  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = new Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      selection: false,
    });

    fabricRef.current = canvas;
    backgroundReadyRef.current = false;
    let cancelled = false;

    const updateCanvasSize = () => {
      const area = areaRef.current;
      if (!area) return;

      const aspectRatio = template.height / template.width;
      const availableWidth = Math.max(1, area.clientWidth - FRAME_CHROME);
      // On large screens the container has a fixed height, so fit the height
      // too; below that the page scrolls and only the width matters.
      const availableHeight =
        window.innerWidth >= 1024 && area.clientHeight > 0
          ? Math.max(1, area.clientHeight - FRAME_CHROME)
          : Number.POSITIVE_INFINITY;

      const newWidth = computeFitWidth({
        availableWidth,
        availableHeight,
        aspectRatio,
        templateWidth: template.width,
      });
      const newHeight = newWidth * aspectRatio;

      setCanvasSize((prev) =>
        prev.width === newWidth && prev.height === newHeight
          ? prev
          : { width: newWidth, height: newHeight },
      );
      canvas.setDimensions({ width: newWidth, height: newHeight });

      // Keep the template image aligned with the canvas on every resize.
      const background = canvas.getObjects()[0];
      if (background && backgroundReadyRef.current) {
        background.set({
          left: 0,
          top: 0,
          scaleX: newWidth / template.width,
          scaleY: newHeight / template.height,
        });
      }
      applyRef.current();
      canvas.requestRenderAll();
    };

    updateCanvasSize();
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && areaRef.current
        ? new ResizeObserver(updateCanvasSize)
        : null;
    if (areaRef.current) resizeObserver?.observe(areaRef.current);

    FabricImage.fromURL(template.url, {}, { crossOrigin: "anonymous" }).then((img) => {
      if (cancelled || !img || !fabricRef.current) return;

      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: canvas.getWidth() / template.width,
        scaleY: canvas.getHeight() / template.height,
      });

      canvas.add(img);
      canvas.sendObjectToBack(img);
      backgroundReadyRef.current = true;
      applyRef.current();
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      canvas.dispose();
      fabricRef.current = null;
      textboxRef.current = null;
      backgroundReadyRef.current = false;
    };
  }, [template]);

  // Re-apply whenever anything that affects the drawn name changes.
  useEffect(() => {
    applyRef.current();
  }, [fits, currentIndex, textSettings, canvasSize]);

  if (!template || names.length === 0) {
    return (
      <ContainerSection icon={Eye} title="Preview" description="Check each certificate before exporting.">
        <InlineNotice tone="warning">
          No template or names loaded. Go back to Step 1 to add them.
        </InlineNotice>
      </ContainerSection>
    );
  }

  const safeIndex = Math.min(currentIndex, names.length - 1);
  const fitNote = fits[safeIndex] ? describeFit(fits[safeIndex]) : null;

  const handleLongestName = () => {
    const longest = getLongestName();
    const index = longest ? names.findIndex((n) => n.id === longest.id) : -1;
    if (index !== -1) onIndexChange(index);
  };

  return (
    <ContainerSection
      icon={Eye}
      title="Preview"
      description={`Certificate ${safeIndex + 1} of ${names.length}`}
      actions={
        <Select
          value={safeIndex.toString()}
          onValueChange={(value) => onIndexChange(parseInt(value || "0"))}
        >
          <SelectTrigger aria-label="Choose a name to preview" className="w-full min-w-0 sm:w-[240px]">
            <SelectValue>{names[safeIndex]?.name || "Select name"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {names.map((name, index) => (
              <SelectItem key={name.id} value={index.toString()}>
                {name.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      footer={
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            onClick={() => onIndexChange(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
          >
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
          <Button variant="outline" onClick={handleLongestName}>
            Longest name
          </Button>
          <Button
            variant="ghost"
            onClick={() => onIndexChange(Math.min(names.length - 1, safeIndex + 1))}
            disabled={safeIndex === names.length - 1}
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 lg:h-full">
        {fitNote && <InlineNotice tone={fitNote.tone}>{fitNote.text}</InlineNotice>}

        {/* Measured area: the canvas is sized to fit inside it. */}
        <div ref={areaRef} className="flex min-h-0 w-full min-w-0 flex-1 items-start justify-center">
          <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </ContainerSection>
  );
};

export default CertificatePreview;
