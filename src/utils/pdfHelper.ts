import * as pdfjsLib from 'pdfjs-dist';

// Configure worker URL for pdfjs-dist
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('Could not set workerSrc via CDN, falling back to inline if possible', e);
}

/**
 * Extracts each page of a PDF file as an optimized JPEG base64 Data URL.
 * Reuses a single canvas instance to prevent memory bloat and renders rapidly even for 80+ pages.
 */
export async function convertPdfToPageImages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const pageImages: string[] = [];

  // Reusable canvas to prevent memory leaks across large documents
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('فشل إنشاء سياق رسم Canvas لمعالجة الـ PDF.');
  }

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // Optimal 1200px width for fast rendering and high OCR accuracy
    const optimalScale = Math.min(1.4, Math.max(1.0, 1200 / unscaledViewport.width));
    const viewport = page.getViewport({ scale: optimalScale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;
    // 0.80 quality balances fast JPEG encoding with high legibility
    const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
    pageImages.push(dataUrl);

    if (onProgress) {
      onProgress(i, numPages);
    }

    // Brief yield every 10 pages to keep browser responsive
    if (i % 10 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  // Cleanup canvas
  canvas.width = 0;
  canvas.height = 0;

  return pageImages;
}

/**
 * Converts and optimizes an image File (e.g. large phone camera photos)
 * Scales down excessive dimensions (>1400px) to ensure fast processing.
 */
export function convertImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(new Error('فشل قراءة ملف الصورة.'));
      }

      const img = new Image();
      img.onload = () => {
        const maxDimension = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.82);
            canvas.width = 0;
            canvas.height = 0;
            return resolve(optimized);
          }
        }
        resolve(result);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
