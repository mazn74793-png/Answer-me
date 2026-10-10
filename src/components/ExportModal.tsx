import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Copy,
  Check,
  Loader2,
  FileCode,
  FileType,
} from 'lucide-react';
import { BookPage } from '../types';
import {
  generateAndDownloadPdf,
  generateAndDownloadDocx,
  generateAndDownloadTxt,
  printVectorPdf,
  exportToMarkdown,
} from '../utils/pdfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: BookPage[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, pages }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHandwriting, setCopiedHandwriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);

  // 1. Download PDF
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setError(null);
    try {
      await generateAndDownloadPdf(pages, (curr, total, msg) => {
        setExportProgress(`${msg} (${curr}/${total})`);
      });
      setIsExporting(false);
      setExportProgress(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'فشل توليد ملف الـ PDF.');
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 2. Download Word (.docx)
  const handleDownloadDocx = async () => {
    setIsExporting(true);
    setError(null);
    try {
      await generateAndDownloadDocx(pages, (curr, total, msg) => {
        setExportProgress(msg);
      });
      setIsExporting(false);
      setExportProgress(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'فشل توليد مستند Word (.docx).');
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 3. Download Plain Text (.txt)
  const handleDownloadTxt = () => {
    try {
      generateAndDownloadTxt(pages);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'فشل توليد الملف النصي (.txt).');
    }
  };

  // 4. Print / Vector PDF
  const handlePrint = () => {
    printVectorPdf();
  };

  // 5. Copy Markdown
  const handleCopyMarkdown = () => {
    const md = exportToMarkdown(completedPages);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  // 6. Copy Handwritten OCR
  const handleCopyAllHandwriting = () => {
    const texts = completedPages
      .filter((p) => p.solution?.handwrittenTranscription)
      .map(
        (p) =>
          `[صفحة ${p.pageNumber}]:\n${p.solution?.handwrittenTranscription}`
      )
      .join('\n\n---\n\n');

    if (!texts) {
      alert('لا توجد نصوص مكتوبة بخط اليد في الصفحات المحلولة.');
      return;
    }

    navigator.clipboard.writeText(texts);
    setCopiedHandwriting(true);
    setTimeout(() => setCopiedHandwriting(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                تصدير الحلول بالصيغ المعتمدة
              </h3>
              <p className="text-xs text-slate-500">
                مستندات PDF جاهزة · Microsoft Word (.docx) · نصوص (.txt)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <span>الصفحات الجاهزة للتصدير والتجميع:</span>
          <span className="font-bold text-slate-900">
            {completedPages.length} صفحة من إجمالي {pages.length}
          </span>
        </div>

        {/* Export Options Cards */}
        <div className="space-y-3">
          {/* 1. Direct PDF File (PRIMARY #1) */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting || completedPages.length === 0}
            className="w-full text-right p-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 shadow-md ring-2 ring-slate-950"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
                {isExporting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                ) : (
                  <FileText className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>تحميل ملف PDF مدمج ومفصل (.pdf)</span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                    الخيار الأساسي المعتمد
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  تصدير كتاب الحلول كاملاً بدقة A4 عالية، عرض كامل، خط عربي مريح، وتنسيق أنيق
                </p>
              </div>
            </div>
          </button>

          {/* 2. Microsoft Word Document (.docx) */}
          <button
            onClick={handleDownloadDocx}
            disabled={isExporting || completedPages.length === 0}
            className="w-full text-right p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 shadow-2xs hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <FileType className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>مستند Microsoft Word (.docx)</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
                    توليد فوري
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  فواصل صفحات تلقائية، نصوص عربية منسقة، مربعات إجابات ملونة، وتفريغ كامل لخط اليد
                </p>
              </div>
            </div>
          </button>

          {/* 3. Vector Print / Instant PDF */}
          <button
            onClick={handlePrint}
            disabled={completedPages.length === 0}
            className="w-full text-right p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 shadow-2xs hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>طباعة المتصفح أو حفظ كـ PDF فوري</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    طباعة مباشرة
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  طباعة مباشرة عبر نافذة طباعة المتصفح
                </p>
              </div>
            </div>
          </button>

          {/* 4. Plain Text File (.txt) */}
          <button
            onClick={handleDownloadTxt}
            disabled={completedPages.length === 0}
            className="w-full text-right p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 shadow-2xs hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>ملف نصي سريع (.txt)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium border border-slate-200">
                    UTF-8 BOM
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  فواصل منظمة لكل صفحة وأرقام الأسئلة والإجابات المعتمدة بتنسيق نصوص خفيف
                </p>
              </div>
            </div>
          </button>

          {/* Additional text export options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyMarkdown}
              disabled={completedPages.length === 0}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-medium"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'تم نسخ النص' : 'نسخ Markdown'}</span>
            </button>

            <button
              onClick={handleCopyAllHandwriting}
              disabled={completedPages.length === 0}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-medium"
            >
              {copiedHandwriting ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHandwriting ? 'تم نسخ خط اليد' : 'تفريغ خط اليد فقط'}</span>
            </button>
          </div>
        </div>

        {/* Progress status */}
        {isExporting && exportProgress && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-slate-800 shrink-0" />
            <span>{exportProgress}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
