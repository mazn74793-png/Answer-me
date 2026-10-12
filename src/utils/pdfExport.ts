import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Ensure jsPDF or any external consumer uses html2canvas-pro
if (typeof window !== 'undefined') {
  (window as any).html2canvas = html2canvas;
}

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { BookPage } from '../types';

/**
 * Helper to trigger browser file download from Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


/**
 * Helper to find a clean white gap between question cards
 * so that text is never sliced in half across pages.
 */
function findCleanGap(canvas: HTMLCanvasElement, startY: number, targetHeight: number): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return targetHeight;

  // Search in the bottom 25% of the target height for an empty white gap
  const searchMin = Math.floor(targetHeight * 0.75);
  const searchMax = targetHeight - 1;

  // Sample across the middle 60% of the canvas width
  const sampleX = Math.floor(canvas.width * 0.2);
  const sampleW = Math.floor(canvas.width * 0.6);

  try {
    for (let y = searchMax; y >= searchMin; y--) {
      const currentY = startY + y;
      if (currentY >= canvas.height) continue;

      const imgData = ctx.getImageData(sampleX, currentY, sampleW, 1).data;
      let isGap = true;
      for (let p = 0; p < imgData.length; p += 16) {
        // If pixel is not white/near-white, it's text or card border
        if (imgData[p] < 245 || imgData[p + 1] < 245 || imgData[p + 2] < 245) {
          isGap = false;
          break;
        }
      }

      if (isGap) {
        return y; // Found clean slice position!
      }
    }
  } catch {
    return targetHeight;
  }

  return targetHeight;
}

