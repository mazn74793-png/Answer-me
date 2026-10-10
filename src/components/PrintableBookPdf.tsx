import React from 'react';
import { BookPage } from '../types';

export type PdfExportMode = 'full' | 'answers-only';

export interface PrintableBookPdfProps {
  pages: BookPage[];
  fontSize?: 'compact' | 'standard';
  showPageThumbnail?: boolean;
  pdfMode?: PdfExportMode; // 'full': Question + Steps + Explanation + Answer; 'answers-only': Question number/title + Direct Answer only (no long question body or steps)
}

export const PrintableBookPdf: React.FC<PrintableBookPdfProps> = ({
  pages,
  fontSize = 'compact',
  showPageThumbnail = false,
  pdfMode = 'answers-only',
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
                  borderBottom: '2.5px solid #000000',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[11px] font-black px-2.5 py-0.5 rounded-md"
                      style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    >
                      صفحة {page.pageNumber} من الكتاب
                    </span>
                    <span className="text-[12px] font-extrabold" style={{ color: '#0f172a' }}>
                      المادة: {sol.detectedSubject || 'عام'}
                    </span>
                  </div>
                  <h2
                    className={isCompact ? 'text-base font-black' : 'text-xl font-black'}
                    style={{ color: '#000000', lineHeight: '1.3' }}
                  >
                    {sol.pageTitle || `حلول تمارين صفحة ${page.pageNumber}`}
                  </h2>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-[11.5px] font-black tracking-wide" style={{ color: '#000000' }}>
                    حلول كراستي · الإجابات المعتمدة
                  </div>
                  <div className="text-[10px] font-bold mt-0.5" style={{ color: '#334155' }}>
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
                className="text-xs font-bold pb-2 mb-3 flex items-center justify-between"
                style={{ color: '#000000', borderBottom: '2.5px solid #000000' }}
              >
                <span className="flex items-center gap-2">
                  <span className="font-black text-[13.5px]">
                    {pdfMode === 'answers-only' ? 'جدول الإجابات النموذجية المعتمدة' : 'قائمة الإجابات النموذجية المعتمدة'}
                  </span>
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded font-black tracking-wide"
                    style={{
                      backgroundColor: pdfMode === 'answers-only' ? '#047857' : '#000000',
                      color: '#ffffff',
                    }}
                  >
                    {pdfMode === 'answers-only' ? 'إجابات فقط (موجزة وعالية الدقة)' : 'حل مفصل وشامل'}
                  </span>
                </span>
                <span className="text-[11.5px] font-black" style={{ color: '#000000' }}>
                  عدد الأسئلة: {sol.questions.length}
                </span>
              </div>

              {/* Solved Questions List (Compact & Cleanly Formatted) */}
              {pdfMode === 'answers-only' ? (
                /* === OPTION A: ANSWERS ONLY (رقم السؤال والإجابة فقط - خفيف جداً وموجز وواضح جداً) === */
                <div className="space-y-2.5">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-lg p-3 flex items-start gap-3"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #000000',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        marginBottom: '8px',
                      }}
                    >
                      {/* Question Number Badge */}
                      <div
                        className="shrink-0 px-2.5 py-1 rounded text-center font-black"
                        style={{
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          minWidth: '60px',
                        }}
                      >
                        <div className="text-[12px] font-black tracking-wide">
                          {q.questionNumber || `سؤال ${qIndex + 1}`}
                        </div>
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span
                            className="text-[11.5px] font-black px-2 py-0.5 rounded"
                            style={{ backgroundColor: '#059669', color: '#ffffff' }}
                          >
                            الإجابة:
                          </span>
                          <span
                            className="font-black text-[14px]"
                            style={{ color: '#000000', lineHeight: '1.5', wordBreak: 'break-word' }}
                          >
                            {q.finalAnswer}
                          </span>
                        </div>

                        {/* If there is a key summary note */}
                        {q.explanation && (
                          <div
                            className="text-[11.5px] font-bold mt-1.5 pt-1"
                            style={{ color: '#1e293b', borderTop: '1px dashed #cbd5e1' }}
                          >
                            <span className="font-black text-[#000000]">ملاحظة: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* === OPTION B: FULL DETAILED QUESTIONS & SOLUTIONS === */
                <div className="space-y-3.5">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-lg p-3 sm:p-4 space-y-2.5"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #000000',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        marginBottom: isCompact ? '12px' : '16px',
                      }}
                    >
                      {/* Question Header & Prompt */}
                      <div className="flex items-start gap-2.5">
                        <span
                          className="shrink-0 w-7 h-7 rounded text-[12px] font-black flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: '#000000', color: '#ffffff' }}
                        >
                          {qIndex + 1}
                        </span>
                        <div className="w-full">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-black text-[13px]"
                              style={{ color: '#000000' }}
                            >
                              {q.questionNumber || `سؤال ${qIndex + 1}`}
                            </span>
                            {q.questionType && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded font-black"
                                style={{ backgroundColor: '#e2e8f0', color: '#000000' }}
                              >
                                {q.questionType}
                              </span>
                            )}
                          </div>
                          <p
                            className={isCompact ? 'text-[13px] font-black mt-1' : 'text-sm font-black mt-1'}
                            style={{ color: '#000000', lineHeight: isCompact ? '1.65' : '1.8' }}
                          >
                            {q.originalText}
                          </p>
                        </div>
                      </div>

                      {/* Options if MCQ */}
                      {q.options && q.options.length > 0 && (
                        <div
                          className="mr-9 text-[12px] grid grid-cols-2 gap-1.5 p-2.5 rounded-md"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1.5px solid #000000',
                            color: '#000000',
                            lineHeight: '1.5',
                          }}
                        >
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="p-0.5 font-bold">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Approved Final Answer Box (Clean, Distinct, Crisp Emerald Box) */}
                      <div className="mr-9">
                        <div
                          className="rounded-md p-3"
                          style={{
                            backgroundColor: '#ecfdf5',
                            border: '2px solid #047857',
                            color: '#022c22',
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-black text-[12px]" style={{ color: '#047857' }}>
                              ✅ الإجابة النهائية المعتمدة:
                            </span>
                          </div>
                          <div
                            className={isCompact ? 'font-black text-[14px]' : 'font-black text-[16px]'}
                            style={{ color: '#000000', lineHeight: '1.5' }}
                          >
                            {q.finalAnswer}
                          </div>
                        </div>
                      </div>

                      {/* Step-by-step Solution */}
                      {q.steps && q.steps.length > 0 && (
                        <div className="mr-9 text-[12px]" style={{ color: '#000000' }}>
                          <strong className="block mb-1 font-black text-[12px]" style={{ color: '#000000' }}>
                            خطوات الحل والبرهان:
                          </strong>
                          <ol className="list-decimal list-inside space-y-1">
                            {q.steps.map((step, sIdx) => (
                              <li key={sIdx} className="font-bold" style={{ lineHeight: '1.65', color: '#000000' }}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div
                          className="mr-9 text-[11.5px] p-2.5 rounded-md font-bold"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            color: '#000000',
                            lineHeight: '1.6',
                          }}
                        >
                          <strong className="font-black" style={{ color: '#000000' }}>الشرح والتعليل: </strong>
                          {q.explanation}
                        </div>
                      )}

                      {/* Note / Tip */}
                      {q.notesOrTips && (
                        <div
                          className="mr-9 text-[11px] p-2 rounded-md font-bold"
                          style={{
                            backgroundColor: '#fffbeb',
                            border: '1.5px solid #d97706',
                            color: '#78350f',
                            lineHeight: '1.5',
                          }}
                        >
                          💡 <strong>تنبيه: </strong> {q.notesOrTips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="pt-2.5 mt-6 flex items-center justify-between text-[10.5px] font-bold"
              style={{
                borderTop: '1.5px solid #0f172a',
                color: '#0f172a',
              }}
            >
              <div>
                {pdfMode === 'answers-only'
                  ? `ملخص الإجابات فقط لصفحة الكتاب رقم ${page.pageNumber}`
                  : `حلول نموذجية لصفحة الكتاب رقم ${page.pageNumber}`}
              </div>
              <div className="font-extrabold text-[11px]" style={{ color: '#000000' }}>
                Made by Mazen Mohamed
              </div>
              <div className="font-bold" style={{ color: '#0f172a' }}>
                صفحة {page.pageNumber} من {pages.length}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
