import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

process.env.GOOGLE_GENAI_API_VERSION = 'v1alpha';

// Shared GoogleGenAI instance server-side (following @google/genai guidelines)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: 'v1alpha',
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & Status endpoint for free quota transparency
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);
  res.json({
    ok: true,
    hasApiKey: hasKey,
    freeTierOnly: true,
    engine: 'Google Gemini TTS Engine (Free Tier)',
    supportedVoices: [
      { id: 'Fenrir', base: 'Fenrir', pitch: 'Deep / Baritone', tone: 'فخم ووقور' },
      { id: 'Charon', base: 'Charon', pitch: 'Authoritative / Mid-Low', tone: 'رسمي وإخباري' },
      { id: 'Puck', base: 'Puck', pitch: 'Warm / Natural', tone: 'حواري وجذاب' },
      { id: 'Zephyr', base: 'Zephyr', pitch: 'Modern / Dynamic', tone: 'حيوي وعصري' },
      { id: 'Kore', base: 'Kore', pitch: 'Calm / Gentle', tone: 'هادئ ومحاور' },
    ],
    defaultModel: 'gemini-3.8-flash-tts',
    fallbackModel: 'gemini-3.8-flash-lite-tts',
  });
});

// Single-speaker TTS generation
app.post('/api/tts/generate', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(401).json({
        error: 'مفتاح Gemini API غير مهيأ في بيئة الخادم. يرجى التأكد من توفر المفتاح في لوحة أسرار AI Studio.',
        code: 'MISSING_API_KEY',
      });
    }

    const {
      text,
      voiceName = 'Fenrir',
      model = 'gemini-3.8-flash-tts',
      stylePrompt = 'Deep resonant luxurious Arabic broadcast voice with measured pacing and authoritative baritone warmth',
      emotion = 'formal',
      language = 'ar',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'يرجى إدخال النص المراد توليده صوتياً' });
    }

    // Compose rich acoustic instruction combining voice styling and delivery cues
    let acousticDirective = stylePrompt;
    if (language === 'ar-iq') {
      acousticDirective += ' in prestigious Iraqi media dialect and rhythm.';
    } else if (language === 'ar') {
      acousticDirective += ' in impeccable Classical Arabic (فصحى) with resonant diction.';
    } else if (language === 'en') {
      acousticDirective += ' in fluent, deep transatlantic English baritone.';
    }

    if (emotion && emotion !== 'neutral') {
      acousticDirective += ` Delivery mood: ${emotion}.`;
    }

    // Call Gemini 3.8 TTS via GoogleGenAI unary call (returns full WAV with 44-byte RIFF header)
    let response;
    const generateAudio = async (useSpeechMetadata: boolean, targetModel: string) => {
      const parts = useSpeechMetadata
        ? [
            {
              text: text.trim(),
              speechMetadata: {
                style: acousticDirective,
              },
            },
          ]
        : [
            {
              text: `[Delivery: ${acousticDirective}]\n${text.trim()}`,
            },
          ];

      return await ai.models.generateContent({
        model: targetModel,
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
    };

    try {
      response = await generateAudio(true, model || 'gemini-3.8-flash-tts');
    } catch (primaryErr: any) {
      const errMsg = primaryErr?.message || '';
      console.warn('Primary TTS attempt failed:', errMsg);

      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        return res.status(429).json({
          error: 'تم الوصول إلى الحد الأقصى للحصة المجانية اللحظية (Rate Limit). يرجى الانتظار 30 ثانية قبل المحاولة مجدداً.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds: 30,
        });
      }

      // If failed due to speechMetadata schema, retry without speechMetadata
      if (errMsg.includes('speechMetadata') || errMsg.includes('INVALID_ARGUMENT')) {
        try {
          console.log('Retrying without speechMetadata on v1alpha...');
          response = await generateAudio(false, model || 'gemini-3.8-flash-tts');
        } catch (retryErr: any) {
          const retryMsg = retryErr?.message || '';
          if (retryMsg.includes('RESOURCE_EXHAUSTED') || retryMsg.includes('429')) {
            return res.status(429).json({
              error: 'تم الوصول إلى الحد الأقصى للحصة المجانية اللحظية. يرجى الانتظار قليلاً.',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfterSeconds: 30,
            });
          }
          // Fall back to gemini-3.8-flash-lite-tts
          console.warn('Falling back to gemini-3.8-flash-lite-tts...');
          response = await generateAudio(false, 'gemini-3.8-flash-lite-tts');
        }
      } else {
        // Fall back to gemini-3.8-flash-lite-tts
        console.warn('Falling back to gemini-3.8-flash-lite-tts due to:', errMsg);
        response = await generateAudio(false, 'gemini-3.8-flash-lite-tts');
      }
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({
        error: 'لم يتمكن المحرك من إرجاع بيانات صوتية. تحقق من سلامة النص والمحاولة لاحقاً.',
      });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      sampleRate: 24000,
      format: 'WAV 24kHz Mono 16-bit',
      voiceUsed: voiceName,
      modelUsed: model,
    });
  } catch (error: any) {
    console.error('Error generating single-speaker speech:', error);
    const message = error?.message || 'حدث خطأ أثناء معالجة التوليد الصوتي';
    const isQuota = message.includes('RESOURCE_EXHAUSTED') || message.includes('429');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? 'تم استهلاك الحصة المجانية المؤقتة. يرجى الانتظار دقيقة واحدة ثم إعادة المحاولة مجاناً.'
        : message,
      code: isQuota ? 'RATE_LIMIT_EXCEEDED' : 'TTS_ERROR',
      retryAfterSeconds: isQuota ? 45 : undefined,
    });
  }
});