export async function generateAndDownloadPdf(
  pages: BookPage[],
  onProgress?: (current: number, total: number, message: string) => void,
  customFilename?: string
): Promise<void> {
  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);

  if (completedPages.length === 0) {
    throw new Error('لا توجد صفحات مكتملة الحل لتصديرها.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210; // mm
  const pdfHeight = 297; // mm
  let pdfPageCount = 0;

  for (let i = 0; i < completedPages.length; i++) {
    const page = completedPages[i];
    const elementId = `pdf-page-container-${page.id}`;
    const element = document.getElementById(elementId);

    if (onProgress) {
      onProgress(i + 1, completedPages.length, `جاري تجهيز صفحة الحل رقم ${page.pageNumber}...`);
    }

    if (element) {
      // Ensure Cairo and system fonts are ready before rasterizing
      if (document.fonts) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(element, {
        scale: 3.0, // Ultra-sharp 3x Retina resolution for razor-sharp crystal-clear text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        windowWidth: 1200, // Desktop rendering fidelity
        onclone: (clonedDoc) => {
          // 1. Sanitize modern color functions (oklch, oklab, lch, color-mix) in all style elements
          const sanitizeColors = (cssText: string) =>
            cssText
              .replace(/oklch\([^)]*\)/gi, '#000000')
              .replace(/oklab\([^)]*\)/gi, '#000000')
              .replace(/lch\([^)]*\)/gi, '#000000')
              .replace(/color-mix\([^)]*\)/gi, '#000000');

          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((tag) => {
            if (tag.textContent) {
              tag.textContent = sanitizeColors(tag.textContent);
            }
          });

          // 2. Sanitize any inline styles that might contain oklch
          const styledElements = clonedDoc.querySelectorAll('[style]');
          styledElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style?.cssText && /oklch|oklab|color-mix/i.test(htmlEl.style.cssText)) {
              htmlEl.style.cssText = sanitizeColors(htmlEl.style.cssText);
            }
          });

          // 3. Force exact standard A4 width (794px) on the cloned target element and ensure all ancestors are visible
          const targetEl = clonedDoc.getElementById(elementId);
          if (targetEl) {
            let parentNode: HTMLElement | null = targetEl.parentElement;
            while (parentNode) {
              parentNode.style.opacity = '1';
              parentNode.style.visibility = 'visible';
              parentNode = parentNode.parentElement;
            }
            targetEl.style.width = '794px';
            targetEl.style.minWidth = '794px';
            targetEl.style.maxWidth = '794px';
            targetEl.style.margin = '0 auto';
            targetEl.style.boxSizing = 'border-box';
            targetEl.style.display = 'block';
            targetEl.style.opacity = '1';
            targetEl.style.visibility = 'visible';
            targetEl.style.color = '#000000';
            targetEl.style.backgroundColor = '#ffffff';
          }

          // 4. Inject strict print style override with strong high-contrast solid typography and normal letter spacing
          const printStyle = clonedDoc.createElement('style');
          printStyle.textContent = `
            #${elementId} {
              width: 794px !important;
              min-width: 794px !important;
              max-width: 794px !important;
              box-sizing: border-box !important;
              margin: 0 auto !important;
              background-color: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
              text-rendering: optimizeLegibility !important;
              letter-spacing: normal !important;
              word-spacing: normal !important;
            }
            #${elementId} * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              letter-spacing: normal !important;
              word-spacing: normal !important;
              text-shadow: none !important;
            }
            #${elementId} h1, #${elementId} h2, #${elementId} h3 {
              letter-spacing: normal !important;
              word-break: normal !important;
              overflow-wrap: break-word !important;
            }
          `;
          clonedDoc.head.appendChild(printStyle);
        },
      });

      // Height in mm if placed at full 210mm width
      const fullWidthMmHeight = (canvas.height * pdfWidth) / canvas.width;
      const a4Ratio = pdfHeight / pdfWidth; // 1.4142857
      const idealCanvasA4Height = Math.floor(canvas.width * a4Ratio);

      // STRATEGY:
      // If content fits within 1 A4 page (or is up to 38% longer, e.g. 7-10 questions with notes):
      // AUTO-FIT ONTO ONE SINGLE CRISP A4 PAGE!
      // This completely prevents slicing and stops orphan blank pages with just 'Made by Mazen Mohamed'!
      if (fullWidthMmHeight <= pdfHeight * 1.38) {
        if (pdfPageCount > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const imgData = canvas.toDataURL('image/png');

        if (fullWidthMmHeight <= pdfHeight) {
          // Fits directly without scaling
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, fullWidthMmHeight, undefined, 'FAST');
        } else {
          // Scale smoothly to fit exactly inside A4 height, preserving aspect ratio and razor-sharp clarity
          const scale = pdfHeight / fullWidthMmHeight;
          const scaledWidth = pdfWidth * scale;
          const scaledHeight = pdfHeight;
          const offsetX = (pdfWidth - scaledWidth) / 2; // Center horizontally
          pdf.addImage(imgData, 'PNG', offsetX, 0, scaledWidth, scaledHeight, undefined, 'FAST');
        }
        pdfPageCount++;
      } else {
        // Exceptionally long content (more than 1.38 A4 pages):
        // Paginate across multiple pages, but NEVER create an orphan blank page for a small fragment or footer!
        let sourceY = 0;

        while (sourceY < canvas.height) {
          const remainingHeight = canvas.height - sourceY;

          // If what remains is less than 20% of an A4 page (e.g. just a footer or trailing note):
          // Do NOT create an orphan blank page! It is already represented or negligible.
          if (remainingHeight < idealCanvasA4Height * 0.20 && pdfPageCount > 0) {
            break;
          }

          let sliceHeight = Math.min(idealCanvasA4Height, remainingHeight);

          // If there is still substantial content after this slice, find a clean white gap between cards
          if (sourceY + sliceHeight < canvas.height) {
            const gapY = findCleanGap(canvas, sourceY, sliceHeight);
            // If cutting at the gap would leave an orphan sliver (< 20%) for the next page,
            // bundle the rest into this slice and scale it down slightly to fit!
            if (canvas.height - (sourceY + gapY) < idealCanvasA4Height * 0.20) {
              sliceHeight = canvas.height - sourceY;
            } else {
              sliceHeight = gapY;
            }
          }

          if (pdfPageCount > 0) {
            pdf.addPage('a4', 'portrait');
          }

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const sliceCtx = sliceCanvas.getContext('2d');

          if (sliceCtx) {
            sliceCtx.fillStyle = '#ffffff';
            sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceHeight);
            sliceCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sliceHeight,
              0, 0, canvas.width, sliceHeight
            );

            const sliceData = sliceCanvas.toDataURL('image/png');
            const sliceMmHeight = (sliceHeight * pdfWidth) / canvas.width;

            if (sliceMmHeight > pdfHeight) {
              const scale = pdfHeight / sliceMmHeight;
              const scaledW = pdfWidth * scale;
              const offX = (pdfWidth - scaledW) / 2;
              pdf.addImage(sliceData, 'PNG', offX, 0, scaledW, pdfHeight, undefined, 'FAST');
            } else {
              pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidth, sliceMmHeight, undefined, 'FAST');
            }
          }

          sliceCanvas.width = 0;
          sliceCanvas.height = 0;

          sourceY += sliceHeight;
          pdfPageCount++;
        }
      }

      // Free canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;

      // Yield briefly to keep UI progress bar responsive
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  if (onProgress) {
    onProgress(completedPages.length, completedPages.length, 'جاري تنزيل الملف...');
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const finalFilename = customFilename || `حلول-الكتاب-صفحة-بصفحة-${timestamp}.pdf`;
  pdf.save(finalFilename);
}

