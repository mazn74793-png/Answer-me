import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Copy,
  PenTool,
  BookOpen,
  Edit3,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { BookPage, QuestionItem } from '../types';

interface SolutionCardProps {
  page: BookPage;
  onSolveCurrentPage: () => void;
  onOpenRefineModal: (question: QuestionItem) => void;
  onUpdateQuestion: (updatedQuestion: QuestionItem) => void;
  onUpdateHandwritingText: (newText: string) => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  page,
  onSolveCurrentPage,
  onOpenRefineModal,
  onUpdateQuestion,
  onUpdateHandwritingText,
}) => {
  const [copiedHandwriting, setCopiedHandwriting] = useState(false);
  const [isEditingHandwriting, setIsEditingHandwriting] = useState(false);
  const [handwritingDraft, setHandwritingDraft] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState<{
    finalAnswer: string;
    explanation?: string;
  }>({ finalAnswer: '' });

  const solution = page.solution;

  const handleCopyHandwriting = () => {
    if (!solution?.handwrittenTranscription) return;
    navigator.clipboard.writeText(solution.handwrittenTranscription);
    setCopiedHandwriting(true);
    setTimeout(() => setCopiedHandwriting(false), 2000);
  };

  const handleStartEditQuestion = (q: QuestionItem) => {
    setEditingQuestionId(q.id);
    setQuestionDraft({
      finalAnswer: q.finalAnswer,
      explanation: q.explanation || '',
    });
  };

  const handleSaveEditQuestion = (q: QuestionItem) => {
    onUpdateQuestion({
      ...q,
      finalAnswer: questionDraft.finalAnswer,
      explanation: questionDraft.explanation,
      isUserEdited: true,
    });
    setEditingQuestionId(null);
  };

  if (page.status === 'processing') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[550px] text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4 shadow-2xs">
          <Sparkles className="w-7 h-7 animate-pulse text-slate-800" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          جاري قراءة وحل الصفحة رقم {page.pageNumber}...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed mb-6">
          يتم الآن تفريغ الخط اليدوي بدقة فائقة وحل المسائل الرياضية والتمارين خطوة بخطوة مع تجهيز
          التنسيق الكامل للـ PDF و Word و TXT.
        </p>

        <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div className="bg-slate-900 h-full w-2/3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (page.status === 'error') {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[550px] text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">تعذر حل هذه الصفحة</h3>
        <p className="text-xs sm:text-sm text-rose-600 max-w-md mb-6">
          {page.errorMessage || 'حدث خطأ أثناء معالجة الصفحة. يرجى إعادة المحاولة.'}
        </p>
        <button
          onClick={onSolveCurrentPage}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة الآن</span>
        </button>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[550px] text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4 shadow-2xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
          الصفحة رقم {page.pageNumber} جاهزة للحل
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          انقر على الزر أدناه لبدء المعالجة الذكية: تفريغ أي كتابة بخط اليد وتحويلها لنص رقمي، وحل
          كافة التمارين والمسائل الخاصة بهذه الصفحة بدقة تامة.
        </p>
        <button
          onClick={onSolveCurrentPage}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>حل صفحة {page.pageNumber} وتفريغ الخط اليدوي</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden h-full shadow-xs">
      {/* Header bar of Solution */}
      <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              حلول الصفحة {page.pageNumber}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-600 font-medium">{solution.pageTitle}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span>المادة: <strong className="text-slate-700">{solution.detectedSubject}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>عدد الأسئلة: {solution.questions.length}</span>
            {solution.hasHandwriting && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-amber-700 font-medium">يحتوي على خط يد ✍️</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onSolveCurrentPage}
          title="إعادة حل وتحديث هذه الصفحة"
          className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة الحل</span>
        </button>
      </div>

      {/* Main Solution Content scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
        {/* Page Summary */}
        {solution.pageSummary && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-bold">ملخص ومحتوى الصفحة: </strong>
            {solution.pageSummary}
          </div>
        )}

        {/* FEATURE: Digitized Handwritten Text (OCR) */}
        {solution.handwrittenTranscription && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900">
                  النصوص المكتوبة بخط اليد المكتشفة (تحويل رقمي دقيق)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHandwriting}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs font-medium"
                  title="نسخ النص المفرغ"
                >
                  {copiedHandwriting ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHandwriting ? 'تم النسخ' : 'نسخ'}</span>
                </button>
                <button
                  onClick={() => {
                    if (isEditingHandwriting) {
                      onUpdateHandwritingText(handwritingDraft);
                      setIsEditingHandwriting(false);
                    } else {
                      setHandwritingDraft(solution.handwrittenTranscription);
                      setIsEditingHandwriting(true);
                    }
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingHandwriting ? 'حفظ التعديل' : 'تعديل'}</span>
                </button>
              </div>
            </div>

            {isEditingHandwriting ? (
              <textarea
                value={handwritingDraft}
                onChange={(e) => setHandwritingDraft(e.target.value)}
                rows={4}
                className="w-full text-xs bg-white border border-amber-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans shadow-2xs"
              />
            ) : (
              <div className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200/80 font-mono">
                {solution.handwrittenTranscription}
              </div>
            )}
          </div>
        )}

        {/* Questions & Solutions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>الأسئلة والحلول النموذجية المكتشفة ({solution.questions.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              جاهزة للتصدير (PDF / Word / TXT)
            </span>
          </div>

          {solution.questions.map((q, idx) => {
            const isEditingThis = editingQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4.5 space-y-3 transition-colors shadow-2xs hover:border-slate-300"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {q.questionNumber || `سؤال ${idx + 1}`}
                        </span>
                        {q.questionType && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {q.questionType}
                          </span>
                        )}
                        {q.isUserEdited && (
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 font-medium">
                            مُعدّل
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 mt-1 font-semibold leading-relaxed">
                        {q.originalText}
                      </p>
                    </div>
                  </div>

                  {/* Refine / Edit tools */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenRefineModal(q)}
                      title="طلب شرح أو صياغة بديلة"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        isEditingThis ? handleSaveEditQuestion(q) : handleStartEditQuestion(q)
                      }
                      title={isEditingThis ? 'حفظ التعديل' : 'تعديل الحل يدوياً'}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Multiple choice options if exist */}
                {q.options && q.options.length > 0 && (
                  <div className="pr-8 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Solution Box: Final Answer */}
                <div className="pr-8">
                  {isEditingThis ? (
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="text-[11px] text-emerald-800 font-bold block">
                        الإجابة النهائية:
                      </label>
                      <textarea
                        value={questionDraft.finalAnswer}
                        onChange={(e) =>
                          setQuestionDraft({ ...questionDraft, finalAnswer: e.target.value })
                        }
                        rows={2}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <label className="text-[11px] text-slate-700 font-bold block">
                        الشرح والتعليل:
                      </label>
                      <textarea
                        value={questionDraft.explanation || ''}
                        onChange={(e) =>
                          setQuestionDraft({ ...questionDraft, explanation: e.target.value })
                        }
                        rows={2}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingQuestionId(null)}
                          className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleSaveEditQuestion(q)}
                          className="px-3 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer font-medium"
                        >
                          حفظ التعديل
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>الإجابة النموذجية المعتمدة:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-950 font-bold leading-relaxed">
                        {q.finalAnswer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Step by step */}
                {q.steps && q.steps.length > 0 && !isEditingThis && (
                  <div className="pr-8 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      خطوات الحل التفصيلية:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                      {q.steps.map((st, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {st}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && !isEditingThis && (
                  <div className="pr-8 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-800 font-semibold">الشرح والتعليل: </strong>
                    {q.explanation}
                  </div>
                )}

                {/* Tip/Note */}
                {q.notesOrTips && !isEditingThis && (
                  <div className="pr-8 flex items-start gap-1.5 text-[11px] text-amber-900">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>{q.notesOrTips}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
