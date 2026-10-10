import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader2, Sparkles, Camera } from 'lucide-react';
import { convertPdfToPageImages, convertImageFileToDataUrl } from '../utils/pdfHelper';
import { createSampleBookPage } from '../utils/sampleData';
import { BookPage } from '../types';

interface UploadZoneProps {
  onPagesAdded: (newPages: BookPage[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onPagesAdded,
  isLoading,
  setIsLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadProgress, setLoadProgress] = useState<string | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    setLoadProgress('جاري قراءة واستخراج الصفحات...');

    const newPages: BookPage[] = [];
    const timestamp = Date.now();

    try {
      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          setLoadProgress(`جاري معالجة صفحات الـ PDF: ${file.name}...`);
          const pageImages = await convertPdfToPageImages(file, (curr, total) => {
            setLoadProgress(`استخراج صفحة ${curr} من ${total} من ملف PDF...`);
          });

          pageImages.forEach((imgUrl, idx) => {
            newPages.push({
              id: `page-${timestamp}-${f}-${idx + 1}`,
              pageNumber: idx + 1,
              originalFilename: file.name,
              imageDataUrl: imgUrl,
              status: 'idle',
            });
          });
        } else if (file.type.startsWith('image/')) {
          setLoadProgress(`جاري تجهيز الصورة: ${file.name}...`);
          const imgUrl = await convertImageFileToDataUrl(file);
          newPages.push({
            id: `page-${timestamp}-${f}`,
            pageNumber: f + 1,
            originalFilename: file.name,
            imageDataUrl: imgUrl,
            status: 'idle',
          });
        }
      }

      if (newPages.length > 0) {
        onPagesAdded(newPages);
      }
    } catch (err: any) {
      console.error('Error loading files:', err);
      alert('حدث خطأ أثناء تحميل الملفات: ' + (err?.message || 'يرجى التأكد من صحة الملف.'));
    } finally {
      setIsLoading(false);
      setLoadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleLoadSample = () => {
    setIsLoading(true);
    setLoadProgress('جاري تجهيز صفحتين توضيحيتين بنصوص وخط يد...');
    setTimeout(() => {
      const page1Img = createSampleBookPage(1);
      const page2Img = createSampleBookPage(2);
      const samplePages: BookPage[] = [
        {
          id: `sample-p1-${Date.now()}`,
          pageNumber: 1,
          originalFilename: 'كتاب_الرياضيات_صفحة_١.png',
          imageDataUrl: page1Img,
          status: 'idle',
        },
        {
          id: `sample-p2-${Date.now()}`,
          pageNumber: 2,
          originalFilename: 'كتاب_اللغة_العربية_صفحة_٢.png',
          imageDataUrl: page2Img,
          status: 'idle',
        },
      ];
      onPagesAdded(samplePages);
      setIsLoading(false);
      setLoadProgress(null);
    }, 300);
  };

  return (
    <div className="w-full">
      {/* Standard File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            processFiles(e.target.files);
          }
        }}
      />

      {/* Direct Mobile Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            processFiles(e.target.files);
          }
        }}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-14 text-center transition-all cursor-pointer bg-white ${
          dragActive
            ? 'border-slate-800 bg-slate-50/70 shadow-sm'
            : 'border-slate-300 hover:border-slate-400 shadow-xs'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-10 h-10 text-slate-800 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-900">{loadProgress || 'جاري المعالجة...'}</p>
            <p className="text-xs text-slate-500 mt-1">يتم تحضير الصفحات وتقسيمها بدقة...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>

            <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-2">
              ارفع كتاب مدرسي (PDF) أو صور صفحات المذكرات
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mb-6 leading-relaxed px-2">
              يدعم ملفات الكتب متعددة الصفحات (PDF) وصور الكاميرا والماسح الضوئي.
              يقوم النظام بالتعرف الآلي على الخط اليدوي والنصوص المطبوعة وتفريغها وحلها بدقة.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>اختيار ملفات أو PDF</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-700" />
                <span>تصوير بالكاميرا</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>صفحتين للتجربة</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <FileText className="w-3.5 h-3.5" /> PDF كامل
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <ImageIcon className="w-3.5 h-3.5" /> صور PNG, JPG
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">تفريغ دقيق للخط اليدوي</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
