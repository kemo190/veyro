/**
 * Fast, pure-client image compression utility.
 * Optimizes mobile camera shots (5-12MB) down to crisp ~100-200KB files,
 * preserving extreme legibility for ticket fonts, thermal receipt text, and order numbers.
 */

export interface CompressedImageResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number;
}

export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
  } = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.82,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // If not in browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("ضغط الصور متاح فقط في بيئة المتصفح"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("فشل قراءة ملف الصورة"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("فشل فك تشفير محتوى الصورة"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while bounding within maxWidth x maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("تعذر تهيئة معالج الصور في المتصفح"));
          return;
        }

        // High quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("تعذر ضغط ملف الصورة"));
              return;
            }

            const cleanName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "image";
            const compressedFile = new File([blob], `${cleanName}.jpg`, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL(mimeType, quality);
            const originalSizeKb = Math.round(file.size / 1024);
            const compressedSizeKb = Math.round(blob.size / 1024);
            const compressionRatio = Math.round(
              (1 - compressedSizeKb / Math.max(originalSizeKb, 1)) * 100
            );

            resolve({
              file: compressedFile,
              blob,
              dataUrl,
              originalSizeKb,
              compressedSizeKb,
              compressionRatio: Math.max(0, compressionRatio),
            });
          },
          mimeType,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(";base64,");
  const contentType = parts[0].split(":")[1] || "image/jpeg";
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
