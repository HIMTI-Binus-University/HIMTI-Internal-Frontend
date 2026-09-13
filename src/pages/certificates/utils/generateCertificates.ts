import { Canvas, FabricImage, Textbox } from "fabric";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import type { CertificateTemplate, NameEntry, TextSettings } from "../types";

interface GenerateOptions {
  template: CertificateTemplate;
  names: NameEntry[];
  textSettings: TextSettings;
  format: "png-zip" | "pdf-zip" | "pdf-multi";
  onProgress?: (current: number, total: number) => void;
}

const createCertificateCanvas = async (
  template: CertificateTemplate,
  name: string,
  textSettings: TextSettings
): Promise<Canvas> => {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = template.width;
  canvasElement.height = template.height;

  const canvas = new Canvas(canvasElement, {
    width: template.width,
    height: template.height,
    backgroundColor: "#ffffff",
  });

  const img = await FabricImage.fromURL(template.url, {}, {
    crossOrigin: "anonymous",
  });

  if (!img) {
    throw new Error("Failed to load template image");
  }

  img.set({
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
    scaleX: 1,
    scaleY: 1,
  });

  canvas.add(img);
  canvas.sendObjectToBack(img);

  let displayName = name;
  if (textSettings.uppercase) {
    displayName = displayName.toUpperCase();
  }

  const centerX = (textSettings.x / 100) * template.width;
  const centerY = (textSettings.y / 100) * template.height;
  const textWidth = Math.max(40, (textSettings.width / 100) * template.width);

  const textbox = new Textbox(displayName, {
    left: centerX,
    top: centerY,
    originX: "center",
    originY: "center",
    width: textWidth,
    fontSize: textSettings.fontSize,
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

export const generatePNGZip = async (options: GenerateOptions): Promise<void> => {
  const { template, names, textSettings, onProgress } = options;
  const zip = new JSZip();

  for (let i = 0; i < names.length; i++) {
    const name = names[i].name;
    const canvas = await createCertificateCanvas(template, name, textSettings);
    
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const base64Data = dataURL.split(",")[1];
    zip.file(`${sanitizeFilename(name)}.png`, base64Data, { base64: true });

    canvas.dispose();

    if (onProgress) {
      onProgress(i + 1, names.length);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "certificates.zip");
};

export const generatePDFZip = async (options: GenerateOptions): Promise<void> => {
  const { template, names, textSettings, onProgress } = options;
  const zip = new JSZip();

  for (let i = 0; i < names.length; i++) {
    const name = names[i].name;
    const canvas = await createCertificateCanvas(template, name, textSettings);
    
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const pdf = new jsPDF({
      orientation: template.width > template.height ? "landscape" : "portrait",
      unit: "px",
      format: [template.width, template.height],
    });

    pdf.addImage(dataURL, "PNG", 0, 0, template.width, template.height);
    const pdfBlob = pdf.output("blob");

    zip.file(`${sanitizeFilename(name)}.pdf`, pdfBlob);

    canvas.dispose();

    if (onProgress) {
      onProgress(i + 1, names.length);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "certificates.zip");
};

export const generateMultiPagePDF = async (options: GenerateOptions): Promise<void> => {
  const { template, names, textSettings, onProgress } = options;

  const pdf = new jsPDF({
    orientation: template.width > template.height ? "landscape" : "portrait",
    unit: "px",
    format: [template.width, template.height],
  });

  for (let i = 0; i < names.length; i++) {
    const name = names[i].name;
    const canvas = await createCertificateCanvas(template, name, textSettings);
    
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(dataURL, "PNG", 0, 0, template.width, template.height);

    canvas.dispose();

    if (onProgress) {
      onProgress(i + 1, names.length);
    }
  }

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
