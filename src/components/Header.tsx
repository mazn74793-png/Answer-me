import React from 'react';
import { Printer, Trash2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  totalPages: number;
  solvedPagesCount: number;
  isProcessingAny: boolean;
  onClearAll: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalPages,
  solvedPagesCount,
  isProcessingAny,
  onClearAll,
  onOpenExportModal,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand with App Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-slate-800">
            <img src="/pwa-192x192.png" alt="شعار كراستي" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                حلول كراستي
              </h1>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                · المنصة الأكاديمية لحل الكتب
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:flex items-center gap-2">
              <span>حل صفحات الكتب وتفريغ الخط اليدوي وتصديرها بصيغ PDF و Word و TXT</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Made by Mazen Mohamed
              </span>
            </p>
          </div>
        </div>

        {/* Status, PWA Install & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {totalPages > 0 && (
            <div className="text-[11px] sm:text-xs text-slate-600 flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200">
              <span>الصفحات: <strong className="text-slate-900">{totalPages}</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-700 font-semibold">المحلولة: {solvedPagesCount}</span>
            </div>
          )}

          {solvedPagesCount > 0 && (
            <button
              onClick={onOpenExportModal}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>تصدير الحلول ({solvedPagesCount})</span>
            </button>
          )}

          {totalPages > 0 && (
            <button
              onClick={onClearAll}
              disabled={isProcessingAny}
              title="مسح كافة الصفحات والبدء من جديد"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