/**
 * Triggers native high-fidelity browser print dialog.
 */
export function printVectorPdf(): void {
  window.print();
}

/**
 * Exports full solutions as a structured Microsoft Word (.docx) document
 * Maintaining the exact 1-to-1 page alignment and handwriting OCR callouts.
 */
export async function generateAndDownloadDocx(
  pages: BookPage[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);
  if (completedPages.length === 0) {
    throw new Error('لا توجد صفحات مكتملة الحل لتصديرها.');
  }

  if (onProgress) {
    onProgress(1, 2, 'جاري بناء هيكل مستند Word (.docx)...');
  }

  const docChildren: Paragraph[] = [];

  // Document Title Header
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      children: [
        new TextRun({
          text: 'حلول كراستي · كتاب الطالب والتمارين النموذجية',
          bold: true,
          size: 32, // 16pt
          color: '1E3A8A',
        }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      children: [
        new TextRun({
          text: `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} · عدد الصفحات المحلولة: ${completedPages.length}`,
          size: 20,
          color: '64748B',
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Process each book page
  completedPages.forEach((page, pageIndex) => {
    const sol = page.solution!;

    // Page Break before each book page except the first
    if (pageIndex > 0) {
      docChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [],
        })
      );
    }

    // Page Header in DOCX
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `📄 صفحة ${page.pageNumber} من الكتاب الأصلي: ${sol.pageTitle || 'حلول التمارين'}`,
            bold: true,
            size: 28,
            color: '0F172A',
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        children: [
          new TextRun({
            text: `المادة المكتشفة: ${sol.detectedSubject || 'عام'} · إجمالي الأسئلة: ${sol.questions.length}`,
            italics: true,
            size: 20,
            color: '475569',
          }),
        ],
        spacing: { after: 150 },
      })
    );

    // Summary
    if (sol.pageSummary) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({ text: 'ملخص محتوى الصفحة: ', bold: true, color: '334155', size: 22 }),
            new TextRun({ text: sol.pageSummary, size: 22, color: '334155' }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Handwriting OCR Box Callout
    if (sol.handwrittenTranscription) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: '✍️ النصوص والحلول المكتوبة بخط اليد (مفرغة رقمياً):',
              bold: true,
              size: 22,
              color: 'B45309', // amber-700
            }),
          ],
          spacing: { before: 120, after: 80 },
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: sol.handwrittenTranscription,
              size: 20,
              color: '78350F',
            }),
          ],
          spacing: { after: 250 },
        })
      );
    }

    // Questions and Answers Header
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `📋 الأسئلة والحلول النموذجية (صفحة ${page.pageNumber}):`,
            bold: true,
            size: 24,
            color: '1E293B',
          }),
        ],
        spacing: { before: 200, after: 150 },
      })
    );

    // Items
    sol.questions.forEach((q, qIdx) => {
      // Question prompt
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: `${q.questionNumber || `سؤال ${qIdx + 1}`}: `,
              bold: true,
              size: 22,
              color: '1E3A8A',
            }),
            new TextRun({
              text: q.originalText,
              bold: true,
              size: 22,
              color: '0F172A',
            }),
            ...(q.questionType
              ? [
                  new TextRun({
                    text: ` [${q.questionType}]`,
                    italics: true,
                    size: 18,
                    color: '64748B',
                  }),
                ]
              : []),
          ],
          spacing: { before: 160, after: 80 },
        })
      );

      // Options
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt) => {
          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [new TextRun({ text: `• ${opt}`, size: 20, color: '475569' })],
              spacing: { after: 40 },
            })
          );
        });
      }

      // Final Answer Box
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [
            new TextRun({
              text: '✅ الإجابة النهائية المعتمدة: ',
              bold: true,
              size: 22,
              color: '065F46', // emerald-800
            }),
            new TextRun({
              text: q.finalAnswer,
              bold: true,
              size: 22,
              color: '047857',
            }),
          ],
          spacing: { before: 80, after: 80 },
        })
      );

      // Steps
      if (q.steps && q.steps.length > 0) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            children: [
              new TextRun({
                text: 'خطوات الحل والبرهان:',
                bold: true,
                size: 20,
                color: '334155',
              }),
            ],
            spacing: { before: 60, after: 40 },
          })
        );
        q.steps.forEach((st, sIdx) => {
          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              children: [
                new TextRun({
                  text: `${sIdx + 1}. ${st}`,
                  size: 20,
                  color: '334155',
                }),
              ],
              spacing: { after: 40 },
            })
          );
        });
      }

      // Explanation
      if (q.explanation) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            children: [
              new TextRun({ text: 'الشرح والتعليل: ', bold: true, size: 20, color: '475569' }),
              new TextRun({ text: q.explanation, size: 20, color: '475569' }),
            ],
            spacing: { before: 40, after: 60 },
          })
        );
      }

      // Tip / Note
      if (q.notesOrTips) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            children: [
              new TextRun({ text: '💡 تنبيه: ', bold: true, size: 18, color: 'D97706' }),
              new TextRun({ text: q.notesOrTips, size: 18, color: 'B45309' }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    });

    // Page Separator Note
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [
          new TextRun({
            text: `--- نهاية حل صفحة ${page.pageNumber} من الكتاب ---`,
            size: 18,
            color: '94A3B8',
          }),
        ],
        spacing: { before: 200, after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  if (onProgress) {
    onProgress(2, 2, 'جاري تنزيل ملف Word (.docx)...');
  }

  const blob = await Packer.toBlob(doc);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `حلول-الكتاب-صفحة-بصفحة-${timestamp}.docx`);
}

