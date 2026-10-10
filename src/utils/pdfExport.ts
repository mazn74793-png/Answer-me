import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
 * Exports all completed book pages into a single formatted PDF file.
 */
export async function generateAndDownloadPdf(
  pages: BookPage[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);
  if (completedPages.length === 0) {
    throw new Error('لا توجد صفحات مكتملة الحل لتصديرها.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210; // mm
  const pdfHeight = 297; // mm

  for (let i = 0; i < completedPages.length; i++) {
    const page = completedPages[i];
    const elementId = `pdf-page-container-${page.id}`;
    const element = document.getElementById(elementId);

    if (onProgress) {
      onProgress(i + 1, completedPages.length, `جاري تجهيز صفحة الحل رقم ${page.pageNumber}...`);
    }

    if (element) {
      const canvas = await html2canvas(element, {
        scale: 1.25, // Optimized 1.25 scale: fast rendering, crisp A4 quality, lightweight memory
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Remove all external stylesheets/styles that might contain Tailwind OKLCH variables
          const stylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          stylesheets.forEach((s) => s.remove());

          // 2. Scan and sanitize all elements in the cloned DOM to ensure no oklch strings exist
          const allClonedElements = clonedDoc.querySelectorAll('*');
          allClonedElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Remove Tailwind inline style artifacts if any
            if (htmlEl.style) {
              const cssText = htmlEl.style.cssText;
              if (cssText && cssText.includes('oklch')) {
                htmlEl.style.cssText = cssText.replace(/oklch\([^)]+\)/gi, '#0f172a');
              }
            }
          });

          // 3. Inject pure, standard CSS without any OKLCH functions
          const cleanStyle = clonedDoc.createElement('style');
          cleanStyle.textContent = `
            * { box-sizing: border-box; }
            body { font-family: 'Cairo', -apple-system, sans-serif !important; background-color: #ffffff !important; color: #0f172a !important; margin: 0; padding: 0; }
            .print-page { background-color: #ffffff !important; color: #0f172a !important; font-family: 'Cairo', -apple-system, sans-serif !important; }
            img { max-width: 100%; height: auto; }
          `;
          clonedDoc.head.appendChild(cleanStyle);
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.80);
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const fittedW = imgWidth * ratio;
        const fittedH = imgHeight * ratio;
        const marginX = (pdfWidth - fittedW) / 2;
        pdf.addImage(imgData, 'JPEG', marginX, 0, fittedW, fittedH);
      }

      // Free canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;

      // Yield briefly to keep UI progress bar responsive
      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }
  }

  if (onProgress) {
    onProgress(completedPages.length, completedPages.length, 'جاري تنزيل الملف...');
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  pdf.save(`حلول-الكتاب-صفحة-بصفحة-${timestamp}.pdf`);
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
