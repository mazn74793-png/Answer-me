import React from 'react';
import { BookPage } from '../types';

interface PrintableBookPdfProps {
  pages: BookPage[];
}

export const PrintableBookPdf: React.FC<PrintableBookPdfProps> = ({ pages }) => {
  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);

  if (completedPages.length === 0) return null;

  return (
    <div
      id="printable-book-document"
      className="space-y-8 p-2 sm:p-4 rounded-2xl"
      style={{ backgroundColor: '#f1f5f9' }}
    >
      {completedPages.map((page) => {
        const sol = page.solution!;

        return (
          <div
            key={page.id}
            id={`pdf-page-container-${page.id}`}
            className="print-page rounded-2xl shadow-sm mx-auto mb-8 flex flex-col justify-between"
            style={{
              width: '794px',
              maxWidth: '100%',
              minHeight: '1123px',
              padding: '36px 32px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderColor: '#cbd5e1',
              borderWidth: '1px',
              borderStyle: 'solid',
              direction: 'rtl',
              fontFamily: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              boxSizing: 'border-box',
              lineHeight: '1.8',
            }}
          >
            {/* Header: Book Page Title & Metadata */}
            <div>
              <div
                className="pb-4 mb-5 flex items-start justify-between gap-4"
                style={{
                  borderBottom: '2.5px solid #0f172a',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-md"
                      style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                    >
                      صفحة {page.pageNumber} من الكتاب الأصلي
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#475569' }}>
                      المادة: {sol.detectedSubject || 'عام'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mt-1" style={{ color: '#020617', lineHeight: '1.5' }}>
                    {sol.pageTitle || `حلول تمارين صفحة ${page.pageNumber}`}
                  </h2>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-[12px] font-bold tracking-wide" style={{ color: '#0f172a' }}>
                    حلول كراستي · التوثيق الأكاديمي
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
                    {new Date().toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Reference & Handwriting Banner */}
              <div
                className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Original Page Thumbnail */}
                <div
                  className="md:col-span-1 flex flex-col items-center justify-center border-l md:border-l-slate-300 md:pl-3 pb-2 md:pb-0 shrink-0"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  <span className="text-[11px] font-bold mb-1.5" style={{ color: '#475569' }}>
                    معاينة صفحة الكتاب الأصلية
                  </span>
                  <div
                    className="w-24 h-32 rounded-lg overflow-hidden shadow-xs"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}
                  >
                    <img
                      src={page.imageDataUrl}
                      alt={`صفحة ${page.pageNumber}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Digitized Handwriting & Summary */}
                <div className="md:col-span-3 space-y-2.5">
                  {sol.pageSummary && (
                    <div className="text-xs" style={{ color: '#334155', lineHeight: '1.8' }}>
                      <strong style={{ color: '#0f172a' }}>موضوع ومحتوى الصفحة: </strong>
                      {sol.pageSummary}
                    </div>
                  )}

                  {sol.handwrittenTranscription && (
                    <div
                      className="rounded-lg p-3 text-xs"
                      style={{
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#78350f',
                        lineHeight: '1.8',
                      }}
                    >
                      <div className="font-bold mb-1 flex items-center gap-1.5 text-[11px]">
                        <span>✍️ تفريغ الخط اليدوي إلى نص رقمي دقيق:</span>
                      </div>
                      <div className="whitespace-pre-wrap font-mono text-[11px]">
                        {sol.handwrittenTranscription}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Solved Questions List */}
              <div className="space-y-5">
                <div
                  className="text-sm font-bold pb-2 mb-3"
                  style={{ color: '#0f172a', borderBottom: '1.5px solid #e2e8f0' }}
                >
                  الحلول النموذجية لجميع أسئلة ومسائل الصفحة ({sol.questions.length} أسئلة)
                </div>

                {sol.questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="rounded-xl p-4 sm:p-5 space-y-3"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      breakInside: 'avoid',
                      pageBreakInside: 'avoid',
                      marginBottom: '16px',
                    }}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 w-full">
                        <span
                          className="shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                        >
                          {qIndex + 1}
                        </span>
                        <div className="w-full">
                          <span
                            className="font-bold text-xs inline-block"
                            style={{ color: '#0f172a' }}
                          >
                            {q.questionNumber || `سؤال ${qIndex + 1}`}
                            {q.questionType ? ` (${q.questionType})` : ''}
                          </span>
                          <p
                            className="text-sm font-semibold mt-1"
                            style={{ color: '#0f172a', lineHeight: '1.85' }}
                          >
                            {q.originalText}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div
                        className="mr-9 text-xs grid grid-cols-2 gap-1.5 p-2.5 rounded-lg"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          lineHeight: '1.7',
                        }}
                      >
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-1 rounded font-medium">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Final Answer Box (Clean Emerald Green) */}
                    <div className="mr-9">
                      <div
                        className="rounded-lg p-3 text-xs"
                        style={{
                          backgroundColor: '#ecfdf5',
                          border: '1.5px solid #10b981',
                          color: '#064e3b',
                        }}
                      >
                        <strong className="block mb-1 font-bold text-xs" style={{ color: '#065f46' }}>
                          ✅ الإجابة النهائية المعتمدة:
                        </strong>
                        <div className="font-bold text-sm sm:text-base" style={{ color: '#047857', lineHeight: '1.75' }}>
                          {q.finalAnswer}
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step Solution */}
                    {q.steps && q.steps.length > 0 && (
                      <div className="mr-9 text-xs" style={{ color: '#334155' }}>
                        <strong className="block mb-1.5 font-bold text-xs" style={{ color: '#0f172a' }}>
                          خطوات الحل والبرهان:
                        </strong>
                        <ol className="list-decimal list-inside space-y-1.5">
                          {q.steps.map((step, sIdx) => (
                            <li key={sIdx} style={{ lineHeight: '1.85' }}>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div
                        className="mr-9 text-xs p-2.5 rounded-lg"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          lineHeight: '1.85',
                        }}
                      >
                        <strong style={{ color: '#0f172a' }}>الشرح والتعليل: </strong>
                        {q.explanation}
                      </div>
                    )}

                    {/* Note / Tip */}
                    {q.notesOrTips && (
                      <div
                        className="mr-9 text-[11px] p-2 rounded-lg"
                        style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          color: '#92400e',
                          lineHeight: '1.75',
                        }}
                      >
                        💡 <strong>تنبيه وملاحظة هامة: </strong> {q.notesOrTips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="pt-3 mt-8 flex items-center justify-between text-[11px]"
              style={{
                borderTop: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              <div>
                صفحة حل مستقلة لصفحة الكتاب رقم {page.pageNumber} · حلول كاملة وموثقة
              </div>
              <div className="font-semibold" style={{ color: '#334155' }}>
                صفحة {page.pageNumber} من {pages.length}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