// Multi-speaker / Interview Mode TTS Generation
app.post('/api/tts/interview', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(401).json({
        error: 'مفتاح Gemini API غير مهيأ في بيئة الخادم. يرجى التأكد من توفر المفتاح في لوحة أسرار AI Studio.',
        code: 'MISSING_API_KEY',
      });
    }

    const {
      dialogue,
      speaker1 = { name: 'المقدم', voice: 'Fenrir', style: 'مقدم إعلامي رصين وفخم' },
      speaker2 = { name: 'الضيف', voice: 'Puck', style: 'ضيف مثقف وطبيعي الإلقاء' },
      interviewStyle = 'Prestigious television studio interview, respectful cadence and professional dynamic dialogue',
    } = req.body;

    if (!Array.isArray(dialogue) || dialogue.length === 0) {
      return res.status(400).json({ error: 'قائمة الحوار فارغة. يرجى كتابة أو اختيار نصوص الحوار.' });
    }

    let response;
    const generateInterviewCall = async (withSpeechMetadata: boolean) => {
      const interviewParts = dialogue.map((line: { speaker: string; text: string; style?: string }) => {
        const isHost = line.speaker === 'speaker1' || line.speaker === speaker1.name || line.speaker === 'host';
        const speakerLabel = isHost ? speaker1.name : speaker2.name;
        const baseStyle = isHost ? speaker1.style : speaker2.style;
        const combinedStyle = line.style ? `${baseStyle}. ${line.style}` : `${baseStyle}. ${interviewStyle}`;

        if (withSpeechMetadata) {
          return {
            text: `${speakerLabel}: ${line.text}`,
            speechMetadata: {
              speaker: speakerLabel,
              style: combinedStyle,
            },
          };
        }
        return {
          text: `${speakerLabel}: ${line.text}`,
        };
      });

      return await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: interviewParts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1.voice || 'Fenrir' },
                  },
                },
                {
                  speaker: speaker2.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2.voice || 'Puck' },
                  },
                },
              ],
            },
          },
        },
      });
    };

    try {
      response = await generateInterviewCall(true);
    } catch (primaryErr: any) {
      const errMsg = primaryErr?.message || '';
      console.warn('Primary interview call failed:', errMsg);
      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        return res.status(429).json({
          error: 'تم استهلاك الحصة اللحظية لموديل الحوار المتعدد. انتظر 40 ثانية ثم حاول مجدداً.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds: 40,
        });
      }
      if (errMsg.includes('speechMetadata') || errMsg.includes('INVALID_ARGUMENT')) {
        console.log('Retrying interview generation without speechMetadata on v1alpha...');
        response = await generateInterviewCall(false);
      } else {
        throw primaryErr;
      }
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({
        error: 'لم يتمكن المحرك من دمج المسارين الصوتيين للقاء.',
      });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      sampleRate: 24000,
      speaker1: speaker1.name,
      speaker2: speaker2.name,
    });
  } catch (error: any) {
    console.error('Error generating interview speech:', error);
    const message = error?.message || 'حدث خطأ أثناء توليد الحوار الإعلامي';
    const isQuota = message.includes('RESOURCE_EXHAUSTED') || message.includes('429');
    return res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? 'تم استهلاك الحصة اللحظية لموديل الحوار المتعدد. انتظر 40 ثانية ثم حاول مجدداً.'
        : message,
      code: isQuota ? 'RATE_LIMIT_EXCEEDED' : 'INTERVIEW_ERROR',
      retryAfterSeconds: isQuota ? 40 : undefined,
    });
  }
});

