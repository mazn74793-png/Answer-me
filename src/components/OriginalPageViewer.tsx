import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { BookPage } from '../types';

interface OriginalPageViewerProps {
  page: BookPage;
}

export const OriginalPageViewer: React.FC<OriginalPageViewerProps> = ({ page }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-xs transition-all ${
        isExpanded
          ? 'fixed inset-4 z-50 shadow-2xl bg-white backdrop-blur-xl border-slate-300'
          : 'h-full min-h-[550px]'
      }`}
    >
      {/* Top Bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">صفحة الكتاب الأصلية</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-700 font-semibold">صفحة {page.pageNumber}</span>
          {page.originalFilename && (
            <span className="text-slate-400 hidden sm:inline truncate max-w-[150px]">
              ({page.originalFilename})
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={handleZoomIn}
            title="تكبير"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="تصغير"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRotate}
            title="تدوير الصورة"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 hover:bg-white text-[11px] text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer font-medium"
          >
            100%
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'تصغير' : 'ملء الشاشة'}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Image Container with Pan / Zoom */}
      <div className="flex-1 bg-slate-100/70 overflow-auto flex items-center justify-center p-4 min-h-[450px]">
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          <img
            src={page.imageDataUrl}
            alt={`صفحة كتاب رقم ${page.pageNumber}`}
            className="max-h-[750px] w-auto object-contain rounded-xl shadow-md border border-slate-200 select-none pointer-events-auto bg-white"
          />
        </div>
      </div>
    </div>
  );
};
