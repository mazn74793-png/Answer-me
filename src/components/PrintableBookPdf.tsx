import React from 'react';
import {
  FileText,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  PenTool,
} from 'lucide-react';
import { BookPage } from '../types';

export type PdfExportMode = 'full' | 'answers-only';

export interface PrintableBookPdfProps {
  pages: BookPage[];
  fontSize?: 'compact' | 'standard';
  showPageThumbnail?: boolean;
  pdfMode?: PdfExportMode; // 'full': Question + Steps + Explanation + Answer (مطابق تماماً لصفحة عرض الإجابات والمعاينة); 'answers-only': Question number/title + Direct Answer only
}

export const PrintableBookPdf: React.FC<PrintableBookPdfProps> = ({
  pages,
  fontSize = 'standard',
  showPageThumbnail = false,
  pdfMode = 'full',
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
              minHeight: '1080px',
              padding: isCompact ? '22px 26px' : '26px 28px',
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
                className="pb-3.5 mb-3.5"
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
                    width: '140px',
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
                      className="text-[12px] px-3 py-0.5 rounded-lg shadow-2xs font-extrabold flex items-center gap-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                      }}
                    >
                      <span>صفحة {page.pageNumber} من الكتاب</span>
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

                    <span
                      className="text-[11px] px-2 py-0.5 rounded-lg font-semibold"
                      style={{
                        backgroundColor: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      عدد الأسئلة: {sol.questions.length}
                    </span>

                    {(sol.hasHandwriting || sol.handwrittenTranscription) && (
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-lg font-bold"
                        style={{
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                        }}
                      >
                        يحتوي على خط يد ✍️
                      </span>
                    )}
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

                {/* Tier 2: Dedicated Full-Width Row for Page Title */}
                <h2
                  className={isCompact ? 'text-[15px] font-extrabold' : 'text-[17px] font-extrabold'}
                  style={{
                    color: '#0f172a',
                    lineHeight: '1.5',
                    letterSpacing: 'normal',
                    fontWeight: 800,
                    margin: '3px 0 0 0',
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
                  className="mb-3.5 flex items-center gap-3 p-2.5 rounded-xl"
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

              {/* Page Summary Box (Identical to SolutionCard.tsx) */}
              {sol.pageSummary && (
                <div
                  className="p-3.5 rounded-xl text-xs leading-relaxed mb-3.5"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    lineHeight: '1.6',
                  }}
                >
                  <strong style={{ color: '#0f172a', fontWeight: 800 }}>ملخص ومحتوى الصفحة: </strong>
                  <span>{sol.pageSummary}</span>
                </div>
              )}

              {/* FEATURE: Digitized Handwritten Text (OCR) - Matches SolutionCard.tsx */}
              {sol.handwrittenTranscription && (
                <div
                  className="rounded-xl p-3.5 mb-3.5"
                  style={{
                    backgroundColor: '#fffdf5',
                    border: '1px solid #fde68a',
                    borderRight: '4px solid #d97706',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4" style={{ color: '#b45309' }} />
                      <h4
                        className="text-xs font-black"
                        style={{ color: '#78350f', fontWeight: 800 }}
                      >
                        النصوص المكتوبة بخط اليد المكتشفة (تحويل رقمي دقيق)
                      </h4>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                      }}
                    >
                      تفريغ خط اليد ✍️
                    </span>
                  </div>

                  <div
                    className="text-xs whitespace-pre-wrap leading-relaxed p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#451a03',
                      border: '1px solid rgba(253, 230, 138, 0.7)',
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      lineHeight: '1.6',
                    }}
                  >
                    {sol.handwrittenTranscription}
                  </div>
                </div>
              )}

              {/* Solved Questions Section Header Bar */}
              <div
                className="pb-2 mb-3 flex items-center justify-between"
                style={{
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '4px',
                      height: '14px',
                      background: 'linear-gradient(180deg, #d97706, #f59e0b)',
                      borderRadius: '4px',
                    }}
                  />
                  <span className="font-extrabold text-[13px] flex items-center gap-1.5" style={{ color: '#0f172a', fontWeight: 800 }}>
                    <FileText className="w-4 h-4" style={{ color: '#475569' }} />
                    <span>الأسئلة والحلول النموذجية المكتشفة ({sol.questions.length})</span>
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                    style={{
                      backgroundColor: '#fffbeb',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      fontWeight: 700,
                    }}
                  >
                    {pdfMode === 'answers-only' ? '⚡ بطاقات الإجابات فقط' : '📖 مطابقة لمعاينة المستندات'}
                  </span>
                </div>

                <div className="text-[11px] font-bold" style={{ color: '#64748b' }}>
                  جاهزة للتصدير (PDF / Word / TXT)
                </div>
              </div>

              {/* Questions & Solutions List */}
              {pdfMode === 'answers-only' ? (
                /* ========================================================================= */
                /* OPTION A: ANSWERS ONLY (Compact Modern Cards)                             */
                /* ========================================================================= */
                <div className="space-y-2.5 flex-1">
                  {sol.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-3 flex items-start gap-3 transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRight: '4px solid #d97706',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {/* Golden Gradient Number Badge */}
                      <span
                        className="shrink-0 w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs"
                        style={{
                          background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                        }}
                      >
                        {qIndex + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-xs font-black"
                            style={{ color: '#0f172a', fontWeight: 800 }}
                          >
                            {q.questionNumber || `سؤال ${qIndex + 1}`}
                          </span>
                          {q.questionType && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                              style={{
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              {q.questionType}
                            </span>
                          )}
                          {q.isUserEdited && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                              style={{
                                backgroundColor: '#fffbeb',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                              }}
                            >
                              مُعدّل
                            </span>
                          )}
                        </div>

                        {/* Approved Answer Subcard */}
                        <div
                          className="rounded-lg p-2.5 mt-1"
                          style={{
                            backgroundColor: '#fffdf5',
                            border: '1px solid #fde68a',
                            borderRight: '3px solid #d97706',
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-extrabold"
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
                          <p
                            className="text-xs sm:text-sm font-black"
                            style={{
                              color: '#0f172a',
                              fontWeight: 800,
                              lineHeight: '1.5',
                              wordBreak: 'normal',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {q.finalAnswer}
                          </p>
                        </div>

                        {q.explanation && (
                          <div
                            className="text-[11px] font-semibold mt-1.5 pt-1"
                            style={{
                              color: '#475569',
                              borderTop: '1px dashed #e2e8f0',
                              lineHeight: '1.45',
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
                /* OPTION B: FULL QUESTIONS & SOLUTIONS (EXACTLY MATCHING SolutionCard.tsx)  */
                /* ========================================================================= */
                <div className="space-y-3.5 flex-1">
                  {sol.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-4 sm:p-5 space-y-3.5 transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        borderRight: '4px solid #f59e0b',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
                        breakInside: 'avoid',
                        pageBreakInside: 'avoid',
                        marginBottom: isCompact ? '12px' : '16px',
                      }}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 w-full">
                          {/* Golden Gradient Number Badge */}
                          <span
                            className="shrink-0 w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs"
                            style={{
                              background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)',
                              color: '#ffffff',
                              fontWeight: 800,
                            }}
                          >
                            {idx + 1}
                          </span>

                          <div className="w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-xs font-black"
                                style={{ color: '#0f172a', fontWeight: 800 }}
                              >
                                {q.questionNumber || `سؤال ${idx + 1}`}
                              </span>
                              {q.questionType && (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  {q.questionType}
                                </span>
                              )}
                              {q.isUserEdited && (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                                  style={{
                                    backgroundColor: '#fffbeb',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                  }}
                                >
                                  مُعدّل
                                </span>
                              )}
                            </div>

                            {/* Question Text with comfortable line-height and spacing */}
                            <p
                              className={isCompact ? 'text-xs font-bold mt-2 leading-relaxed' : 'text-xs sm:text-sm font-semibold mt-2 leading-relaxed'}
                              style={{
                                color: '#1e293b',
                                lineHeight: '1.6',
                              }}
                            >
                              {q.originalText}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Multiple choice options if exist */}
                      {q.options && q.options.length > 0 && (
                        <div
                          className="mr-10 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(248, 250, 252, 0.8)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                          }}
                        >
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="text-xs font-medium flex items-center gap-1.5"
                              style={{ color: '#334155' }}
                            >
                              <span style={{ color: '#d97706', fontSize: '10px' }}>●</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solution Box: Final Answer with Warm Champagne / Gold Accents (Matches SolutionCard.tsx) */}
                      <div className="mr-10">
                        <div
                          className="rounded-xl p-3.5"
                          style={{
                            backgroundColor: 'rgba(255, 251, 235, 0.4)',
                            border: '1px solid rgba(253, 230, 138, 0.9)',
                            borderRight: '3px solid #f59e0b',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className="text-[10.5px] px-2 py-0.5 rounded-md font-extrabold"
                              style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid rgba(253, 230, 138, 0.7)',
                                fontWeight: 800,
                              }}
                            >
                              الإجابة النموذجية المعتمدة
                            </span>
                          </div>
                          <p
                            className={isCompact ? 'text-xs sm:text-sm font-black leading-relaxed' : 'text-sm font-black leading-relaxed'}
                            style={{
                              color: '#020617',
                              fontWeight: 800,
                              lineHeight: '1.6',
                              wordBreak: 'normal',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {q.finalAnswer}
                          </p>
                        </div>
                      </div>

                      {/* Step by step */}
                      {q.steps && q.steps.length > 0 && (
                        <div
                          className="mr-10 p-3 rounded-lg space-y-1.5"
                          style={{
                            backgroundColor: 'rgba(248, 250, 252, 0.7)',
                            border: '1px solid rgba(226, 232, 240, 0.7)',
                          }}
                        >
                          <span
                            className="text-[11px] font-bold block"
                            style={{ color: '#78350f', fontWeight: 800 }}
                          >
                            خطوات الحل التفصيلية:
                          </span>
                          <ol className="list-decimal list-inside space-y-1 text-xs pr-1" style={{ color: '#334155' }}>
                            {q.steps.map((st, sIdx) => (
                              <li key={sIdx} className="leading-relaxed font-medium">
                                {st}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div
                          className="mr-10 text-xs leading-relaxed p-3 rounded-lg"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            lineHeight: '1.6',
                          }}
                        >
                          <strong style={{ color: '#0f172a', fontWeight: 800 }}>الشرح والتعليل: </strong>
                          <span>{q.explanation}</span>
                        </div>
                      )}

                      {/* Tip/Note */}
                      {q.notesOrTips && (
                        <div
                          className="mr-10 flex items-start gap-1.5 text-[11px] p-2.5 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(255, 251, 235, 0.6)',
                            border: '1px solid rgba(253, 230, 138, 0.6)',
                            color: '#78350f',
                          }}
                        >
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                          <span className="font-medium">{q.notesOrTips}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page Footer (Pinned at bottom, matching clean style) */}
            <div
              className="pt-3 mt-4 flex items-center justify-between text-[10.5px] font-semibold shrink-0"
              style={{
                borderTop: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              <div>
                {pdfMode === 'answers-only'
                  ? `ملخص بطاقات الإجابات لصفحة الكتاب رقم ${page.pageNumber}`
                  : `حلول نموذجية معتمدة لصفحة الكتاب رقم ${page.pageNumber}`}
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
