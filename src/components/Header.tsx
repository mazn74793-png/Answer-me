import React from 'react';
import { Printer, Trash2, HardDrive, Bell, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  totalPages: number;
  solvedPagesCount: number;
  isProcessingAny: boolean;
  lastSavedTime?: string | null;
  notificationsCount?: number;
  activeTasksCount?: number;
  onOpenNotificationCenter?: () => void;
  onClearAll: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalPages,
  solvedPagesCount,
  isProcessingAny,
  lastSavedTime,
  notificationsCount = 0,
  activeTasksCount = 0,
  onOpenNotificationCenter,
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                حلول كراستي
              </h1>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                · المنصة الأكاديمية لحل الكتب
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden lg:flex items-center gap-2 mt-0.5">
              <span>حل صفحات الكتب وتفريغ الخط اليدوي وتصديرها بصيغ PDF و Word و TXT</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Made by Mazen Mohamed
              </span>
            </p>
          </div>
        </div>

        {/* Status, Notifications, PWA Install & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Auto-save Status Badge */}
          {totalPages > 0 && (
            <div
              className="text-[11px] sm:text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs font-medium"
              title="يتم حفظ جميع الصفحات والحلول تلقائياً في المتصفح، ولن تضيع عند إعادة تحميل الصفحة"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>محفوظ تلقائياً</span>
              {lastSavedTime && (
                <span className="text-[10px] text-emerald-600 hidden sm:inline">({lastSavedTime})</span>
              )}
            </div>
          )}

          {/* Active Background Tasks Indicator / Notification Center Bell */}
          {onOpenNotificationCenter && (
            <button
              onClick={onOpenNotificationCenter}
              title="مركز الإشعارات والمهام في الخلفية"
              className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTasksCount > 0
                  ? 'bg-amber-500/10 border-amber-400 text-amber-800 ring-2 ring-amber-400/30'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              {activeTasksCount > 0 ? (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                  <span className="text-[11px] font-black text-amber-900 hidden sm:inline">
                    {activeTasksCount} بالخلفية
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute -top-0.5 -right-0.5" />
                </div>
              ) : notificationsCount > 0 ? (
                <span className="text-[10px] font-bold bg-slate-900 text-white rounded-full px-1.5 py-0.2">
                  {notificationsCount}
                </span>
              ) : null}
            </button>
          )}

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
