import React from 'react';
import { BookPage } from '../types';

export type PdfExportMode = 'full' | 'answers-only';

export interface PrintableBookPdfProps {
  pages: BookPage[];
  fontSize?: 'compact' | 'standard';
  showPageThumbnail?: boolean;
  pdfMode?: PdfExportMode; // 'full': Question + Steps + Explanation + Answer; 'answers-only': Question number/title + Direct Answer only
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
      style={{ backgroundColor: '#f4f6f8' }}
    >
      {completedPages.map((page) => {
        const sol = page.solution!;

        return (
          <div
            key={page.id}
            id={`pdf-page-container-${page.id}`}
            className="print-page rounded-2xl mx-auto mb-6 flex flex-col justify-between"
            style={{
              width: '794px',
              maxWidth: '100%',
              minHeight: '1123px',
              padding: isCompact ? '24px 28px' : '32px 32px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
              borderColor: '#e2e8f0',
              borderWidth: '1px',
              borderStyle: 'solid',
              direction: 'rtl',
              fontFamily: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              boxSizing: 'border-box',
              lineHeight: isCompact ? '1.65' : '1.8',
            }}
          >
            {/* Top Page Content */}
            <div>
              {/* Header: Book Page & Subject with Elegant Gold & Amber Accents */}
              <div
                className="pb-4 mb-4 flex items-start justify-between gap-4"
                style={{
                  borderBottom: '2px solid #e2e8f0',
                  position: 'relative',
                }}
              >
                {/* Decorative golden accent top line */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: 0,
                    width: '120px',
                    height: '2.5px',
                    background: 'linear-gradient(90deg, #b45309, #f59e0b)',
                    borderRadius: '2px',
                  }}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {/* Page Badge with Warm Amber/Gold Gradient */}
                    <span
                      className="text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-xs"
                      style={{
                        background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
                        color: '#ffffff',
                        letterSpacing: '0.02em',
                      }}
                    >
                      صفحة {page.pageNumber} من الكتاب
                    </span>

                    {/* Detected Subject Tag */}
                    <span
                      className="text-[11.5px] font-extrabold px-2.5 py-0.5 rounded-lg"
                      style={{
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                      }}
                    >
                      المادة: {sol.detectedSubject || 'عام'}
                    </span>
                  </div>

                  <h2
                    className={isCompact ? 'text-base font-black' : 'text-xl font-black'}
                    style={{ color: '#0f172a', lineHeight: '1.35', letterSpacing: '-0.01em' }}
                  >
                    {sol.pageTitle || `حلول تمارين صفحة ${page.pageNumber}`}
                  </h2>
                </div>

                <div className="text-left shrink-0">
                  <div
                    className="text-[12px] font-black tracking-wide flex items-center justify-end gap-1"
                    style={{ color: '#0f172a' }}
                  >
                    <span>حلول كراستي</span>
                    <span style={{ color: '#d97706' }}>·</span>
                    <span style={{ color: '#b45309' }}>الإجابات المعتمدة</span>
                  </div>
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#64748b' }}>
                    {new Date().toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Optional Page Thumbnail */}
              {showPageThumbnail && (
                <div
                  className="mb-4 flex items-center gap-4 p-3 rounded-xl"
                  style={{
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                  }}
                >
                  <div
                    className="w-16 h-20 rounded-lg overflow-hidden shrink-0"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <img
                      src={page.imageDataUrl}
                      alt={`صفحة ${page.pageNumber}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-xs" style={{ color: '#334155' }}>
                    <strong style={{ color: '#0f172a' }}>معاينة الصفحة الأصلية: </strong>
                    {sol.pageSummary || `صفحة رقم ${page.pageNumber} من الكتاب المدرسي`}
                  </div>
                </div>
              )}

              {/* Solved Questions Section Header Bar */}
              <div
                className="pb-2.5 mb-3.5 flex items-center justify-between"
                style={{
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Subtle golden bullet accent */}
                  <div
                    style={{
                      width: '4px',
                      height: '16px',
                      background: 'linear-gradient(180deg, #d97706, #f59e0b)',
                      borderRadius: '4px',
                    }}
                  />
                  <span className="font-black text-[13.5px]" style={{ color: '#0f172a' }}>
                    {pdfMode === 'answers-only' ? 'الإجابات النموذجية المعتمدة' : 'الأسئلة والحلول النموذجية المعتمدة'}
                  </span>
                  <span
                    className="text-[10.5px] px-2.5 py-0.5 rounded-lg font-bold"
                    style={{
                      backgroundColor: pdfMode === 'answers-only' ? '#fffbeb' : '#f8fafc',
                      color: pdfMode === 'answers-only' ? '#b45309' : '#334155',
                      border: pdfMode === 'answers-only' ? '1px solid #fde68a' : '1px solid #e2e8f0',
                    }}
                  >
                    {pdfMode === 'answers-only' ? '⚡ موجز وسريع (إجابات فقط)' : '📖 حل مفصل وشامل'}
                  </span>
                </div>

                <div className="text-[11px] font-bold" style={{ color: '#64748b' }}>
                  عدد الأسئلة: <span style={{ color: '#0f172a', fontWeight: 900 }}>{sol.questions.length}</span>
                </div>
              </div>

              {/* Questions & Answers Display in Modern Cards */}
              {pdfMode === 'answers-only' ? (
                /* ========================================================================= */
                /* OPTION A: ANSWERS ONLY (Modern Cards - رقم السؤال والإجابة المعتمدة مباشرة) */
                /* ========================================================================= */
                <div className="space-y-3">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-3.5 flex items-start gap-3.5 transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRight: '4.5px solid #d97706', // Golden Amber Right Accent Border
                        boxShadow: '0 2px 8px -2px rgba(180, 83, 9, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {/* Question Number Badge with Golden Gradient */}
                      <div
                        className="shrink-0 px-3 py-1.5 rounded-lg text-center font-black shadow-xs"
                        style={{
                          background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)',
                          color: '#ffffff',
                          minWidth: '68px',
                        }}
                      >
                        <div className="text-[12px] font-black tracking-wide">
                          {q.questionNumber || `سؤال ${qIndex + 1}`}
                        </div>
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          {/* Golden Subtitle Label */}
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0"
                            style={{
                              backgroundColor: '#fffdf5',
                              color: '#b45309',
                              border: '1px solid #fef3c7',
                            }}
                          >
                            الإجابة:
                          </span>

                          {/* Bold Final Answer */}
                          <span
                            className="font-black text-[14px]"
                            style={{
                              color: '#0f172a',
                              lineHeight: '1.55',
                              wordBreak: 'break-word',
                            }}
                          >
                            {q.finalAnswer}
                          </span>
                        </div>

                        {/* Summary explanation note if present */}
                        {q.explanation && (
                          <div
                            className="text-[11.5px] font-semibold mt-2 pt-1.5"
                            style={{
                              color: '#475569',
                              borderTop: '1px dashed #e2e8f0',
                              lineHeight: '1.5',
                            }}
                          >
                            <span style={{ color: '#b45309', fontWeight: 800 }}>ملاحظة: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ========================================================================= */
                /* OPTION B: FULL DETAILED QUESTIONS & SOLUTIONS (Modern Cards with Golden Trims) */
                /* ========================================================================= */
                <div className="space-y-4">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-4 sm:p-5 space-y-3.5 transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRight: '4.5px solid #d97706', // Elegant Gold Accent Line
                        boxShadow: '0 4px 14px -3px rgba(180, 83, 9, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        marginBottom: isCompact ? '12px' : '16px',
                      }}
                    >
                      {/* Question Header & Body */}
                      <div className="flex items-start gap-3">
                        {/* Number Badge with Amber Gradient */}
                        <span
                          className="shrink-0 w-7 h-7 rounded-lg text-[12px] font-black flex items-center justify-center mt-0.5 shadow-xs"
                          style={{
                            background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                            color: '#ffffff',
                          }}
                        >
                          {qIndex + 1}
                        </span>

                        <div className="w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-black text-[13.5px]"
                              style={{ color: '#0f172a' }}
                            >
                              {q.questionNumber || `سؤال ${qIndex + 1}`}
                            </span>

                            {q.questionType && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                {q.questionType}
                              </span>
                            )}
                          </div>

                          {/* Distinct Spacing for Question Prompt */}
                          <p
                            className={isCompact ? 'text-[13px] font-bold mt-2' : 'text-sm font-bold mt-2'}
                            style={{
                              color: '#1e293b',
                              lineHeight: isCompact ? '1.7' : '1.85',
                            }}
                          >
                            {q.originalText}
                          </p>
                        </div>
                      </div>

                      {/* Multiple Choice Options if applicable */}
                      {q.options && q.options.length > 0 && (
                        <div
                          className="mr-10 text-[12px] grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg"
                          style={{
                            backgroundColor: '#fafaf9',
                            border: '1px solid #e7e5e4',
                            color: '#1e293b',
                            lineHeight: '1.5',
                          }}
                        >
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="p-1 font-semibold flex items-center gap-1.5"
                            >
                              <span style={{ color: '#d97706', fontSize: '10px' }}>●</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Approved Final Answer Sub-Card (Clean, High-Contrast with Champagne Accent) */}
                      <div className="mr-10">
                        <div
                          className="rounded-xl p-3.5 sm:p-4"
                          style={{
                            backgroundColor: '#fffdfa',
                            border: '1.5px solid #fde68a',
                            borderRight: '3.5px solid #d97706',
                            boxShadow: '0 2px 6px -1px rgba(217, 119, 6, 0.08)',
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md font-black"
                              style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                              }}
                            >
                              الإجابة النموذجية المعتمدة
                            </span>
                          </div>

                          <div
                            className={isCompact ? 'font-black text-[14.5px]' : 'font-black text-[16px]'}
                            style={{
                              color: '#0f172a',
                              lineHeight: '1.6',
                              wordBreak: 'break-word',
                            }}
                          >
                            {q.finalAnswer}
                          </div>
                        </div>
                      </div>

                      {/* Step-by-step Solution */}
                      {q.steps && q.steps.length > 0 && (
                        <div
                          className="mr-10 text-[12px] p-3 rounded-lg"
                          style={{
                            backgroundColor: '#fafaf9',
                            border: '1px solid #f1f5f9',
                            color: '#1e293b',
                          }}
                        >
                          <strong
                            className="block mb-1.5 font-black text-[12px] flex items-center gap-1"
                            style={{ color: '#b45309' }}
                          >
                            <span>خطوات الحل والبرهان:</span>
                          </strong>
                          <ol className="list-decimal list-inside space-y-1.5 pr-1">
                            {q.steps.map((step, sIdx) => (
                              <li
                                key={sIdx}
                                className="font-semibold"
                                style={{ lineHeight: '1.7', color: '#1e293b' }}
                              >
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div
                          className="mr-10 text-[11.5px] p-3 rounded-lg font-semibold"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            lineHeight: '1.65',
                          }}
                        >
                          <strong style={{ color: '#0f172a', fontWeight: 800 }}>الشرح والتعليل: </strong>
                          {q.explanation}
                        </div>
                      )}

                      {/* Note / Tip */}
                      {q.notesOrTips && (
                        <div
                          className="mr-10 text-[11px] p-2.5 rounded-lg font-semibold"
                          style={{
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a',
                            color: '#78350f',
                            lineHeight: '1.5',
                          }}
                        >
                          <strong style={{ color: '#b45309' }}>💡 تنبيه: </strong> {q.notesOrTips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div
              className="pt-3 mt-6 flex items-center justify-between text-[11px] font-semibold"
              style={{
                borderTop: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              <div>
                {pdfMode === 'answers-only'
                  ? `ملخص الإجابات فقط لصفحة الكتاب رقم ${page.pageNumber}`
                  : `حلول نموذجية لصفحة الكتاب رقم ${page.pageNumber}`}
              </div>

              {/* Creator Watermark with Subtle Gold Accent */}
              <div
                className="font-black text-[11.5px] flex items-center gap-1 px-2.5 py-0.5 rounded-md"
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span>Made by</span>
                <span style={{ color: '#b45309' }}>Mazen Mohamed</span>
              </div>

              <div>
                صفحة {page.pageNumber} من {pages.length}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
