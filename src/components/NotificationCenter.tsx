import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Pause,
  XCircle,
  Download,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { BackgroundTask, AppNotification } from '../types';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../utils/browserNotifications';

interface NotificationCenterProps {
  tasks: BackgroundTask[];
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onDismissNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  tasks,
  notifications,
  isOpen,
  onClose,
  onDismissNotification,
  onClearAllNotifications,
}) => {
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [permState, setPermState] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  const activeTask = tasks.find((t) => t.status === 'running' || t.status === 'paused');
  const recentCompletedTask = tasks.find(
    (t) => t.status === 'completed' && t.completedAt && Date.now() - t.completedAt < 8000
  );

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermState(granted ? 'granted' : 'denied');
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING LIVE PROGRESS DOCK (Always visible during active background jobs) */}
      {/* ========================================================================= */}
      {(activeTask || recentCompletedTask) && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm w-full no-print transition-all duration-300">
          {activeTask && (
            <div
              className="bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border border-amber-500/40 relative overflow-hidden ring-1 ring-amber-500/30"
              style={{
                boxShadow: '0 10px 30px -5px rgba(217, 119, 6, 0.25), 0 8px 16px -6px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Top Accent Glowing Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500"
                style={{
                  width: `${activeTask.progress}%`,
                  transition: 'width 0.4s ease',
                }}
              />

              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white truncate">
                        {activeTask.title}
                      </h4>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-400/30 shrink-0">
                        خلفية ⚡
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {activeTask.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {activeTask.progress}%
                  </span>
                  <button
                    onClick={() => setIsDockMinimized(!isDockMinimized)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                    title={isDockMinimized ? 'تكبير' : 'تصغير'}
                  >
                    {isDockMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {!isDockMinimized && (
                <>
                  {/* Smooth Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2.5 border border-slate-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.max(5, activeTask.progress)}%` }}
                    />
                  </div>

                  {/* Actions & Controls */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">
                      {activeTask.totalSteps && activeTask.currentStep !== undefined
                        ? `تم إنجاز ${activeTask.currentStep} من ${activeTask.totalSteps}`
                        : 'جاري المعالجة المتوازية...'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {activeTask.onPause && (
                        <button
                          onClick={activeTask.status === 'paused' ? activeTask.onResume : activeTask.onPause}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                        >
                          {activeTask.status === 'paused' ? (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current text-amber-400" />
                              <span>استئناف</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-2.5 h-2.5 text-slate-300" />
                              <span>إيقاف مؤقت</span>
                            </>
                          )}
                        </button>
                      )}

                      {activeTask.onCancel && (
                        <button
                          onClick={activeTask.onCancel}
                          className="px-2 py-0.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-800/50"
                        >
                          <XCircle className="w-2.5 h-2.5" />
                          <span>إلغاء</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Completed Task Auto-toast */}
          {!activeTask && recentCompletedTask && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/60 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">
                      تم الانتهاء بنجاح! ({recentCompletedTask.title})
                    </h4>
                    <p className="text-[11px] text-emerald-300 mt-0.5">
                      {recentCompletedTask.description || 'تم اكتمال المعالجة وتجهيز الملف بالكامل.'}
                    </p>
                  </div>
                </div>

                {recentCompletedTask.onDownload && (
                  <button
                    onClick={recentCompletedTask.onDownload}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NOTIFICATIONS DRAWER / MODAL PANEL (Opened via Top Header Bell) */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-slate-950/40 backdrop-blur-xs no-print">
          <div
            className="w-full sm:max-w-md bg-white border border-slate-200 rounded-none sm:rounded-2xl shadow-2xl h-full sm:h-auto max-h-screen sm:max-h-[85vh] flex flex-col overflow-hidden"
            style={{ direction: 'rtl' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    مركز الإشعارات والمهام في الخلفية
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    متابعة تقدم الحل والتحميلات والإشعارات
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    title="مسح كل الإشعارات"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Browser Notification Permission Banner */}
              {isNotificationSupported() && permState !== 'granted' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="font-black block">إشعارات المتصفح الفورية</span>
                    <span className="text-[11px] text-amber-800">
                      فعّل التنبيهات لتصلك رسالة عند انتهاء حل الكتاب أثناء تصفح مواقع أخرى.
                    </span>
                  </div>
                  <button
                    onClick={handleRequestPermission}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-2xs cursor-pointer transition-colors"
                  >
                    تفعيل التنبيهات
                  </button>
                </div>
              )}

              {/* Active Background Tasks List */}
              {tasks.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>المهام التي تعمل في الخلفية ({tasks.length})</span>
                  </h4>

                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {task.title}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                              task.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : task.status === 'error'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {task.status === 'completed'
                              ? 'مكتمل بنجاح'
                              : task.status === 'error'
                              ? 'تعثر'
                              : `${task.progress}%`}
                          </span>
                        </div>

                        {task.onDownload && (
                          <button
                            onClick={task.onDownload}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3 h-3" />
                            <span>تحميل</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-emerald-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notifications History */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>سجل الإشعارات ({notifications.length})</span>
                </h4>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Bell className="w-8 h-8 mx-auto stroke-1 opacity-50" />
                    <p className="text-xs">لا توجد إشعارات سابقة حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 transition-colors ${
                          notif.type === 'success'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : notif.type === 'error'
                            ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                            : notif.type === 'warning'
                            ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {notif.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : notif.type === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                            ) : notif.type === 'warning' ? (
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">{notif.title}</div>
                            <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            {notif.actionLabel && notif.onAction && (
                              <button
                                onClick={notif.onAction}
                                className="mt-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 font-bold text-[10px] text-slate-900 hover:bg-slate-100 flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>{notif.actionLabel}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onDismissNotification(notif.id)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
