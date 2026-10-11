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
              minHeight: pdfMode === 'answers-only' ? '1060px' : '1080px',
              padding: pdfMode === 'answers-only' ? '20px 24px' : (isCompact ? '22px 26px' : '26px 28px'),
              backgroundColor: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
              borderColor: '#e2e8f0',
              borderWidth: '1px',
              borderStyle: 'solid',
              direction: 'rtl',
              fontFamily: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              boxSizing: 'border-box',
              lineHeight: '1.6',
              letterSpacing: 'normal',
            }}
          >
            {/* Top Page Content */}
            <div className="flex-1 flex flex-col">
              {/* Header: Clean Two-Row Layout so Title never collides with Branding */}
              <div
                className="pb-3 mb-3"
                style={{
                  borderBottom: '2px solid #e2e8f0',
                  position: 'relative',
                }}
              >
                {/* Decorative golden accent line */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: 0,
                    width: '130px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #b45309, #d97706, #f59e0b)',
                    borderRadius: '2px',
                  }}
                />

                {/* Tier 1: Badges & Platform Info (Never overlapping) */}
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  {/* Right: Book Page & Subject Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[11.5px] px-2.5 py-0.5 rounded-lg shadow-2xs font-extrabold"
                      style={{
                        background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                      }}
                    >
                      صفحة {page.pageNumber} من الكتاب
                    </span>

                    <span
                      className="text-[11.5px] px-2.5 py-0.5 rounded-lg font-bold"
                      style={{
                        backgroundColor: '#fffbeb',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        fontWeight: 700,
                      }}
                    >
                      المادة: {sol.detectedSubject || 'عام'}
                    </span>
                  </div>

                  {/* Left: Branding & Date */}
                  <div className="text-left shrink-0 flex items-center gap-2">
                    <div
                      className="text-[11.5px] font-extrabold flex items-center gap-1 px-2.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        fontWeight: 800,
                      }}
                    >
                      <span>حلول كراستي</span>
                      <span style={{ color: '#d97706' }}>·</span>
                      <span style={{ color: '#b45309' }}>الإجابات المعتمدة</span>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>
                      {new Date().toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Tier 2: Dedicated Full-Width Row for Page Title (No horizontal squeeze or collision) */}
                <h2
                  className={isCompact ? 'text-[15px] font-extrabold' : 'text-[17px] font-extrabold'}
                  style={{
                    color: '#0f172a',
                    lineHeight: '1.5',
                    letterSpacing: 'normal',
                    fontWeight: 800,
                    margin: '2px 0 0 0',
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                  }}
                >
                  {sol.pageTitle || `حلول تمارين صفحة ${page.pageNumber}`}
                </h2>
              </div>

              {/* Optional Page Thumbnail */}
              {showPageThumbnail && (
                <div
                  className="mb-3 flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                  }}
                >
                  <div
                    className="w-14 h-18 rounded-lg overflow-hidden shrink-0"
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
                className="pb-2 mb-2.5 flex items-center justify-between"
                style={{
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Subtle golden bullet accent */}
                  <div
                    style={{
                      width: '4px',
                      height: '14px',
                      background: 'linear-gradient(180deg, #d97706, #f59e0b)',
                      borderRadius: '4px',
                    }}
                  />
                  <span className="font-extrabold text-[13px]" style={{ color: '#0f172a', fontWeight: 800 }}>
                    {pdfMode === 'answers-only' ? 'الإجابات النموذجية المعتمدة' : 'الأسئلة والحلول النموذجية المعتمدة'}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                    style={{
                      backgroundColor: pdfMode === 'answers-only' ? '#fffbeb' : '#f8fafc',
                      color: pdfMode === 'answers-only' ? '#b45309' : '#334155',
                      border: pdfMode === 'answers-only' ? '1px solid #fde68a' : '1px solid #e2e8f0',
                      fontWeight: 700,
                    }}
                  >
                    {pdfMode === 'answers-only' ? '⚡ موجز وسريع (إجابات فقط)' : '📖 حل مفصل وشامل'}
                  </span>
                </div>

                <div className="text-[11px] font-bold" style={{ color: '#64748b' }}>
                  عدد الأسئلة: <span style={{ color: '#0f172a', fontWeight: 800 }}>{sol.questions.length}</span>
                </div>
              </div>

              {/* Questions & Answers Display in Modern Cards */}
              {pdfMode === 'answers-only' ? (
                /* ========================================================================= */
                /* OPTION A: ANSWERS ONLY (Modern Cards - رقم السؤال والإجابة المعتمدة مباشرة) */
                /* ========================================================================= */
                <div className="space-y-2 flex-1">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-2.5 sm:p-3 flex items-start gap-3 transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRight: '4px solid #d97706', // Golden Amber Right Accent Border
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {/* Question Number Badge with Golden Gradient */}
                      <div
                        className="shrink-0 px-2.5 py-1 rounded-lg text-center font-extrabold shadow-2xs"
                        style={{
                          background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)',
                          color: '#ffffff',
                          minWidth: '62px',
                        }}
                      >
                        <div className="text-[11.5px] font-extrabold" style={{ fontWeight: 800, letterSpacing: 'normal' }}>
                          {q.questionNumber || `سؤال ${qIndex + 1}`}
                        </div>
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {/* Golden Subtitle Label */}
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                            style={{
                              backgroundColor: '#fffdf5',
                              color: '#b45309',
                              border: '1px solid #fef3c7',
                              fontWeight: 700,
                            }}
                          >
                            الإجابة:
                          </span>

                          {/* Bold Final Answer */}
                          <span
                            className="font-extrabold text-[13.5px]"
                            style={{
                              color: '#0f172a',
                              fontWeight: 800,
                              lineHeight: '1.5',
                              letterSpacing: 'normal',
                              wordBreak: 'normal',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {q.finalAnswer}
                          </span>
                        </div>

                        {/* Summary explanation note if present */}
                        {q.explanation && (
                          <div
                            className="text-[11px] font-semibold mt-1.5 pt-1"
                            style={{
                              color: '#475569',
                              borderTop: '1px dashed #e2e8f0',
                              lineHeight: '1.45',
                              letterSpacing: 'normal',
                            }}
                          >
                            <span style={{ color: '#b45309', fontWeight: 700 }}>ملاحظة: </span>
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
                <div className="space-y-3 flex-1">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-3 sm:p-3.5 space-y-2.5 transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRight: '4.5px solid #d97706', // Elegant Gold Accent Line
                        boxShadow: '0 2px 8px -2px rgba(180, 83, 9, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        marginBottom: isCompact ? '10px' : '14px',
                      }}
                    >
                      {/* Question Header & Body */}
                      <div className="flex items-start gap-2.5">
                        {/* Number Badge with Amber Gradient */}
                        <span
                          className="shrink-0 w-6 h-6 rounded-lg text-[11px] font-extrabold flex items-center justify-center mt-0.5 shadow-2xs"
                          style={{
                            background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                            color: '#ffffff',
                            fontWeight: 800,
                          }}
                        >
                          {qIndex + 1}
                        </span>

                        <div className="w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-extrabold text-[13px]"
                              style={{ color: '#0f172a', fontWeight: 800, letterSpacing: 'normal' }}
                            >
                              {q.questionNumber || `سؤال ${qIndex + 1}`}
                            </span>

                            {q.questionType && (
                              <span
                                className="text-[9.5px] px-2 py-0.5 rounded-md font-bold"
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0',
                                  fontWeight: 700,
                                }}
                              >
                                {q.questionType}
                              </span>
                            )}
                          </div>

                          {/* Distinct Spacing for Question Prompt */}
                          <p
                            className={isCompact ? 'text-[12.5px] font-bold mt-1.5' : 'text-[13px] font-bold mt-1.5'}
                            style={{
                              color: '#1e293b',
                              fontWeight: 700,
                              lineHeight: '1.6',
                              letterSpacing: 'normal',
                            }}
                          >
                            {q.originalText}
                          </p>
                        </div>
                      </div>

                      {/* Multiple Choice Options if applicable */}
                      {q.options && q.options.length > 0 && (
                        <div
                          className="mr-8 text-[11.5px] grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 rounded-lg"
                          style={{
                            backgroundColor: '#fafaf9',
                            border: '1px solid #e7e5e4',
                            color: '#1e293b',
                            lineHeight: '1.45',
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
                      <div className="mr-8">
                        <div
                          className="rounded-xl p-2.5 sm:p-3"
                          style={{
                            backgroundColor: '#fffdfa',
                            border: '1.5px solid #fde68a',
                            borderRight: '3.5px solid #d97706',
                            boxShadow: '0 1px 4px rgba(217, 119, 6, 0.06)',
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="text-[9.5px] px-1.5 py-0.5 rounded-md font-extrabold"
                              style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                                fontWeight: 800,
                              }}
                            >
                              الإجابة النموذجية المعتمدة
                            </span>
                          </div>

                          <div
                            className={isCompact ? 'font-extrabold text-[13.5px]' : 'font-extrabold text-[14.5px]'}
                            style={{
                              color: '#0f172a',
                              fontWeight: 800,
                              lineHeight: '1.5',
                              letterSpacing: 'normal',
                              wordBreak: 'normal',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {q.finalAnswer}
                          </div>
                        </div>
                      </div>

                      {/* Step-by-step Solution */}
                      {q.steps && q.steps.length > 0 && (
                        <div
                          className="mr-8 text-[11.5px] p-2.5 rounded-lg"
                          style={{
                            backgroundColor: '#fafaf9',
                            border: '1px solid #f1f5f9',
                            color: '#1e293b',
                          }}
                        >
                          <strong
                            className="block mb-1 font-extrabold text-[11.5px] flex items-center gap-1"
                            style={{ color: '#b45309', fontWeight: 800 }}
                          >
                            <span>خطوات الحل والبرهان:</span>
                          </strong>
                          <ol className="list-decimal list-inside space-y-1 pr-1">
                            {q.steps.map((step, sIdx) => (
                              <li
                                key={sIdx}
                                className="font-semibold"
                                style={{ lineHeight: '1.6', color: '#1e293b' }}
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
                          className="mr-8 text-[11px] p-2 rounded-lg font-semibold"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            lineHeight: '1.5',
                          }}
                        >
                          <strong style={{ color: '#0f172a', fontWeight: 700 }}>الشرح والتعليل: </strong>
                          {q.explanation}
                        </div>
                      )}

                      {/* Note / Tip */}
                      {q.notesOrTips && (
                        <div
                          className="mr-8 text-[10.5px] p-2 rounded-lg font-semibold"
                          style={{
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a',
                            color: '#78350f',
                            lineHeight: '1.45',
                          }}
                        >
                          <strong style={{ color: '#b45309', fontWeight: 700 }}>💡 تنبيه: </strong> {q.notesOrTips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page Footer (Always neatly pinned at bottom, never orphaned) */}
            <div
              className="pt-2 mt-4 flex items-center justify-between text-[10.5px] font-semibold shrink-0"
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
                className="font-extrabold text-[11px] flex items-center gap-1 px-2.5 py-0.5 rounded-md"
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  fontWeight: 700,
                  letterSpacing: 'normal',
                }}
              >
                <span>Made by</span>
                <span style={{ color: '#b45309', fontWeight: 800 }}>Mazen Mohamed</span>
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
