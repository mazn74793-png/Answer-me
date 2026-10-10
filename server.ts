import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Increase JSON payload limit to handle base64 document/page images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Safe JSON parser that handles code blocks or wrapped text
function extractJson(text: string): any {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown fences
    let cleaned = text.replace(/```(?:json)?\n?/gi, '').replace(/```\s*$/gi, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Find outermost JSON object
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(cleaned.substring(start, end + 1));
      }
      throw new Error('فشل استخراج بيانات JSON صالحة من الرد.');
    }
  }
}

// Helper with model fallback and backoff retry for speed and resilience
async function generateContentWithRetry(params: any, maxRetries = 3) {
  let attempt = 0;
  // Use gemini-3.1-flash-lite as primary high-speed model with clean quota
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  while (attempt < maxRetries) {
    const activeModel = models[Math.min(attempt, models.length - 1)];
    try {
      return await ai.models.generateContent({
        ...params,
        model: activeModel,
      });
    } catch (err: any) {
      attempt++;
      const isRetryable =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.status === 500 ||
        err?.message?.includes('503') ||
        err?.message?.includes('429') ||
        err?.message?.includes('quota') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isRetryable && attempt < maxRetries) {
        const delay = attempt * 800 + Math.random() * 300;
        console.warn(
          `[Gemini API Retry] Attempt ${attempt}/${maxRetries} temporary issue on ${activeModel}. Retrying in ${Math.round(delay)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('فشلت جميع محاولات الاتصال بالنموذج.');
}

// Response schema for structured page solution
const solutionSchema = {
  type: Type.OBJECT,
  properties: {
    pageTitle: {
      type: Type.STRING,
      description: 'عنوان الصفحة أو اسم الدرس أو الوحدة إن وجد',
    },
    detectedSubject: {
      type: Type.STRING,
      description: 'المادة المكتشفة (رياضيات، لغة عربية، علوم، إنجليزي، فيزياء، كيمياء، دراسات، إلخ)',
    },
    hasHandwriting: {
      type: Type.BOOLEAN,
      description: 'هل تحتوي الصفحة على خط يد أو ملاحظات يدوية؟',
    },
    handwrittenTranscription: {
      type: Type.STRING,
      description: 'تحويل كامل ودقيق لأي نصوص مكتوبة بخط اليد إلى نص رقمي منسق، بما فيها إجابات الطالب أو ملاحظات الهامش',
    },
    pageSummary: {
      type: Type.STRING,
      description: 'ملخص موجز لمحتوى الصفحة والأهداف التعليمية والأسئلة الموجودة بها',
    },
    questions: {
      type: Type.ARRAY,
      description: 'قائمة بجميع الأسئلة والتمارين والمسائل الموجودة في هذه الصفحة مع حلولها النموذجية',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'معرف فريد للسؤال مثل q1, q2',
          },
          questionNumber: {
            type: Type.STRING,
            description: 'رقم السؤال أو رمزه الأصلي في الكتاب (مثل: س١، تمرين (٣)، السؤال الثاني، 4.a)',
          },
          originalText: {
            type: Type.STRING,
            description: 'نص السؤال كما هو مكتوب في الكتاب، مع تفريغ أي خط يد أو خيارات',
          },
          questionType: {
            type: Type.STRING,
            description: 'نوع السؤال: اختيار من متعدد، صح وخطأ، مسألة رياضية/فيزيائية، إعراب ونحو، علل/بم تفسر، مقالي، أكمل الفراغ',
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'الخيارات المتاحة إذا كان السؤال اختياراً من متعدد',
          },
          finalAnswer: {
            type: Type.STRING,
            description: 'الإجابة النهائية المركزة والمباشرة للسؤال (الخيار الصحيح، الرقم النهائي، الكلمة المطلوبة)',
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'خطوات الحل التفصيلية خطوة بخطوة بالترتيب المنطقي والقوانين المستخدمة',
          },
          explanation: {
            type: Type.STRING,
            description: 'شرح وتوضيح سبب صحة الإجابة أو القاعدة العلمية/اللغوية المستند إليها',
          },
          notesOrTips: {
            type: Type.STRING,
            description: 'نصيحة للطالب أو تنبيه من خطأ شائع متعلق بهذا السؤال',
          },
        },
        required: ['id', 'originalText', 'finalAnswer'],
      },
    },
    additionalNotes: {
      type: Type.STRING,
      description: 'أي ملاحظات إضافية تخص حل هذه الصفحة',
    },
  },
  required: ['questions'],
};

// API Route: Solve Page with Multimodal Vision & OCR
app.post('/api/solve-page', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      pageNumber = 1,
      mode = 'full-solve',
      subject = 'general',
      solutionDepth = 'detailed',
      language = 'ar',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'مفتاح Gemini API غير متاح في إعدادات البيئة (GEMINI_API_KEY).',
      });
    }

    let detectedMime = mimeType || 'image/jpeg';
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    if (mimeMatch) {
      detectedMime = mimeMatch[1];
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    console.log(
      `[solve-page] Processing page ${pageNumber} (mime: ${detectedMime}, payload: ${Math.round(
        cleanBase64.length / 1024
      )} KB)...`
    );

    const systemInstruction = `أنت معلم وأستاذ خبير ومصحح ومترجم نصوص عالي الدقة.
مهمتك الرئيسية:
1. فحص هذه الصفحة من الكتاب المدرسي أو كراسة التمارين أو ورقة الامتحان بدقة متناهية.
2. تحويل أي نصوص أو حلول مكتوبة بخط اليد (Handwritten OCR) إلى نصوص رقمية عربية أو إنجليزية نقية بنسبة دقة 100%.
3. رصد كافة الأسئلة والتمارين والمسائل المطروحة في هذه الصفحة دون إغفال أي سؤال مهما كان صغيراً (أ، ب، ج، 1، 2، 3).
4. تقديم الحلول النموذجية والدقيقة لكل سؤال:
   - حل علمي ورياضي ولغوي سليم 100%.
   - خطوات مفصلة ومنظمة (Step-by-step) إذا تطلب الأمر.
   - إبراز الإجابة النهائية بوضوح فائق لتسهيل مراجعتها وحفظها.
5. الالتزام باللغة العربية الواضحة الفصيحة والمصطلحات المعتمدة للمناهج التعليمية. إذا كانت المادة لغات (English / French / Math بالإنجليزية)، اكتب السؤال والحل بلغته مع ترجمة وشرح عند الحاجة.
6. تنظيم المخرجات لتناسب تصديرها في صفحة واحدة مستقلة لكل صفحة كتاب أصلي.`;

    const promptText = `هذه هي الصفحة رقم ${pageNumber} من الكتاب أو الملف المرفوع.
التخصص المختار: ${subject === 'math_science' ? 'رياضيات وعلوم' : subject === 'languages' ? 'لغات وقواعد' : subject === 'humanities' ? 'مواد أدبية وإنسانية' : 'عام / شامل'}.
عمق الحل المطلوب: ${solutionDepth === 'detailed' ? 'مفصل مع الخطوات والقوانين' : solutionDepth === 'concise' ? 'مختصر ومباشر' : 'مفصل مع الشرح التعليمي'}.
وضع العمل: ${mode === 'ocr-handwriting' ? 'التركيز الأساسي على تحويل الخط اليدوي إلى نص رقمي دقيق مع حل أي تمارين مرتبطة' : 'حل شامل لجميع أسئلة الصفحة مع تحويل الخط اليدوي'}.

يرجى تحليل الصفحة واستخراج كافة النصوص والأسئلة وحلها بأعلى درجات الدقة بصيغة JSON المطابقة للنموذج المرفق.`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: detectedMime,
      },
    };

    const textPart = {
      text: promptText,
    };

    const t0 = Date.now();
    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: solutionSchema,
        temperature: 0.1,
      },
    });

    console.log(`[solve-page] Page ${pageNumber} completed successfully in ${Date.now() - t0}ms`);

    const responseText = response.text;
    if (!responseText) {
      throw new Error('لم يتم استلام نص استجابة من نموذج الذكاء الاصطناعي.');
    }

    const parsedData = extractJson(responseText);
    parsedData.pageTitle = parsedData.pageTitle || `حلول صفحة ${pageNumber}`;
    parsedData.detectedSubject = parsedData.detectedSubject || (subject === 'math_science' ? 'رياضيات وعلوم' : subject === 'languages' ? 'لغات وقواعد' : 'عام');
    parsedData.pageSummary = parsedData.pageSummary || `حلول تمارين ومسائل صفحة ${pageNumber}`;
    parsedData.questions = Array.isArray(parsedData.questions) ? parsedData.questions : [];

    return res.json({
      success: true,
      pageNumber,
      data: parsedData,
    });
  } catch (err: any) {
    console.error('Error in /api/solve-page:', err);
    return res.status(500).json({
      error: err?.message || 'حدث خطأ أثناء معالجة الصفحة وحل الأسئلة.',
    });
  }
});

// API Route: Refine / Ask specific question or regenerate single answer
app.post('/api/refine-answer', async (req, res) => {
  try {
    const {
      questionText,
      currentAnswer,
      userInstruction,
      imageBase64,
      mimeType = 'image/jpeg',
    } = req.body;

    if (!questionText || !userInstruction) {
      return res.status(400).json({ error: 'questionText and userInstruction are required' });
    }

    const parts: any[] = [];
    if (imageBase64) {
      let detectedMime = mimeType || 'image/jpeg';
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      if (mimeMatch) {
        detectedMime = mimeMatch[1];
      }
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: detectedMime,
        },
      });
    }

    parts.push({
      text: `السؤال الحالي: "${questionText}"
الإجابة الحالية: "${currentAnswer || 'لا يوجد'}"
توجيه المستخدم أو التعديل المطلوب: "${userInstruction}"

يرجى إعادة صياغة أو تصحيح أو تفصيل الحل بناءً على هذا التوجيه، وإرجاع نص الحل النهائي والشرح بوضوح ودقة عالية. أرجع النتيجة في كائن JSON:
{
  "updatedAnswer": "...",
  "updatedSteps": ["..."],
  "updatedExplanation": "..."
}`,
    });

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: {
        parts,
      },
      config: {
        systemInstruction: 'أنت مساعد تعليمي خبير في تصحيح وتعديل الإجابات وحل المسائل.',
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = extractJson(response.text || '{}');
    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error in /api/refine-answer:', err);
    return res.status(500).json({
      error: err?.message || 'حدث خطأ أثناء تعديل الإجابة.',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.1-flash-lite',
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Only listen when running as standalone Node process (not inside Vercel serverless function)
  if (!process.env.VERCEL) {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${port}`);
    });
  }
}

startServer();

export default app;