// Script Enhancement Assistant for broadcast performance
app.post('/api/script/enhance', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(401).json({ error: 'مفتاح API غير متوفر' });
    }

    const { text, mode = 'media' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'النص فارغ' });
    }

    let modeInstruction = '';
    switch (mode) {
      case 'media':
        modeInstruction = 'أعد صياغة النص بأسلوب إعلامي رسمي وفخم، مع الحفاظ الدقيق على المعنى الأصلي دون تزييف، وإضافة علامات ترقيم تخدم وقفات المذيع.';
        break;
      case 'documentary':
        modeInstruction = 'أعد صياغة النص بأسلوب وثائقي عميق ومهيب، مع وقفات شعرية أو درامية فخمة تناسب السرد الوثائقي السينمائي.';
        break;
      case 'interview':
        modeInstruction = 'صغ النص ليكون ملائماً لسؤال أو جواب في لقاء تلفزيوني راقٍ، بأسلوب حواري عفوي ولكن رفيع المستوى.';
        break;
      case 'iraqi_media':
        modeInstruction = 'صغ النص بالأسلوب واللهجة الإعلامية العراقية الراقية والرصينة (المستخدمة في نشرات الأخبار والبرامج الحوارية العراقية الفخمة) مع فصاحة الكلمات.';
        break;
      case 'pauses':
        modeInstruction = 'حافظ على الكلمات كما هي تماماً، ولكن وزّع علامات الترقيم (، ... .) وإشارات الوقف بدقة هندسية تناسب إيقاع النفس الصوتي.';
        break;
      case 'natural_breath':
        modeInstruction = 'أضف علامات تنفس صوتية طبيعية مناسبة في الأماكن الدقيقة مثل <breath> ووقفات متوازنة لجعل الإلقاء البشري يبدو حياً ونابضاً.';
        break;
      case 'tashkeel':
        modeInstruction = 'شكّل النص العربي تشكيلاً لغوياً فصيحاً ودقيقاً لضمان خلو نطق محرك الذكاء الاصطناعي من أي لحن أو خطأ إعرابي.';
        break;
      default:
        modeInstruction = 'حسّن النص ليكون جاهزاً لإلقاء صوتي فخم ومريح للأذن.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت كبير مهندسي الإلقاء الصوتي وكتابة النصوص الإذاعية في استوديو BARITONE AI.
المهمة: ${modeInstruction}
قاعدة صارمة: لا تغير جوهر المعنى أبداً، ولا تضف شروحات أو مقدمات. أرجع النص المحسن فقط ليتم إلقاؤه مباشرة.

النص الأصلي:
${text}`,
    });

    const enhanced = (response.text || '').trim();
    return res.json({ enhancedText: enhanced });
  } catch (error: any) {
    console.error('Error enhancing script:', error);
    return res.status(500).json({ error: 'تعذر تحسين النص حالياً.' });
  }
});

// Generate realistic interview dialogue based on a topic
app.post('/api/script/generate-interview', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(401).json({ error: 'مفتاح API غير متوفر' });
    }

    const { topic = 'مستقبل الذكاء الاصطناعي في الإعلام', hostName = 'المقدم', guestName = 'الضيف' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت معد برامج حوارية تلفزيونية وإذاعية مرموقة.
المطلوب: كتابة حوار إعلامي راقٍ وقصير (4 إلى 6 تبادلات سريعة وعميقة) بين "${hostName}" و "${guestName}" حول موضوع: "${topic}".
الأسلوب: عربي فصيح، رصين، فخم، ومريح للأذن مع إشارات وقف طبيعية.
أرجع النتيجة بصيغة JSON حصراً بهذا المخطط:
[
  {"speaker": "host", "text": "نص كلام المقدم"},
  {"speaker": "guest", "text": "نص كلام الضيف"}
]`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = (response.text || '[]').trim();
    const parsed = JSON.parse(raw);
    return res.json({ dialogue: parsed });
  } catch (error: any) {
    console.error('Error generating interview dialogue:', error);
    return res.status(500).json({ error: 'تعذر إنشاء الحوار التلقائي.' });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BARITONE AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
