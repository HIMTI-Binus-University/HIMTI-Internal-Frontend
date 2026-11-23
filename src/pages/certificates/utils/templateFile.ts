export const MAX_TEMPLATE_BYTES = 15 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);

/** Returns a user-facing error message, or null when the file is acceptable. */
export const validateTemplateFile = (file: {
  type: string;
  size: number;
}): string | null => {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use a PNG or JPG/JPEG image.";
  }

  if (file.size > MAX_TEMPLATE_BYTES) {
    return "The image is larger than 15 MB. Use a smaller file.";
  }

  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
