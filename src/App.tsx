import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  FileText,
  Printer,
  Play,
  Pause,
  XCircle,
  Eye,
  CheckCircle2,
  Download,
  FileType,
  FileCode,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { PageThumbnailList } from './components/PageThumbnailList';
import { OriginalPageViewer } from './components/OriginalPageViewer';
import { SolutionCard } from './components/SolutionCard';
import { PrintableBookPdf } from './components/PrintableBookPdf';
import { RefineQuestionModal } from './components/RefineQuestionModal';
import { ExportModal } from './components/ExportModal';
import {
  BookPage,
  QuestionItem,
  SolverMode,
  SubjectType,
  SolutionDepth,
} from './types';
import { convertPdfToPageImages, convertImageFileToDataUrl } from './utils/pdfHelper';
import {
  generateAndDownloadPdf,
  generateAndDownloadDocx,
  generateAndDownloadTxt,
} from './utils/pdfExport';
import {
  loadSavedPages,
  savePagesToStorage,
  clearSavedStorage,
  loadSettings,
  saveSettings,
  loadActivePageIndex,
  saveActivePageIndex,
} from './utils/storage';

export default function App() {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [solverMode, setSolverMode] = useState<SolverMode>('full-solve');
  const [subject, setSubject] = useState<SubjectType>('general');
  const [solutionDepth, setSolutionDepth] = useState<SolutionDepth>('detailed');

  const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);
  const [isBatchSolving, setIsBatchSolving] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentPageNum: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'workspace' | 'pdf-preview'>('workspace');
  const [pdfMode, setPdfMode] = useState<'answers-only' | 'full'>('answers-only');
  const [pdfFontSize, setPdfFontSize] = useState<'compact' | 'standard'>('compact');
  const [showPdfPageThumbnail, setShowPdfPageThumbnail] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [refineQuestion, setRefineQuestion] = useState<QuestionItem | null>(null);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'original' | 'solution'>('solution');

  // Auto-save state
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<any>(null);

  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const cancelRequestedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  // 1. Initial Load from browser storage on mount
  useEffect(() => {
    async function initFromStorage() {
      try {
        const savedPages = await loadSavedPages();
        if (savedPages && savedPages.length > 0) {
          setPages(savedPages);
          const savedIdx = loadActivePageIndex();
          if (savedIdx >= 0 && savedIdx < savedPages.length) {
            setActivePageIndex(savedIdx);
          }
          const nowStr = new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastSavedTime(nowStr);
        }

        const savedSettings = loadSettings();
        if (savedSettings) {
          if (savedSettings.solverMode) setSolverMode(savedSettings.solverMode as SolverMode);
          if (savedSettings.subject) setSubject(savedSettings.subject as SubjectType);
          if (savedSettings.solutionDepth) setSolutionDepth(savedSettings.solutionDepth as SolutionDepth);
          if (savedSettings.pdfMode) setPdfMode(savedSettings.pdfMode);
          if (savedSettings.pdfFontSize) setPdfFontSize(savedSettings.pdfFontSize);
          if (typeof savedSettings.showPdfPageThumbnail === 'boolean') {
            setShowPdfPageThumbnail(savedSettings.showPdfPageThumbnail);
          }
        }
      } catch (err) {
        console.error('Failed to load saved state from storage:', err);
      } finally {
        setIsLoadedFromStorage(true);
      }
    }
    initFromStorage();
  }, []);

  // 2. Debounced Auto-save to browser storage whenever pages change
  useEffect(() => {
    if (!isLoadedFromStorage) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await savePagesToStorage(pages);
        saveActivePageIndex(activePageIndex);
        if (pages.length > 0) {
          const nowStr = new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastSavedTime(nowStr);
        } else {
          setLastSavedTime(null);
        }
      } catch (err) {
        console.warn('Auto-save error:', err);
      }
    }, 600); // 600ms debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [pages, activePageIndex, isLoadedFromStorage]);

  // 3. Save settings whenever user toggles preferences
  useEffect(() => {
    if (!isLoadedFromStorage) return;
    saveSettings({
      solverMode,
      subject,
      solutionDepth,
      pdfMode,
      pdfFontSize,
      showPdfPageThumbnail,
    });
  }, [solverMode, subject, solutionDepth, pdfMode, pdfFontSize, showPdfPageThumbnail, isLoadedFromStorage]);

  const activePage = pages[activePageIndex] || null;
  const completedCount = pages.filter((p) => p.status === 'completed').length;
  const isAnyProcessing = pages.some((p) => p.status === 'processing') || isBatchSolving;

  // Single page solver with automatic client retry on 503/temporary network hiccups
  const solveSinglePage = async (page: BookPage): Promise<boolean> => {
    // Mark target page as processing
    setPages((prev) =>
      prev.map((p) => (p.id === page.id ? { ...p, status: 'processing', errorMessage: undefined } : p))
    );

    const payload = {
      imageBase64: page.imageDataUrl,
      pageNumber: page.pageNumber,
      mode: solverMode,
      subject,
      solutionDepth,
      language: 'ar',
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await fetch('/api/solve-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const resData = await response.json();

        if (!response.ok || !resData.success) {
          const errMsg = resData.error || 'فشلت معالجة الصفحة.';
          // If 503 or transient, retry after delay
          if ((response.status === 503 || errMsg.includes('503') || errMsg.includes('high demand')) && attempts < maxAttempts) {
            console.warn(`[Client Retry] 503 hit on page ${page.pageNumber}, waiting 3s (attempt ${attempts}/${maxAttempts})...`);
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }
          throw new Error(errMsg);
        }

        // Successfully solved
        setPages((prev) =>
          prev.map((p) =>
            p.id === page.id
              ? {
                  ...p,
                  status: 'completed',
                  solution: resData.data,
                }
              : p
          )
        );
        return true;
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          console.error(`Final error solving page ${page.pageNumber}:`, err);
          setPages((prev) =>
            prev.map((p) =>
              p.id === page.id
                ? {
                    ...p,
                    status: 'error',
                    errorMessage: err?.message || 'حدث خطأ أثناء معالجة الصفحة.',
                  }
                : p
            )
          );
          return false;
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
    }

    return false;
  };

  // Full Book Auto Solver: Solves all pages with controlled concurrency for maximum speed
  const startFullBookSolve = async (allPagesList: BookPage[]) => {
    if (isBatchSolving) return;
    setIsBatchSolving(true);
    setIsPaused(false);
    cancelRequestedRef.current = false;
    setShowCelebrationBanner(false);

    const total = allPagesList.length;
    let solvedSoFar = allPagesList.filter((p) => p.status === 'completed').length;

    // Queue of pages needing solution
    const queue = allPagesList.filter((p) => p.status !== 'completed');
    if (queue.length === 0) {
      setIsBatchSolving(false);
      return;
    }

    setBatchProgress({
      current: solvedSoFar,
      total,
      currentPageNum: queue[0]?.pageNumber || 1,
    });

    // Run with concurrency of 4 workers in parallel for 4x speedup on large books
    const concurrency = Math.min(4, queue.length);
    let queueIndex = 0;

    const runWorker = async () => {
      while (queueIndex < queue.length && !cancelRequestedRef.current) {
        while (isPausedRef.current && !cancelRequestedRef.current) {
          await new Promise((r) => setTimeout(r, 300));
        }
        if (cancelRequestedRef.current) break;

        const nextIndex = queueIndex++;
        if (nextIndex >= queue.length) break;

        const currentPage = queue[nextIndex];
        setBatchProgress({
          current: solvedSoFar,
          total,
          currentPageNum: currentPage.pageNumber,
        });

        const success = await solveSinglePage(currentPage);
        if (success) {
          solvedSoFar++;
        }

        setBatchProgress({
          current: solvedSoFar,
          total,
          currentPageNum: currentPage.pageNumber,
        });
      }
    };

    const workers = [];
    for (let w = 0; w < concurrency; w++) {
      workers.push(runWorker());
    }

    await Promise.all(workers);

    setIsBatchSolving(false);
    setBatchProgress(null);

    // If all pages completed, trigger celebration banner
    if (solvedSoFar >= total && total > 0 && !cancelRequestedRef.current) {
      setShowCelebrationBanner(true);
    }
  };

  // Add newly uploaded pages AND automatically start solving the entire book!
  const handlePagesAdded = (newPages: BookPage[]) => {
    const updatedList = [...pages, ...newPages].map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
    }));

    setPages(updatedList);
    if (pages.length === 0 && newPages.length > 0) {
      setActivePageIndex(0);
    }

    // Automatically solve the entire book immediately!
    setTimeout(() => {
      startFullBookSolve(updatedList);
    }, 150);
  };

  // Add more files from thumbnail bar
  const handleAddMoreFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsLoadingUpload(true);
    try {
      const newPages: BookPage[] = [];
      const timestamp = Date.now();

      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const pageImages = await convertPdfToPageImages(file);
          pageImages.forEach((imgUrl, idx) => {
            newPages.push({
              id: `page-${timestamp}-${f}-${idx + 1}`,
              pageNumber: pages.length + newPages.length + 1,
              originalFilename: file.name,
              imageDataUrl: imgUrl,
              status: 'idle',
            });
          });
        } else if (file.type.startsWith('image/')) {
          const imgUrl = await convertImageFileToDataUrl(file);
          newPages.push({
            id: `page-${timestamp}-${f}`,
            pageNumber: pages.length + newPages.length + 1,
            originalFilename: file.name,
            imageDataUrl: imgUrl,
            status: 'idle',
          });
        }
      }

      if (newPages.length > 0) {
        handlePagesAdded(newPages);
      }
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة الصفحات: ' + (err?.message || ''));
    } finally {
      setIsLoadingUpload(false);
      if (addMoreInputRef.current) addMoreInputRef.current.value = '';
    }
  };

  // Delete page
  const handleDeletePage = (id: string) => {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    });
    if (activePageIndex >= pages.length - 1) {
      setActivePageIndex(Math.max(0, pages.length - 2));
    }
  };

  // Clear all pages
  const handleClearAll = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الصفحات والحلول المخزنة في المتصفح؟')) {
      cancelRequestedRef.current = true;
      setIsBatchSolving(false);
      setPages([]);
      setActivePageIndex(0);
      setBatchProgress(null);
      setShowCelebrationBanner(false);
      setLastSavedTime(null);
      await clearSavedStorage();
    }
  };

  // Cancel ongoing batch solve
  const handleCancelBatchSolve = () => {
    cancelRequestedRef.current = true;
    setIsBatchSolving(false);
    setBatchProgress(null);
  };

  // Update question within current page
  const handleUpdateQuestion = (updatedQ: QuestionItem) => {
    if (!activePage || !activePage.solution) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePageIndex || !p.solution) return p;
        const newQuestions = p.solution.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
        return {
          ...p,
          solution: {
            ...p.solution,
            questions: newQuestions,
          },
        };
      })
    );
  };

  // Update handwriting transcription
  const handleUpdateHandwritingText = (newText: string) => {
    if (!activePage || !activePage.solution) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePageIndex || !p.solution) return p;
        return {
          ...p,
          solution: {
            ...p.solution,
            handwrittenTranscription: newText,
          },
        };
      })
    );
  };

  // Apply refinement from AI modal
  const handleApplyRefinement = (updatedFields: Partial<QuestionItem>) => {
    if (!refineQuestion || !activePage || !activePage.solution) return;
    const updated: QuestionItem = {
      ...refineQuestion,
      ...updatedFields,
    };
    handleUpdateQuestion(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Hidden file input for adding more pages */}
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => handleAddMoreFiles(e.target.files)}
      />

      {/* Top Header */}
      <Header
        totalPages={pages.length}
        solvedPagesCount={completedCount}
        isProcessingAny={isAnyProcessing}
        lastSavedTime={lastSavedTime}
        onClearAll={handleClearAll}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {pages.length === 0 ? (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="text-center py-6 sm:py-10 max-w-3xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-wider text-slate-700 font-bold bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs inline-block mb-1">
                حلول المناهج والكتب والمذكرات الأكاديمية
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                ارفع الكتاب ليتم حله بالكامل تلقائياً وتفريغ الخط اليدوي
              </h2>
              <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                بمجرد رفع ملف الكتاب (PDF متعدد الصفحات) أو الصور، سيبدأ النظام فوراً بحل جميع
                الصفحات صفحة بصفحة دون توقف، وتفريغ أي كتابة بخط اليد وتجهيز الملف للتنزيل كـ Word أو PDF أو TXT.
              </p>
            </div>

            {/* Upload Box */}
            <UploadZone
              onPagesAdded={handlePagesAdded}
              isLoading={isLoadingUpload}
              setIsLoading={setIsLoadingUpload}
            />
          </div>
        ) : (
          /* Workspace with Uploaded Pages */
          <div className="space-y-4">
            {/* Celebration Banner when Full Book finishes solving */}
            {showCelebrationBanner && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      تم الانتهاء من حل جميع صفحات الكتاب بالكامل ({completedCount} صفحة)!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      كل صفحة كتاب تم حلها في صفحة حل مستقلة مع تفريغ نصوص خط اليد. الملف جاهز الآن للتحميل الفوري:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateAndDownloadPdf(pages)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل PDF</span>
                  </button>
                  <button
                    onClick={() => generateAndDownloadDocx(pages)}
                    className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileType className="w-3.5 h-3.5" />
                    <span>تحميل Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => generateAndDownloadTxt(pages)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>نصي (.txt)</span>
                  </button>
                </div>
              </div>
            )}

            {/* AUTOMATIC FULL-BOOK SOLVING PROGRESS BAR */}
            {isBatchSolving && (
              <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        جاري حل الكتاب كاملاً تلقائياً: صفحة {batchProgress?.currentPageNum || activePageIndex + 1} من {pages.length}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {Math.round(((batchProgress?.current || completedCount) / pages.length) * 100)}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((batchProgress?.current || completedCount) / pages.length) * 100)
                        )}%`,
                      }}
                      className="bg-slate-900 h-full transition-all duration-300"
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>تم حل {batchProgress?.current || completedCount} من {pages.length} صفحات بنجاح</span>
                    <span>يمكنك استعراض الصفحات المحلولة فوراً أدناه</span>
                  </div>
                </div>

                {/* Pause / Resume / Cancel Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'استئناف' : 'إيقاف مؤقت'}</span>
                  </button>

                  <button
                    onClick={handleCancelBatchSolve}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>إلغاء</span>
                  </button>
                </div>
              </div>
            )}

            {/* Top Toolbar & Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs no-print">
              {/* Settings selectors */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Subject selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">المادة:</span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
                  >
                    <option value="general">عام / شامل</option>
                    <option value="math_science">رياضيات وعلوم (مع الخطوات والمعادلات)</option>
                    <option value="languages">لغات ونحو وقواعد</option>
                    <option value="humanities">مواد أدبية واجتماعية</option>
                  </select>
                </div>

                {/* Solver Mode */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">الوضع:</span>
                  <select
                    value={solverMode}
                    onChange={(e) => setSolverMode(e.target.value as SolverMode)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
                  >
                    <option value="full-solve">حل شامل + تفريغ خط اليد</option>
                    <option value="ocr-handwriting">التركيز على تفريغ خط اليد الرقمي</option>
                    <option value="verify-only">مراجعة وتدقيق إجابات الطالب</option>
                  </select>
                </div>

                {/* Depth */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">عمق الإجابة:</span>
                  <select
                    value={solutionDepth}
                    onChange={(e) => setSolutionDepth(e.target.value as SolutionDepth)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
                  >
                    <option value="detailed">مفصل بالخطوات والقوانين</option>
                    <option value="concise">مختصر ومباشر</option>
                    <option value="with-explanations">تعليمي مع التعليل والشرح</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* View switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'workspace'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>مساحة العمل والتصحيح</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf-preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'pdf-preview'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة المستندات ({completedCount})</span>
                  </button>
                </div>

                {/* Retry failed pages if any */}
                {!isBatchSolving && pages.some((p) => p.status === 'error') && (
                  <button
                    onClick={() => startFullBookSolve(pages)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة محاولة الصفحات المتعثرة ({pages.filter((p) => p.status === 'error').length})</span>
                  </button>
                )}

                {/* Manual solve remaining pages if needed */}
                {!isBatchSolving && completedCount < pages.length && !pages.some((p) => p.status === 'error') && (
                  <button
                    onClick={() => startFullBookSolve(pages)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>استكمال حل باقي الصفحات ({pages.length - completedCount})</span>
                  </button>
                )}

                {/* Export button */}
                {completedCount > 0 && (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>تصدير الحلول (PDF, Word, TXT)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnails Strip */}
            <PageThumbnailList
              pages={pages}
              activePageIndex={activePageIndex}
              onSelectPage={(idx) => setActivePageIndex(idx)}
              onDeletePage={handleDeletePage}
              onAddMoreClick={() => addMoreInputRef.current?.click()}
            />

            {/* Mode 1: Interactive Workspace (Side-by-side on desktop, switchable tabs on mobile) */}
            {activeTab === 'workspace' && activePage && (
              <div className="space-y-3 no-print">
                {/* Mobile view toggle for phone screens */}
                <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setMobileView('solution')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      mobileView === 'solution'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✅ الحلول وتفريغ الخط اليدوي
                  </button>
                  <button
                    onClick={() => setMobileView('original')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      mobileView === 'original'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 صفحة الكتاب الأصلية
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[550px]">
                  {/* Right: Original Page (RTL) */}
                  <div className={`h-full ${mobileView === 'solution' ? 'hidden lg:block' : 'block'}`}>
                    <OriginalPageViewer page={activePage} />
                  </div>

                  {/* Left: Solution & OCR Card */}
                  <div className={`h-full ${mobileView === 'original' ? 'hidden lg:block' : 'block'}`}>
                    <SolutionCard
                      page={activePage}
                      onSolveCurrentPage={() => solveSinglePage(activePage)}
                      onOpenRefineModal={(q) => setRefineQuestion(q)}
                      onUpdateQuestion={handleUpdateQuestion}
                      onUpdateHandwritingText={handleUpdateHandwritingText}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: PDF Preview Mode */}
            {activeTab === 'pdf-preview' && (
              <div className="space-y-4">
                {/* PDF Toolbar */}
                <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 shadow-xs no-print">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block sm:inline">
                        {pdfMode === 'answers-only' ? 'مستند الإجابات فقط (سريع وموجز):' : 'مستند الحل النموذجي المفصل:'}
                      </span>{' '}
                      <span className="text-slate-600">
                        {pdfMode === 'answers-only'
                          ? 'رقم السؤال والإجابة فقط بدون نص السؤال لتوفير المساحة وتجميع الحلول في صفحة واحدة.'
                          : 'يشمل نص السؤال الأصلي، والخطوات الكاملة، والشرح والتعليل.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* PDF Mode Toggle (الإجابات فقط VS حل كامل) */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPdfMode('answers-only')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          pdfMode === 'answers-only'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ⚡ الإجابات فقط (موجز)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfMode('full')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          pdfMode === 'full'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📖 السؤال والحل كاملاً
                      </button>
                    </div>

                    {/* Font Size Toggle */}
                    <button
                      type="button"
                      onClick={() => setPdfFontSize((prev) => (prev === 'compact' ? 'standard' : 'compact'))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        pdfFontSize === 'compact'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                      title="التبديل بين الخط المدمج الصغير والخط القياسي"
                    >
                      {pdfFontSize === 'compact' ? '🔍 خط مدمج' : '🔎 خط قياسي'}
                    </button>

                    {/* Thumbnail Toggle */}
                    {pdfMode === 'full' && (
                      <button
                        type="button"
                        onClick={() => setShowPdfPageThumbnail((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          showPdfPageThumbnail
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="إظهار أو إخفاء صورة الصفحة الأصلية من الـ PDF"
                      >
                        {showPdfPageThumbnail ? '🖼️ معاينة الصفحة' : '📄 بدون صور'}
                      </button>
                    )}

                    {/* Open Export Modal */}
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>تنزيل أو طباعة</span>
                    </button>
                  </div>
                </div>

                {/* The Printable document */}
                <PrintableBookPdf
                  pages={pages}
                  fontSize={pdfFontSize}
                  showPageThumbnail={showPdfPageThumbnail}
                  pdfMode={pdfMode}
                />
              </div>
            )}
          </div>
        )}

        {/* Offscreen & Print layout container: Ensures jsPDF and browser print always access pages cleanly without duplicate DOM IDs */}
        {activeTab !== 'pdf-preview' && completedCount > 0 && (
          <div
            className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 select-none print:static print:left-auto print:opacity-100 print:pointer-events-auto print:block"
            style={{ width: '794px' }}
          >
            <PrintableBookPdf
              pages={pages}
              fontSize={pdfFontSize}
              showPageThumbnail={showPdfPageThumbnail}
              pdfMode={pdfMode}
            />
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>حلول كراستي · المنصة الأكاديمية الذكية لحل صفحات وتدريبات الكتب</span>
          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Made by Mazen Mohamed
          </span>
        </div>
      </footer>

      {/* Refine Question AI Modal */}
      <RefineQuestionModal
        question={refineQuestion}
        isOpen={!!refineQuestion}
        onClose={() => setRefineQuestion(null)}
        onApplyRefinement={handleApplyRefinement}
        imageBase64={activePage?.imageDataUrl}
      />

      {/* Export / Download PDF Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pages={pages}
        pdfMode={pdfMode}
        onPdfModeChange={setPdfMode}
      />
    </div>
  );
}
