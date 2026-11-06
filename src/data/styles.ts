import { PerformanceStyle, DialogueLine } from '../types';

export const PERFORMANCE_STYLES: PerformanceStyle[] = [
  {
    id: 'style-1',
    name: 'لقاء إعلامي فاخر',
    description: 'أجواء استوديو تلفزيوني رفيع، نبرة متزنة ومحترمة تنم عن رقي وحوار فكري ثري.',
    promptDirective: 'Prestigious TV interview host, respectful, articulate, poised broadcast delivery',
    suggestedEmotion: 'warm',
    icon: 'Mic',
  },
  {
    id: 'style-2',
    name: 'وثائقي عالمي',
    description: 'نبرة عميقة ومهيبة مع وقفات تأملية طويلة وصمت ذي مغزى يحاكي وثائقيات بي بي سي وناشيونال جيوغرافيك.',
    promptDirective: 'BBC style natural history documentary narrator, deeply resonant, contemplative pauses, epic tone',
    suggestedEmotion: 'dramatic',
    icon: 'Film',
  },
  {
    id: 'style-3',
    name: 'لقاء تلفزيوني',
    description: 'نبرة سريعة التفاعل، واضحة وحاضرة، ملائمة للبرامج الحوارية المسائية التفاعلية.',
    promptDirective: 'Prime-time television talk show, lively yet polished vocal pacing',
    suggestedEmotion: 'enthusiastic',
    icon: 'Tv',
  },
  {
    id: 'style-4',
    name: 'مقابلة صحفية',
    description: 'تركيز استقصائي دقيق، نبرة موضوعية وهادئة تطرح التساؤلات ببراعة واحتراف.',
    promptDirective: 'Investigative journalism interview, calm, sharp, objective questioning cadence',
    suggestedEmotion: 'neutral',
    icon: 'Newspaper',
  },
  {
    id: 'style-5',
    name: 'مقدم برنامج',
    description: 'شخصية تلفزيونية وإذاعية آسرة، توازن بين الترحيب الحار والضبط الإيقاعي للفقرات.',
    promptDirective: 'Charismatic show host, engaging welcome and effortless segment transitions',
    suggestedEmotion: 'enthusiastic',
    icon: 'Radio',
  },
  {
    id: 'style-6',
    name: 'بودكاست احترافي',
    description: 'إلقاء حميمي وقريب جداً من الميكروفون، صوت ناعم ومريح للأذن في الحلقات الطويلة.',
    promptDirective: 'Modern intimate studio podcast, warm proximity effect, cozy, genuine storytelling',
    suggestedEmotion: 'warm',
    icon: 'Headphones',
  },
  {
    id: 'style-7',
    name: 'سرد تاريخي',
    description: 'أسلوب ملحمي فصيح يستعرض القصص والأحداث التاريخية بنبرة حكواتي رصين.',
    promptDirective: 'Grand historical chronicler, rhythmic classical Arabic eloquence with dignified drama',
    suggestedEmotion: 'solemn',
    icon: 'BookOpen',
  },
  {
    id: 'style-8',
    name: 'مقدمة سينمائية',
    description: 'طبقة باريتون عميقة مع وقفات درامية تحبس الأنفاس، مصممة للمقدمات والإعلانات الترويجية.',
    promptDirective: 'Cinematic intro voiceover, ultra-deep baritone, dramatic silence, gripping intensity',
    suggestedEmotion: 'dramatic',
    icon: 'Clapperboard',
  },
  {
    id: 'style-9',
    name: 'إعلان فاخر',
    description: 'صوت مخملي فخم للعلامات التجارية الراقية (سيارات، ساعات، عقارات، عطور).',
    promptDirective: 'Luxury brand commercial, sultry, velvety, opulent and confident cadence',
    suggestedEmotion: 'solemn',
    icon: 'Sparkles',
  },
  {
    id: 'style-10',
    name: 'محتوى يوتيوب',
    description: 'إيقاع عصري جذاب يخطف الانتباه من الثانية الأولى دون إزعاج أو ابتذال.',
    promptDirective: 'High-retention YouTube creator, vibrant, clear emphasis, crisp flow',
    suggestedEmotion: 'enthusiastic',
    icon: 'Video',
  },
  {
    id: 'style-11',
    name: 'تعليق صوتي هادئ',
    description: 'نبرة استرخائية مريحة للنصوص التأملية وشروحات المنتجات الهادئة.',
    promptDirective: 'Calm ambient voiceover, soothing soft pacing, peaceful and reassuring',
    suggestedEmotion: 'neutral',
    icon: 'Volume2',
  },
  {
    id: 'style-12',
    name: 'أسلوب عراقي إعلامي',
    description: 'نبرة إعلامية عراقية رصينة ومحبوبة، تجمع بين الفصاحة الجزلة والإيقاع التلفزيوني العراقي الراقي.',
    promptDirective: 'Prestigious Iraqi media broadcaster tone, dignified Baghdadi cadence, eloquent and warm',
    suggestedEmotion: 'warm',
    icon: 'Globe',
  },
  {
    id: 'style-13',
    name: 'أسلوب عربي فصيح',
    description: 'لغة عربية بيضاء سليمة النطق، فصيحة ومشكولة تناسب جميع الأقطار العربية بدقة تامة.',
    promptDirective: 'Impeccable Modern Standard Arabic (Fusha), classical vocal purity, crisp phonetics',
    suggestedEmotion: 'solemn',
    icon: 'Languages',
  },
];