/**
 * Exports full solutions as a structured, plain text (.txt) file with UTF-8 BOM.
 */
export function generateAndDownloadTxt(pages: BookPage[]): void {
  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);
  if (completedPages.length === 0) {
    throw new Error('لا توجد صفحات مكتملة الحل لتصديرها.');
  }

  let txt = `================================================================================\n`;
  txt += `                   حلول كراستي · كتاب الطالب والتمارين النموذجية                   \n`;
  txt += `================================================================================\n`;
  txt += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')} | إجمالي الصفحات المحلولة: ${completedPages.length}\n\n`;

  completedPages.forEach((p) => {
    const sol = p.solution!;
    txt += `################################################################################\n`;
    txt += `[ صفحة رقم ${p.pageNumber} من الكتاب الأصلي ] : ${sol.pageTitle || 'بدون عنوان'}\n`;
    txt += `المادة: ${sol.detectedSubject || 'عام'}\n`;
    txt += `################################################################################\n\n`;

    if (sol.pageSummary) {
      txt += `* ملخص موضوع ومحتوى الصفحة:\n${sol.pageSummary}\n\n`;
    }

    if (sol.handwrittenTranscription) {
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `[✍️ تفريغ النصوص والحلول المكتوبة بخط اليد إلى نص رقمي دقيق]:\n`;
      txt += `--------------------------------------------------------------------------------\n`;
      txt += `${sol.handwrittenTranscription}\n\n`;
    }

    txt += `--------------------------------------------------------------------------------\n`;
    txt += `[ الأسئلة والحلول النموذجية - صفحة ${p.pageNumber} ] (${sol.questions.length} أسئلة)\n`;
    txt += `--------------------------------------------------------------------------------\n\n`;

    sol.questions.forEach((q, idx) => {
      txt += `سؤال ${idx + 1}) [${q.questionNumber || `سؤال ${idx + 1}`}] ${q.questionType ? `(${q.questionType})` : ''}:\n`;
      txt += `نص السؤال: ${q.originalText}\n\n`;

      if (q.options && q.options.length > 0) {
        txt += `الخيارات:\n`;
        q.options.forEach((opt) => (txt += `  - ${opt}\n`));
        txt += `\n`;
      }

      txt += `>>> ✅ الإجابة النهائية: ${q.finalAnswer}\n\n`;

      if (q.steps && q.steps.length > 0) {
        txt += `خطوات الحل والبرهان:\n`;
        q.steps.forEach((st, sIdx) => {
          txt += `  ${sIdx + 1}. ${st}\n`;
        });
        txt += `\n`;
      }

      if (q.explanation) {
        txt += `الشرح والتعليل: ${q.explanation}\n\n`;
      }

      if (q.notesOrTips) {
        txt += `💡 تنبيه: ${q.notesOrTips}\n\n`;
      }

      txt += `................................................................................\n\n`;
    });

    txt += `[نهاية حل الصفحة رقم ${p.pageNumber}]\n\n\n`;
  });

  // UTF-8 BOM to guarantee all editors display Arabic properly
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, txt], { type: 'text/plain;charset=utf-8' });
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `حلول-الكتاب-صفحة-بصفحة-${timestamp}.txt`);
}

