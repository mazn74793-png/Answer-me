import React from 'react';
import { BookPage } from '../types';

export interface PrintableBookPdfProps {
  pages: BookPage[];
  fontSize?: 'compact' | 'standard';
  showPageThumbnail?: boolean;
}

export const PrintableBookPdf: React.FC<PrintableBookPdfProps> = ({
  pages,
  fontSize = 'compact',
  showPageThumbnail = false,
}) => {
  const completedPages = pages.filter((p) => p.status === 'completed' && p.solution);

  if (completedPages.length === 0) return null;

  const isCompact = fontSize === 'compact';

  return (
    <div
      id="printable-book-document"
      className="space-y-6 p-2 sm:p-4 rounded-2xl"
      style={{ backgroundColor: '#f1f5f9' }}
    >
      {completedPages.map((page) => {
        const sol = page.solution!;

        return (
          <div
            key={page.id}
            id={`pdf-page-container-${page.id}`}
            className="print-page rounded-2xl shadow-sm mx-auto mb-6 flex flex-col justify-between"
            style={{
              width: '794px',
              maxWidth: '100%',
              minHeight: '1123px',
              padding: isCompact ? '24px 26px' : '32px 30px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderColor: '#cbd5e1',
              borderWidth: '1px',
              borderStyle: 'solid',
              direction: 'rtl',
              fontFamily: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              boxSizing: 'border-box',
              lineHeight: isCompact ? '1.65' : '1.8',
            }}
          >
            {/* Header: Compact Subject & Book Page Title */}
            <div>
              <div
                className="pb-3 mb-4 flex items-start justify-between gap-4"
                style={{
                  borderBottom: '2px solid #0f172a',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-md"
                      style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                    >
                      صفحة {page.pageNumber} من الكتاب
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: '#475569' }}>
                      المادة: {sol.detectedSubject || 'عام'}
                    </span>
                  </div>
                  <h2
                    className={isCompact ? 'text-base font-bold' : 'text-lg font-bold'}
                    style={{ color: '#020617', lineHeight: '1.4' }}
                  >
                    {sol.pageTitle || `حلول تمارين صفحة ${page.pageNumber}`}
                  </h2>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-[11px] font-bold tracking-wide" style={{ color: '#0f172a' }}>
                    حلول كراستي · الإجابات النموذجية
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                    {new Date().toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Optional Page Thumbnail (Hidden by default to save space & focus purely on answers) */}
              {showPageThumbnail && (
                <div
                  className="mb-4 flex items-center gap-4 p-3 rounded-lg"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    className="w-16 h-20 rounded overflow-hidden shadow-xs shrink-0"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}
                  >
                    <img
                      src={page.imageDataUrl}
                      alt={`صفحة ${page.pageNumber}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-xs" style={{ color: '#334155' }}>
                    <strong>معاينة الصفحة الأصلية: </strong>
                    {sol.pageSummary || `صفحة رقم ${page.pageNumber} من الكتاب المدرسي`}
                  </div>
                </div>
              )}

              {/* Solved Questions Section Header */}
              <div
                className="text-xs font-bold pb-1.5 mb-3 flex items-center justify-between"
                style={{ color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}
              >
                <span>
                  قائمة الإجابات النموذجية ({sol.questions.length} أسئلة)
                </span>
                <span className="text-[10px] font-normal" style={{ color: '#64748b' }}>
                  توثيق أكاديمي متكامل
                </span>
              </div>

              {/* Solved Questions List (Compact & Cleanly Formatted) */}
              <div className="space-y-3">
                {sol.questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="rounded-lg p-3 sm:p-3.5 space-y-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      breakInside: 'avoid',
                      pageBreakInside: 'avoid',
                      marginBottom: isCompact ? '12px' : '16px',
                    }}
                  >
                    {/* Question Header & Prompt */}
                    <div className="flex items-start gap-2">
                      <span
                        className="shrink-0 w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                      >
                        {qIndex + 1}
                      </span>
                      <div className="w-full">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold text-[11px]"
                            style={{ color: '#0f172a' }}
                          >
                            {q.questionNumber || `سؤال ${qIndex + 1}`}
                          </span>
                          {q.questionType && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded"
                              style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                            >
                              {q.questionType}
                            </span>
                          )}
                        </div>
                        <p
                          className={isCompact ? 'text-[12px] font-semibold mt-1' : 'text-sm font-semibold mt-1'}
                          style={{ color: '#0f172a', lineHeight: isCompact ? '1.65' : '1.8' }}
                        >
                          {q.originalText}
                        </p>
                      </div>
                    </div>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div
                        className="mr-7 text-[11px] grid grid-cols-2 gap-1 p-2 rounded-md"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          lineHeight: '1.5',
                        }}
                      >
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-0.5 rounded font-medium">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Approved Final Answer Box (Clean, Distinct, Compact Emerald Box) */}
                    <div className="mr-7">
                      <div
                        className="rounded-md p-2.5"
                        style={{
                          backgroundColor: '#ecfdf5',
                          border: '1.5px solid #10b981',
                          color: '#064e3b',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-[11px]" style={{ color: '#065f46' }}>
                            ✅ الإجابة النهائية المعتمدة:
                          </span>
                        </div>
                        <div
                          className={isCompact ? 'font-bold text-[12.5px]' : 'font-bold text-sm'}
                          style={{ color: '#047857', lineHeight: '1.6' }}
                        >
                          {q.finalAnswer}
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step Solution (Compact list) */}
                    {q.steps && q.steps.length > 0 && (
                      <div className="mr-7 text-[11px]" style={{ color: '#334155' }}>
                        <strong className="block mb-1 font-bold text-[11px]" style={{ color: '#0f172a' }}>
                          خطوات الحل والبرهان:
                        </strong>
                        <ol className="list-decimal list-inside space-y-0.5">
                          {q.steps.map((step, sIdx) => (
                            <li key={sIdx} style={{ lineHeight: '1.65' }}>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div
                        className="mr-7 text-[10.5px] p-2 rounded-md"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          lineHeight: '1.6',
                        }}
                      >
                        <strong style={{ color: '#0f172a' }}>الشرح والتعليل: </strong>
                        {q.explanation}
                      </div>
                    )}

                    {/* Note / Tip */}
                    {q.notesOrTips && (
                      <div
                        className="mr-7 text-[10px] p-1.5 rounded-md"
                        style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          color: '#92400e',
                          lineHeight: '1.5',
                        }}
                      >
                        💡 <strong>تنبيه: </strong> {q.notesOrTips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="pt-2.5 mt-6 flex items-center justify-between text-[10px]"
              style={{
                borderTop: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              <div>
                حلول نموذجية لصفحة الكتاب رقم {page.pageNumber} · إجابات فقط
              </div>
              <div className="font-semibold text-[10px]" style={{ color: '#475569' }}>
                Made by Mazen Mohamed
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
