/**
 * Generates sample textbook page images with handwriting for immediate demonstration
 */
export function createSampleBookPage(pageNumber: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - vintage notebook paper with subtle lines
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top header bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(60, 60, canvas.width - 120, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Cairo, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`كتاب الرياضيات والعلوم - الفصل الدراسي الثاني · صفحة ${pageNumber}`, canvas.width - 100, 112);

  // Ruled notebook lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  for (let y = 200; y < canvas.height - 100; y += 45) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(canvas.width - 80, y);
    ctx.stroke();
  }

  // Margin line
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(220, 180);
  ctx.lineTo(220, canvas.height - 80);
  ctx.stroke();

  if (pageNumber === 1) {
    // Printed Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Cairo, sans-serif';
    ctx.fillText('الوحدة الثالثة: المعادلات الخطية والمتباينات', canvas.width - 100, 240);

    // Question 1 (Printed)
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('السؤال الأول: اختر الإجابة الصحيحة مما بين القوسين:', canvas.width - 100, 330);

    ctx.font = '26px Cairo, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('١) إذا كان ٢س + ٥ = ١٥، فإن قيمة س تساوي:', canvas.width - 120, 420);
    ctx.fillText('[ أ) ٣        ب) ٥        ج) ٧        د) ١٠ ]', canvas.width - 160, 470);

    // Handwritten student answer and note (Simulated handwritten font/style)
    ctx.font = 'italic 28px "Caveat", "Comic Sans MS", cursive, Cairo';
    ctx.fillStyle = '#1d4ed8'; // blue pen ink
    ctx.fillText('الحل بخط اليد: ٢س = ١٥ - ٥ = ١٠  إذن س = ٥  (الخيار ب)', canvas.width - 180, 530);

    // Question 2 (Printed)
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('السؤال الثاني: مسألة حسابية وتطبيقية:', canvas.width - 100, 640);

    ctx.font = '26px Cairo, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('مستطيل طوله يزيد عن عرضه بمقدار ٤ سم، ومحيطه يساوي ٤٨ سم.', canvas.width - 120, 720);
    ctx.fillText('المطلوب: أوجد طول وعرض المستطيل ومساحته مع توضيح خطوات الحل.', canvas.width - 120, 770);

    // Handwritten student notes in blue pen
    ctx.font = 'italic 28px cursive, Cairo';
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText('فرض العرض = س ، الطول = س + ٤', canvas.width - 150, 860);
    ctx.fillText('المحيط = ٢ × (الطول + العرض) = ٤٨ سم', canvas.width - 150, 910);
    ctx.fillText('٢ (س + س + ٤) = ٤٨  ==>  ٤س + ٨ = ٤٨', canvas.width - 150, 960);
    ctx.fillText('٤س = ٤٠  ==>  س = ١٠ سم (العرض)، والطول = ١٤ سم', canvas.width - 150, 1010);
    ctx.fillText('المساحة = الطول × العرض = ١٤ × ١٠ = ١٤٠ سم²', canvas.width - 150, 1060);

    // Marginalia in red pencil/pen on the left margin
    ctx.save();
    ctx.font = 'bold 24px cursive, Cairo';
    ctx.fillStyle = '#dc2626'; // red ink
    ctx.textAlign = 'center';
    ctx.fillText('هام للامتحان!', 140, 450);
    ctx.fillText('تأكد من وحدة', 140, 500);
    ctx.fillText('المساحة سم²', 140, 540);
    ctx.restore();

    // Question 3 (Printed)
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('السؤال الثالث: ضع علامة (✓) أو (✗) مع تصويب الخطأ:', canvas.width - 100, 1180);

    ctx.font = '26px Cairo, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('أ) ميل المستقيم الموازي لمحور السينات يساوي صفراً. (    )', canvas.width - 120, 1260);
    ctx.fillText('ب) النقطة (٣ ، -٢) تقع في الربع الثاني من الشبكة التربيعية. (    )', canvas.width - 120, 1330);

    // Handwritten answers in pencil
    ctx.font = 'italic 26px cursive, Cairo';
    ctx.fillStyle = '#374151'; // pencil gray
    ctx.fillText('إجابة الطالب: أ) ✓ صحيحة', canvas.width - 150, 1400);
    ctx.fillText('ب) ✗ خطأ - تقع في الربع الرابع لأن س موجب وص سالب', canvas.width - 150, 1450);
  } else {
    // Page 2 Sample
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Cairo, sans-serif';
    ctx.fillText('درس النحو: إعراب الجملة الفعلية والأفعال الخمسة', canvas.width - 100, 240);

    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('السؤال الأول: أعرب ما تحته خط في الجمل الآتية إعراباً تاماً:', canvas.width - 100, 330);

    ctx.font = '26px Cairo, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('١) الطلابُ "يجتهدون" في دروسِهم لِيُحَقِّقُوا النجاح.', canvas.width - 120, 420);
    ctx.fillText('٢) لا "تَتَهَاوَنُوا" في أداءِ الواجبِ الوطني.', canvas.width - 120, 490);

    // Handwritten student attempt
    ctx.font = 'italic 28px cursive, Cairo';
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText('ملاحظات الطالب بخط اليد: يجتهدون فعل مضارع مرفوع بثبوت النون', canvas.width - 150, 580);
    ctx.fillText('وواو الجماعة ضمير متصل في محل رفع فاعل.', canvas.width - 150, 630);

    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('السؤال الثاني: استخرج من الفقرة الآتية:', canvas.width - 100, 740);

    ctx.font = '26px Cairo, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('"العلمُ نورٌ يُنيرُ دروبَ الإنسانية، والمعلمون يبنون الأجيال بعزمٍ وإخلاص."', canvas.width - 120, 820);
    ctx.fillText('المطلوب: ١- خبراً وبيّن نوعه.  ٢- فعلاً من الأفعال الخمسة.  ٣- فاعلاً ضميراً مستتراً.', canvas.width - 120, 880);

    // Margin note
    ctx.save();
    ctx.font = 'bold 24px cursive, Cairo';
    ctx.fillStyle = '#16a34a'; // green ink
    ctx.textAlign = 'center';
    ctx.fillText('مراجعة', 140, 400);
    ctx.fillText('قواعد الإعراب', 140, 440);
    ctx.fillText('قبل الاختبار', 140, 480);
    ctx.restore();
  }

  // Footer page number
  ctx.fillStyle = '#64748b';
  ctx.font = '22px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`- ${pageNumber} -`, canvas.width / 2, canvas.height - 40);

  return canvas.toDataURL('image/jpeg', 0.92);
}
