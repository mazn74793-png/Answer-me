import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { QuestionItem } from '../types';

interface RefineQuestionModalProps {
  question: QuestionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyRefinement: (updated: Partial<QuestionItem>) => void;
  imageBase64?: string;
}

export const RefineQuestionModal: React.FC<RefineQuestionModalProps> = ({
  question,
  isOpen,
  onClose,
  onApplyRefinement,
  imageBase64,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !question) return null;

  const quickPrompts = [
    'اشرح خطوات الحل بالتفصيل المبسط خطوة بخطوة',
    'اكتب الحل باللغة الإنجليزية مع الرموز الرياضية',
    'اذكر القاعدة أو القانون العلمي المستخدم',
    'اختصر الإجابة وركز على الحل النهائي فقط',
  ];

  const handleRefine = async () => {
    if (!instruction.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/refine-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.originalText,
          currentAnswer: question.finalAnswer,
          userInstruction: instruction,
          imageBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تعديل الإجابة.');
      }

      onApplyRefinement({
        finalAnswer: data.updatedAnswer || question.finalAnswer,
        steps: data.updatedSteps || question.steps,
        explanation: data.updatedExplanation || question.explanation,
        isUserEdited: true,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'حدث خطأ أثناء تعديل الإجابة.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">تعديل الحل أو طلب شرح إضافي</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Question */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">
            {question.questionNumber || 'السؤال'}:
          </span>
          <p className="line-clamp-2">{question.originalText}</p>
        </div>

        {/* Quick Prompts */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600">اقتراحات سريعة:</label>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInstruction(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer text-right"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instruction Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">أو اكتب التوجيه المطلوب:</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="مثال: يرجى كتابة البرهان الهندسي بالتفصيل وتوضيح النتيجة..."
            rows={3}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleRefine}
            disabled={isLoading || !instruction.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>تطبيق التعديل</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
