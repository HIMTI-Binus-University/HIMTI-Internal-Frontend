import { Canvas, FabricImage, Textbox } from "fabric";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import type { CertificateTemplate, NameEntry, TextSettings } from "../types";
import {
  createCanvasMeasure,
  ensureFontReady,
  fitName,
  getBoxWidth,
  type FitResult,
} from "./fitName";

export type CertificateFormat = "png-zip" | "pdf-zip" | "pdf-multi";

interface GenerateOptions {
  template: CertificateTemplate;
  names: NameEntry[];
  textSettings: TextSettings;
  format: CertificateFormat;
  onProgress?: (current: number, total: number) => void;
}

const loadImageElement = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load template image"));
    image.src = url;
  });

// Let the browser paint progress and handle input between certificates, so
// large batches do not freeze the tab.
const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const createCertificateCanvas = (
  template: CertificateTemplate,
  templateImage: HTMLImageElement,
  fit: FitResult,
  textSettings: TextSettings,
): Canvas => {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = template.width;
  canvasElement.height = template.height;

  const canvas = new Canvas(canvasElement, {
    width: template.width,
    height: template.height,
    backgroundColor: "#ffffff",
  });

  // The decoded bitmap is shared, so each certificate only wraps it.
  const background = new FabricImage(templateImage, {
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
    scaleX: 1,
    scaleY: 1,
  });

  canvas.add(background);
  canvas.sendObjectToBack(background);

  const centerX = (textSettings.x / 100) * template.width;
  const centerY = (textSettings.y / 100) * template.height;

  const textbox = new Textbox(fit.text, {
    left: centerX,
    top: centerY,
    originX: "center",
    originY: "center",
    width: getBoxWidth(textSettings, template.width),
    fontSize: fit.fontSize,
    fontFamily: textSettings.fontFamily,
    fontWeight: textSettings.fontWeight,
    fill: textSettings.color,
    textAlign: textSettings.textAlign as "left" | "center" | "right",
    charSpacing: textSettings.letterSpacing * 10,
    lineHeight: textSettings.lineHeight,
    angle: textSettings.rotation,
    opacity: textSettings.opacity / 100,
    selectable: false,
    evented: false,
    editable: false,
    splitByGrapheme: false,
  });

  if (textSettings.shadow.enabled) {
    textbox.set({
      shadow: {
        color: textSettings.shadow.color,
        blur: textSettings.shadow.blur,
        offsetX: textSettings.shadow.offsetX,
        offsetY: textSettings.shadow.offsetY,
      } as any,
    });
  }

  if (textSettings.stroke.enabled) {
    textbox.set({
      stroke: textSettings.stroke.color,
      strokeWidth: textSettings.stroke.width,
      paintFirst: "stroke",
    });
  }

  textbox.initDimensions();
  textbox.setCoords();

  canvas.add(textbox);
  canvas.renderAll();

  return canvas;
};

const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 100);
};

// Two different names can sanitise to the same file name ("A/B" and "A_B");
// add a counter so one never overwrites the other inside the ZIP.
const createUniqueNamer = () => {
  const used = new Map<string, number>();

  return (base: string, extension: string) => {
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? `${base}.${extension}` : `${base}_${count + 1}.${extension}`;
  };
};

/**
 * Renders every certificate one at a time. The template image, the font and
 * the text measurer are prepared once, not per name.
 */
const renderAll = async (
  options: GenerateOptions,
  handle: (dataURL: string, name: string, index: number) => void | Promise<void>,
) => {
  const { template, names, textSettings, onProgress } = options;

  const [templateImage] = await Promise.all([
    loadImageElement(template.url),
    ensureFontReady(textSettings),
  ]);

  const measure = createCanvasMeasure(textSettings);
  const boxWidth = getBoxWidth(textSettings, template.width);

  for (let i = 0; i < names.length; i++) {
    const name = names[i].name;
    const fit = fitName(name, textSettings, boxWidth, measure);
    const canvas = createCertificateCanvas(template, templateImage, fit, textSettings);

    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });

      await handle(dataURL, name, i);
    } finally {
      canvas.dispose();
    }

    onProgress?.(i + 1, names.length);
    await yieldToBrowser();
  }
};

const createPdf = (template: CertificateTemplate) =>
  new jsPDF({
    orientation: template.width > template.height ? "landscape" : "portrait",
    unit: "px",
    format: [template.width, template.height],
  });

export const generatePNGZip = async (options: GenerateOptions): Promise<void> => {
  const zip = new JSZip();
  const uniqueName = createUniqueNamer();

  await renderAll(options, (dataURL, name) => {
    zip.file(uniqueName(sanitizeFilename(name), "png"), dataURL.split(",")[1], {
      base64: true,
    });
  });

  saveAs(await zip.generateAsync({ type: "blob" }), "certificates.zip");
};

export const generatePDFZip = async (options: GenerateOptions): Promise<void> => {
  const { template } = options;
  const zip = new JSZip();
  const uniqueName = createUniqueNamer();

  await renderAll(options, (dataURL, name) => {
    const pdf = createPdf(template);
    pdf.addImage(dataURL, "PNG", 0, 0, template.width, template.height);
    zip.file(uniqueName(sanitizeFilename(name), "pdf"), pdf.output("blob"));
  });

  saveAs(await zip.generateAsync({ type: "blob" }), "certificates.zip");
};

export const generateMultiPagePDF = async (options: GenerateOptions): Promise<void> => {
  const { template } = options;
  const pdf = createPdf(template);

  await renderAll(options, (dataURL, _name, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(dataURL, "PNG", 0, 0, template.width, template.height);
  });

  pdf.save("certificates.pdf");
};

export const generateCertificates = async (options: GenerateOptions): Promise<void> => {
  switch (options.format) {
    case "png-zip":
      return generatePNGZip(options);
    case "pdf-zip":
      return generatePDFZip(options);
    case "pdf-multi":
      return generateMultiPagePDF(options);
    default:
      throw new Error(`Unknown format: ${options.format}`);
  }
};
