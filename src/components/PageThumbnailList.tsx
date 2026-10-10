import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { BookPage } from '../types';

interface PageThumbnailListProps {
  pages: BookPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onDeletePage: (id: string) => void;
  onAddMoreClick: () => void;
}

export const PageThumbnailList: React.FC<PageThumbnailListProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onDeletePage,
  onAddMoreClick,
}) => {
  if (pages.length === 0) return null;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs no-print">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-bold text-slate-800">
          صفحات الكتاب ({pages.length} صفحة)
        </span>
        <button
          onClick={onAddMoreClick}
          className="text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة صفحات أخرى</span>
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;
          const isDone = page.status === 'completed';
          const isProcessing = page.status === 'processing';
          const isError = page.status === 'error';

          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(index)}
              className={`group relative shrink-0 w-24 h-32 rounded-xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col ${
                isActive
                  ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative flex-1 bg-slate-100 overflow-hidden">
                <img
                  src={page.imageDataUrl}
                  alt={`صفحة ${page.pageNumber}`}
                  className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-opacity"
                />

                {/* Status Overlay */}
                <div className="absolute top-1 right-1">
                  {isDone && (
                    <span className="bg-emerald-600 text-white p-0.5 rounded-full flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {isProcessing && (
                    <span className="bg-slate-900 text-white p-0.5 rounded-full flex items-center justify-center shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </span>
                  )}
                  {isError && (
                    <span className="bg-rose-600 text-white p-0.5 rounded-full flex items-center justify-center shadow-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Delete button hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-white/95 hover:bg-rose-600 text-slate-700 hover:text-white p-1 rounded-md shadow-xs transition-all cursor-pointer border border-slate-200"
                  title="حذف هذه الصفحة"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Label */}
              <div
                className={`py-1 px-1.5 text-center text-[11px] font-semibold transition-colors ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                صفحة {page.pageNumber}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
