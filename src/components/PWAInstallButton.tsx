import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, hide install button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>تطبيق مثبت</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer border border-slate-800 hover:border-slate-700"
        title="تثبيت التطبيق على الهاتف أو الكمبيوتر"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow (or fallback mobile button)
  return (
    <>
      <button
        onClick={() => {
          if (isIOS) {
            setShowIOSGuide(true);
          } else {
            // General guidance for browsers
            alert('لتثبيت التطبيق: افتح قائمة خيارات المتصفح (⋮) واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
          }
        }}
        className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        title="تثبيت التطبيق على الشاشة الرئيسية"
      >
        <Smartphone className="w-3.5 h-3.5 text-slate-700" />
        <span>تثبيت التطبيق</span>
      </button>

      {/* iOS Safari Guided Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 no-print">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/pwa-192x192.png" alt="لوجو كراستي" className="w-8 h-8 rounded-lg shadow-xs" />
                <h3 className="text-sm font-bold text-slate-900">تثبيت التطبيق على iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  اضغط على زر <strong>المشاركة (Share)</strong>{' '}
                  <Share className="w-3.5 h-3.5 inline text-blue-600 mx-1" /> في شريط متصفح Safari بالأسفل.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  مرر للأسفل واضغط على خيار{' '}
                  <strong>«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600 mx-1" />.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  اضغط على <strong>«إضافة» (Add)</strong>، وسيظهر التطبيق فوراً بأيقونته الرسمية على شاشة هاتفك مثل أي تطبيق متجر!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