/**
 * Exports full solutions as Markdown text
 */
export function exportToMarkdown(pages: BookPage[]): string {
  let md = `# حلول الكتاب الدراسي ومذكرات التمارين\n`;
  md += `*تاريخ التوليد: ${new Date().toLocaleDateString('ar-EG')}*\n\n---\n\n`;

  pages.forEach((p) => {
    if (!p.solution) return;
    md += `## 📄 الصفحة رقم ${p.pageNumber}: ${p.solution.pageTitle || 'بدون عنوان'}\n`;
    md += `**المادة:** ${p.solution.detectedSubject || 'عام'}\n\n`;

    if (p.solution.handwrittenTranscription) {
      md += `### ✍️ النص المكتوب بخط اليد (المفرغ رقمياً):\n`;
      md += `> ${p.solution.handwrittenTranscription.replace(/\n/g, '\n> ')}\n\n`;
    }

    md += `### 📋 الأسئلة والحلول النموذجية:\n\n`;
    p.solution.questions.forEach((q, idx) => {
      md += `#### ${q.questionNumber || `سؤال ${idx + 1}`}: ${q.originalText}\n`;
      if (q.questionType) md += `*النوع:* ${q.questionType}\n\n`;
      if (q.options && q.options.length > 0) {
        md += `*الخيارات:*\n`;
        q.options.forEach((opt) => (md += `- ${opt}\n`));
        md += `\n`;
      }
      md += `**✅ الإجابة النهائية:** ${q.finalAnswer}\n\n`;
      if (q.steps && q.steps.length > 0) {
        md += `**خطوات الحل:**\n`;
        q.steps.forEach((st, sIdx) => (md += `${sIdx + 1}. ${st}\n`));
        md += `\n`;
      }
      if (q.explanation) {
        md += `**الشرح والتعليل:** ${q.explanation}\n\n`;
      }
      if (q.notesOrTips) {
        md += `💡 *ملاحظة:* ${q.notesOrTips}\n\n`;
      }
      md += `---\n\n`;
    });
  });

  return md;
}