export interface InterviewTemplate {
  id: string;
  title: string;
  description: string;
  hostVoice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr' | 'Kore';
  guestVoice: 'Fenrir' | 'Charon' | 'Puck' | 'Zephyr' | 'Kore';
  dialogue: DialogueLine[];
}

export const INTERVIEW_TEMPLATES: InterviewTemplate[] = [
  {
    id: 'template-media-special',
    title: 'لقاء خاص — إعلامي وثقافي',
    description: 'حوار كلاسيكي راقٍ بين مقدم برنامج ومفكر أو رائد أعمال',
    hostVoice: 'Fenrir',
    guestVoice: 'Puck',
    dialogue: [
      {
        id: 'line-1',
        speaker: 'host',
        text: 'أهلاً وسهلاً بكم مشاهدينا في هذا اللقاء الخاص. يسعدنا أن نستضيف اليوم شخصية استثنائية تركت بصمة فارقة في مسيرتها.',
      },
      {
        id: 'line-2',
        speaker: 'guest',
        text: 'شكراً جزيلاً أستاذ، يسعدني ويشرفني جداً أن أكون معكم الليلة في هذا المنبر المرموق.',
      },
      {
        id: 'line-3',
        speaker: 'host',
        text: 'دعنا نبدأ من البدايات الأولى.. كيف بدأت هذه الرحلة، وما هو التحدي الأكبر الذي شكّل رؤيتك اليوم؟',
      },
      {
        id: 'line-4',
        speaker: 'guest',
        text: 'في الواقع، البدايات كانت مليئة بالشغف والمجهول معاً، لكن الإيمان بالفكرة هو ما جعل المستحيل ممكناً.',
      },
    ],
  },
  {
    id: 'template-tech-debate',
    title: 'مستقبل الذكاء الاصطناعي — حوار تلفزيوني',
    description: 'مناقشة علمية متزنة حول أثر التقنيات الحديثة',
    hostVoice: 'Charon',
    guestVoice: 'Zephyr',
    dialogue: [
      {
        id: 'line-1',
        speaker: 'host',
        text: 'في ظل التطور المتسارع لأنظمة الذكاء الاصطناعي، هل نحن مقبلون على ثورة تعيد كتابة مستقبل العمل البشري بالكامل؟',
      },
      {
        id: 'line-2',
        speaker: 'guest',
        text: 'بكل تأكيد، نحن لا نشهد مجرد أداة مساعدة جديدة، بل نشهد تحولاً جذرياً يرفع من إنتاجية الإنسان وإبداعه لأعلى المستويات.',
      },
      {
        id: 'line-3',
        speaker: 'host',
        text: 'ولكن، ما هي الضمانات الأخلاقية التي يجب أن تواكب هذا التحول التقني الهائل؟',
      },
      {
        id: 'line-4',
        speaker: 'guest',
        text: 'المسؤولية مشتركة بين المطورين والمشرعين، والهدف هو تسخير الذكاء الاصطناعي لخدمة الإنسانية وحريتها.',
      },
    ],
  },
  {
    id: 'template-iraqi-media',
    title: 'حوار عراقي إعلامي رصين',
    description: 'أسلوب إعلامي عراقي فخم يعبر عن التراث والأصالة البغدادية',
    hostVoice: 'Fenrir',
    guestVoice: 'Puck',
    dialogue: [
      {
        id: 'line-1',
        speaker: 'host',
        text: 'مساء الخير عليكم أحبتنا المشاهدين من بغداد السلام. نلتقيكم اليوم في حوار خاص يسلط الضوء على هويتنا الثقافية العريقة.',
      },
      {
        id: 'line-2',
        speaker: 'guest',
        text: 'يا هلا ومرحبا بيكم وبكل مشاهديكم الكرام، فرصة سعيدة جداً أن نتحاور حول ماضينا المجيد وحاضرنا المشرق.',
      },
      {
        id: 'line-3',
        speaker: 'host',
        text: 'أستاذنا الفاضل، كيف نحافظ على هذا الإرث الحضاري الكبير وننقله بأمانة إلى الأجيال الجديدة؟',
      },
      {
        id: 'line-4',
        speaker: 'guest',
        text: 'المهمة تبدأ من اعتزازنا بلغتنا وتراثنا، واستخدام التكنولوجيا الحديثة كجسر يربط أصالتنا بالمستقبل.',
      },
    ],
  },
];
