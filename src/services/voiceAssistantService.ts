/**
 * AI Telugu Voice Assistant Service for FarmDirect (రైతు మిత్ర)
 * Specifically designed to assist non-literate and rural farmers/buyers in Telugu
 */

export interface VoiceGuideStep {
  step: number;
  title: string;
  teluguTitle: string;
  teluguText: string;
  iconName: string;
  actionHint: string;
}

export interface ParsedVoiceListing {
  cropName?: string;
  quantity?: number;
  pricePerKg?: number;
  location?: string;
  summary: string;
}

// Audio scripts for Step-by-Step Produce Addition (రైతు పంట నమోదు మార్గదర్శి)
export const FARMER_ADD_PRODUCE_STEPS: VoiceGuideStep[] = [
  {
    step: 1,
    title: 'Choose Crop',
    teluguTitle: '1. పంట పేరు ఎంచుకోండి',
    teluguText:
      'నమస్కారం రైతు సోదరులారా! మీరు ఏ పంట అమ్మాలనుకుంటున్నారు? టమోటా, ఉల్లిపాయ, మిర్చి, వరి, మొక్కజొన్న... స్క్రీన్ పై ఉన్న బొమ్మను తాకండి లేదా మైక్ నొక్కి పంట పేరు చెప్పండి.',
    iconName: 'Sprout',
    actionHint: 'పంట బొమ్మను తాకండి లేదా పంట పేరు చెప్పండి',
  },
  {
    step: 2,
    title: 'Enter Quantity',
    teluguTitle: '2. ఎన్ని కిలోలు ఉన్నాయి?',
    teluguText:
      'మీ పొలంలో ఎంత పంట సిద్ధంగా ఉంది? ఎన్ని కిలోలు లేదా ఎన్ని బస్తాలు అమ్మాలనుకుంటున్నారో చెప్పండి. ఉదాహరణకు 500 కిలోలు లేదా 10 బస్తాలు అని చెప్పండి.',
    iconName: 'Scale',
    actionHint: 'కిలోల సంఖ్యను చెప్పండి లేదా నొక్కండి',
  },
  {
    step: 3,
    title: 'Fair Price Guidance',
    teluguTitle: '3. కిలో ధర నిర్ణయించండి',
    teluguText:
      'ప్రభుత్వ APMC మార్కెట్ ధరను బట్టి కిలోకు ఎంత ధర పెట్టాలనుకుంటున్నారు? సరసమైన ధర పెడితే వ్యాపారులు వెంటనే కొంటారు. కిలో రేటు ఎంత అని చెప్పండి.',
    iconName: 'IndianRupee',
    actionHint: 'కిలో ధర చెప్పండి (ఉదా: 25 రూపాయలు)',
  },
  {
    step: 4,
    title: 'Farm Location & Photo',
    teluguTitle: '4. పొలం లొకేషన్ & ఫోటో',
    teluguText:
      'మీ పొలం ఎక్కడుందో గుర్తించడానికి గూగుల్ మ్యాప్స్ GPS బటన్ నొక్కండి. అలాగే కెమెరా బటన్ నొక్కి మీ తాజా పంట ఫోటో తీయండి.',
    iconName: 'MapPin',
    actionHint: 'GPS బటన్ నొక్కండి లేదా కెమెరాతో ఫోటో తీయండి',
  },
  {
    step: 5,
    title: 'Publish to Market',
    teluguTitle: '5. పంటను మార్కెట్లో పెట్టండి',
    teluguText:
      'అన్నీ సరిచూసుకున్నారు కదా! క్రింద ఉన్న ఆకుపచ్చ పంటను జాబితా చేయండి బటన్ నొక్కండి. మీ పంట వెంటనే వ్యాపారులకు మరియు కొనుగోలుదారులకు కనిపిస్తుంది.',
    iconName: 'CheckCircle2',
    actionHint: 'ఆకుపచ్చ బటన్ నొక్కి పూర్తి చేయండి',
  },
];

// Audio scripts for Step-by-Step Produce Buying (కొనుగోలుదారుల మార్గదర్శి)
export const BUYER_GUIDE_STEPS: VoiceGuideStep[] = [
  {
    step: 1,
    title: 'Explore Fresh Crops',
    teluguTitle: '1. తాజా పంటలను వెతకండి',
    teluguText:
      'కొనుగోలుదారులకు స్వాగతం! మార్కెట్‌లో అందుబాటులో ఉన్న తాజా పంటలు ఇక్కడ కనిపిస్తాయి. మీ సమీపంలోని పొలాలను చూడటానికి గూగుల్ మ్యాప్స్ బటన్ నొక్కండి.',
    iconName: 'Search',
    actionHint: 'పంటల జాబితాను లేదా మ్యాప్‌ను చూడండి',
  },
  {
    step: 2,
    title: 'Direct Farmer Chat',
    teluguTitle: '2. రైతుతో నేరుగా మాట్లాడండి',
    teluguText:
      'దళారులు లేకుండా రైతుతో నేరుగా చాట్ లేదా కాల్ చేయడానికి చాట్ బటన్ నొక్కండి. ధర నచ్చితే మీ ఆఫర్ ధరను రైతుకు తెలియజేయండి.',
    iconName: 'MessageCircle',
    actionHint: 'చాట్ / ఆఫర్ బటన్ నొక్కి బేరం మాట్లాడండి',
  },
  {
    step: 3,
    title: 'Safe Escrow Payment',
    teluguTitle: '3. సురక్షిత ఎస్క్రో చెల్లింపు',
    teluguText:
      'మీ డబ్బు వంద శాతం సురక్షితం. మీరు చెల్లించిన మొత్తం ఫార్మ్‌డైరెక్ట్ భద్రతా ఖాతాలో ఉంటుంది. పంట మీ చేతికి చేరే వరకు రైతుకు డబ్బు విడుదల కాదు.',
    iconName: 'ShieldCheck',
    actionHint: 'ఎస్క్రో ద్వారా సురక్షితంగా చెల్లించండి',
  },
  {
    step: 4,
    title: 'Delivery & Confirmation',
    teluguTitle: '4. డెలివరీ & ఓటీపీ నిర్ధారణ',
    teluguText:
      'పంట మీ గోడౌన్‌కు చేరి నాణ్యత సంతృప్తికరంగా ఉన్నప్పుడు మాత్రమే ఓటీపీ నెంబర్ ఇచ్చి డెలివరీ ధృవీకరించండి. అప్పుడే రైతుకు నగదు చేరుతుంది.',
    iconName: 'Truck',
    actionHint: 'పంట చూసుకున్న తర్వాత మాత్రమే ఓటీపీ ఇవ్వండి',
  },
];

/**
 * Text-to-Speech in Telugu using Web Speech API
 */
class TeluguSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (speaking: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setSpeaking(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.listeners.forEach((l) => l(speaking));
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('SpeechSynthesis cancel error:', e);
      }
    }
    this.setSpeaking(false);
  }

  public speakTelugu(text: string, onEnd?: () => void, rate: number = 0.95): boolean {
    if (!this.synth || !text) return false;

    try {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voices = this.synth.getVoices();
      // Look for Telugu voices or Indian regional voices
      const teluguVoice = voices.find(
        (v) =>
          v.lang === 'te-IN' ||
          v.lang.toLowerCase().includes('te') ||
          v.name.toLowerCase().includes('telugu')
      );

      const indianVoice = voices.find(
        (v) => v.lang === 'en-IN' || v.lang === 'hi-IN' || v.name.toLowerCase().includes('india')
      );

      if (teluguVoice) {
        utterance.voice = teluguVoice;
        utterance.lang = 'te-IN';
      } else if (indianVoice) {
        utterance.voice = indianVoice;
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'te-IN';
      }

      utterance.rate = rate; // slightly relaxed pace for clear comprehension
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        this.setSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error:', err);
        this.setSpeaking(false);
      };

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Failed to speak Telugu utterance:', err);
      this.setSpeaking(false);
      return false;
    }
  }
}

export const speechManager = new TeluguSpeechManager();

export interface ButtonNarrationEvent {
  spokenText: string;
  sourceText?: string;
  timestamp: number;
}

/**
 * Intelligent Telugu resolver for button text and user actions
 */
export function resolveTeluguButtonText(rawText: string): string | null {
  if (!rawText) return null;
  const clean = rawText.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  // 1. Farmer Login / రైతు లాగిన్
  if (
    clean.includes('రైతు లాగిన్') ||
    clean.includes('రైతు పోర్టల్') ||
    (lower.includes('farmer') && lower.includes('login')) ||
    lower === 'farmer portal' ||
    lower === 'farmer'
  ) {
    return 'రైతు లాగిన్ బటన్ నొక్కారు. రైతు ఖాతాలోకి ప్రవేశిస్తున్నారు.';
  }

  // 2. Buyer Login / కొనుగోలుదారు లాగిన్
  if (
    clean.includes('కొనుగోలుదారు లాగిన్') ||
    clean.includes('కొనుగోలుదారు పోర్టల్') ||
    (lower.includes('buyer') && lower.includes('login')) ||
    lower === 'buyer portal' ||
    lower === 'buyer'
  ) {
    return 'కొనుగోలుదారు లాగిన్ బటన్ నొక్కారు. వ్యవసాయ మార్కెట్‌లోకి ప్రవేశిస్తున్నారు.';
  }

  // 3. Aadhar Verification / ఆధార్
  if (clean.includes('ఆధార్') || lower.includes('aadhar') || lower.includes('aadhaar')) {
    return 'ఆధార్ నంబర్ ధృవీకరణ బటన్ నొక్కారు.';
  }

  // 4. OTP Verification / ఓటీపీ
  if (clean.includes('ఓటీపీ') || lower.includes('otp')) {
    return 'ఓటీపీ ధృవీకరణ బటన్ నొక్కారు. విజయవంతంగా లాగిన్ అవుతున్నారు.';
  }

  // 5. Add Produce / కొత్త పంట నమోదు
  if (
    clean.includes('కొత్త పంట') ||
    clean.includes('పంటను జోడించండి') ||
    clean.includes('పంట నమోదు') ||
    lower.includes('add produce') ||
    lower.includes('add new produce')
  ) {
    return 'కొత్త పంట నమోదు బటన్ నొక్కారు.';
  }

  // 6. Voice Sell / వాయిస్ తో అమ్మండి
  if (clean.includes('వాయిస్ తో అమ్మండి') || clean.includes('వాయిస్ ద్వారా అమ్మండి')) {
    return 'వాయిస్ ద్వారా పంట అమ్మే బటన్ నొక్కారు.';
  }

  // 7. Voice Assistant / రైతు మిత్ర AI
  if (
    clean.includes('రైతు మిత్ర') ||
    clean.includes('వాయిస్ అసిస్టెంట్') ||
    clean.includes('వాయిస్ ai') ||
    lower.includes('voice assistant')
  ) {
    return 'రైతు మిత్ర వాయిస్ అసిస్టెంట్ బటన్ నొక్కారు.';
  }

  // 8. Listen Instructions / సూచనలు వినండి
  if (clean.includes('సూచనలు వినండి') || lower.includes('listen')) {
    return 'సూచనలు వినండి బటన్ నొక్కారు.';
  }

  // 9. Speak / గొంతుతో నమోదు చేయండి / వింటోంది
  if (
    clean.includes('గొంతుతో నమోదు') ||
    clean.includes('వింటోంది') ||
    lower.includes('voice search') ||
    lower === 'speak'
  ) {
    return 'మైక్రోఫోన్ ద్వారా మాట్లాడే బటన్ నొక్కారు.';
  }

  // 10. Back / వెనుకకు
  if (clean.includes('వెనుకకు') || lower === 'back' || lower.includes('go back')) {
    return 'వెనుకకు వెళ్లే బటన్ నొక్కారు.';
  }

  // 11. Camera / ఫోటో తీయండి
  if (
    clean.includes('కెమెరా') ||
    clean.includes('ఫోటో') ||
    lower.includes('camera') ||
    lower.includes('photo')
  ) {
    return 'పంట ఫోటో తీసే కెమెరా బటన్ నొక్కారు.';
  }

  // 12. GPS / Location
  if (
    clean.includes('జీపీఎస్') ||
    clean.includes('లొకేషన్') ||
    lower.includes('gps') ||
    lower.includes('location')
  ) {
    return 'పొలం జీపీఎస్ లొకేషన్ గుర్తించే బటన్ నొక్కారు.';
  }

  // 13. Map / Maps View / గూగుల్ మ్యాప్స్
  if (clean.includes('మ్యాప్') || lower.includes('map')) {
    return 'గూగుల్ మ్యాప్స్ వీక్షణ బటన్ నొక్కారు.';
  }

  // 14. Grid / పంటల జాబితా
  if (clean.includes('గ్రిడ్') || clean.includes('జాబితా') || lower.includes('grid')) {
    return 'పంటల జాబితా గ్రిడ్ వీక్షణ బటన్ నొక్కారు.';
  }

  // 15. Chat with Farmer / Buyer / చాట్
  if (
    clean.includes('చాట్') ||
    clean.includes('రైతుతో మాట్లాడండి') ||
    lower.includes('chat') ||
    lower.includes('message')
  ) {
    return 'రైతుతో మాట్లాడే చాట్ బటన్ నొక్కారు.';
  }

  // 16. Buy / కొనుగోలు / ఆఫర్
  if (
    clean.includes('కొనుగోలు') ||
    lower.includes('buy') ||
    lower.includes('negotiate') ||
    lower.includes('offer')
  ) {
    return 'పంట కొనుగోలు బటన్ నొక్కారు.';
  }

  // 17. Escrow Payment / ఎస్క్రో
  if (clean.includes('ఎస్క్రో') || lower.includes('escrow') || lower.includes('pay deposit')) {
    return 'ఎస్క్రో భద్రతా చెల్లింపు బటన్ నొక్కారు.';
  }

  // 18. Delivery Verification / నిర్ధారణ
  if (
    clean.includes('డెలివరీ') ||
    clean.includes('నిర్ధారణ') ||
    lower.includes('delivery') ||
    lower.includes('release payment')
  ) {
    return 'డెలివరీ ధృవీకరణ బటన్ నొక్కారు.';
  }

  // 19. Post Produce / Submit / నమోదు చేయండి
  if (
    clean.includes('పోస్ట్') ||
    clean.includes('మార్కెట్లో జాబితా') ||
    lower.includes('submit') ||
    lower.includes('post produce')
  ) {
    return 'పంటను మార్కెట్లో నమోదు చేసే బటన్ నొక్కారు.';
  }

  // 20. Logout / లాగౌట్
  if (clean.includes('లాగౌట్') || lower.includes('logout') || lower.includes('sign out')) {
    return 'లాగౌట్ బటన్ నొక్కారు. ఖాతా నుండి నిష్క్రమిస్తున్నారు.';
  }

  // 21. Home / హోమ్
  if (clean.includes('హోమ్') || lower.includes('home') || lower.includes('farmdirect')) {
    return 'హోమ్ పేజీ బటన్ నొక్కారు.';
  }

  // 22. Language Switch buttons
  if (clean === 'తెలుగు' || lower === 'telugu') return 'తెలుగు భాష ఎంచుకున్నారు.';
  if (clean === 'English' || lower === 'english') return 'ఇంగ్లీష్ భాష ఎంచుకున్నారు.';
  if (clean === 'हिन्दी' || lower === 'hindi') return 'హిందీ భాష ఎంచుకున్నారు.';
  if (clean === 'தமிழ்' || lower === 'tamil') return 'తమిళ భాష ఎంచుకున్నారు.';
  if (clean === 'ಕನ್ನಡ' || lower === 'kannada') return 'కన్నడ భాష ఎంచుకున్నారు.';
  if (clean === 'മലയാളം' || lower === 'malayalam') return 'మలయాళ భాష ఎంచుకున్నారు.';

  // 23. Crops
  const crops: { key: string; name: string }[] = [
    { key: 'tomato', name: 'టమోటా' },
    { key: 'టమోటా', name: 'టమోటా' },
    { key: 'onion', name: 'ఉల్లిపాయ' },
    { key: 'ఉల్లిపాయ', name: 'ఉల్లిపాయ' },
    { key: 'chilli', name: 'మిర్చి' },
    { key: 'మిర్చి', name: 'మిర్చి' },
    { key: 'paddy', name: 'వరి' },
    { key: 'వరి', name: 'వరి' },
    { key: 'rice', name: 'వరి బియ్యం' },
    { key: 'maize', name: 'మొక్కజొన్న' },
    { key: 'మొక్కజొన్న', name: 'మొక్కజొన్న' },
    { key: 'cotton', name: 'పత్తి' },
    { key: 'పత్తి', name: 'పత్తి' },
    { key: 'banana', name: 'అరటి' },
    { key: 'అరటి', name: 'అరటి' },
    { key: 'mango', name: 'మామిడి' },
    { key: 'మామిడి', name: 'మామిడి' },
    { key: 'turmeric', name: 'పసుపు' },
    { key: 'పసుపు', name: 'పసుపు' },
    { key: 'groundnut', name: 'వేరుశనగ' },
    { key: 'వేరుశనగ', name: 'వేరుశనగ' },
  ];

  for (const c of crops) {
    if (lower.includes(c.key.toLowerCase())) {
      return `${c.name} పంట ఎంచుకున్నారు.`;
    }
  }

  // 24. Filter Categories
  if (clean.includes('కూరగాయలు') || lower === 'vegetables') return 'కూరగాయల విభాగం ఎంచుకున్నారు.';
  if (clean.includes('ధాన్యాలు') || lower === 'grains') return 'ధాన్యాల విభాగం ఎంచుకున్నారు.';
  if (clean.includes('పప్పులు') || lower === 'pulses') return 'పప్పుల విభాగం ఎంచుకున్నారు.';
  if (clean.includes('పండ్లు') || lower === 'fruits') return 'పండ్ల విభాగం ఎంచుకున్నారు.';
  if (clean.includes('మసాలాలు') || lower === 'spices') return 'మసాలా పంటల విభాగం ఎంచుకున్నారు.';
  if (clean.includes('అన్నీ') || lower === 'all') return 'అన్ని పంటల విభాగం ఎంచుకున్నారు.';

  // 25. Fallback for clear short button labels (skip overly long blocks of text)
  if (clean.length > 0 && clean.length <= 35) {
    return `${clean} బటన్ నొక్కారు.`;
  }

  return null;
}

/**
 * Global Telugu Button Narrator
 * Tells non-literate farmers aloud in Telugu whichever button was pressed
 */
class TeluguButtonNarrator {
  private enabled: boolean = true;
  private listeners: ((event: ButtonNarrationEvent | null) => void)[] = [];
  private lastSpokenTime: number = 0;
  private lastSpokenText: string = '';
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('farmdirect_telugu_button_narrator');
      this.enabled = stored !== null ? stored === 'true' : true; // Default ON
    }
  }

  public get isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmdirect_telugu_button_narrator', String(val));
    }
    if (val) {
      speechManager.speakTelugu('బటన్ వాయిస్ మార్గదర్శి ఆన్ చేయబడింది.');
    } else {
      speechManager.stop();
    }
    this.notify({
      spokenText: val ? 'బటన్ వాయిస్ మార్గదర్శి ఆన్ చేయబడింది' : 'బటన్ వాయిస్ మార్గదర్శి ఆఫ్ చేయబడింది',
      timestamp: Date.now(),
    });
  }

  public toggle() {
    this.setEnabled(!this.enabled);
  }

  public subscribe(listener: (event: ButtonNarrationEvent | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(event: ButtonNarrationEvent | null) {
    this.listeners.forEach((l) => l(event));
  }

  public speak(teluguText: string, sourceText?: string) {
    if (!this.enabled || !teluguText) return;

    // Debounce duplicate clicks within 400ms
    const now = Date.now();
    if (this.lastSpokenText === teluguText && now - this.lastSpokenTime < 400) {
      return;
    }
    this.lastSpokenTime = now;
    this.lastSpokenText = teluguText;

    const event: ButtonNarrationEvent = {
      spokenText: teluguText,
      sourceText,
      timestamp: now,
    };
    this.notify(event);

    speechManager.speakTelugu(teluguText);
  }

  public initGlobalListener() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    document.addEventListener(
      'click',
      (e) => {
        if (!this.enabled) return;

        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Find nearest button, link, or role="button" or data-telugu-announce
        const actionable = target.closest<HTMLElement>(
          'button, a, [role="button"], [data-telugu-announce], [data-telugu-voice], input[type="submit"]'
        );
        if (!actionable) return;

        // Skip internal controls marked as skip
        if (actionable.getAttribute('data-skip-narrator') === 'true') {
          return;
        }

        // 1. Direct explicit attribute
        const explicitAnnounce =
          actionable.getAttribute('data-telugu-announce') ||
          actionable.getAttribute('data-telugu-voice');
        if (explicitAnnounce) {
          this.speak(explicitAnnounce, actionable.innerText || actionable.title);
          return;
        }

        // 2. Derive from button text, title, aria-label
        const text = (
          actionable.innerText ||
          actionable.getAttribute('aria-label') ||
          actionable.title ||
          ''
        )
          .replace(/\s+/g, ' ')
          .trim();

        if (!text) return;

        const teluguAnnouncement = resolveTeluguButtonText(text);
        if (teluguAnnouncement) {
          this.speak(teluguAnnouncement, text);
        }
      },
      true // capture phase to reliably announce button clicks
    );
  }
}

export const buttonNarrator = new TeluguButtonNarrator();

/**
 * Speech Recognition in Telugu
 */
export function startTeluguSpeechRecognition(
  onResult: (transcript: string) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError('మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు. దయచేసి Chrome బ్రౌజర్ వాడండి.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'te-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        onResult(transcript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (onError) {
        if (event.error === 'not-allowed') {
          onError('మైక్రోఫోన్ అనుమతి తిరస్కరించబడింది. దయచేసి బ్రౌజర్‌లో మైక్ అనుమతించండి.');
        } else {
          onError('గొంతు సరిగ్గా వినపడలేదు. దయచేసి మళ్ళీ స్పష్టంగా మాట్లాడండి.');
        }
      }
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
    };
  } catch (err: any) {
    console.warn('Speech recognition start failed:', err);
    if (onError) onError('వాయిస్ ప్రారంభించడంలో లోపం జరిగింది.');
    return null;
  }
}

/**
 * Parse Telugu natural voice input into structured produce listing
 * Example input: "నా దగ్గర 500 కిలోల టమోటా ఉంది కిలో 25 రూపాయలు గుంటూరు"
 */
export function parseTeluguVoiceToProduce(text: string): ParsedVoiceListing {
  const lower = text.toLowerCase();
  let cropName: string | undefined;
  let quantity: number | undefined;
  let pricePerKg: number | undefined;
  let location: string | undefined;

  // Crop detection
  if (lower.includes('టమోటా') || lower.includes('టమాటా') || lower.includes('టమోటో') || lower.includes('tomato')) {
    cropName = 'Tomato';
  } else if (lower.includes('ఉల్లిపాయ') || lower.includes('ఎర్రగడ్డ') || lower.includes('ఉల్లి') || lower.includes('onion')) {
    cropName = 'Onion';
  } else if (lower.includes('మిర్చి') || lower.includes('పచ్చిమిర్చి') || lower.includes('ఎండుమిర్చి') || lower.includes('chili') || lower.includes('chilli')) {
    cropName = 'Chili';
  } else if (lower.includes('వరి') || lower.includes('ధాన్యం') || lower.includes('బియ్యం') || lower.includes('rice') || lower.includes('paddy')) {
    cropName = 'Rice';
  } else if (lower.includes('మొక్కజొన్న') || lower.includes('జొన్న') || lower.includes('corn')) {
    cropName = 'Corn';
  } else if (lower.includes('క్యాబేజీ') || lower.includes('cabbage')) {
    cropName = 'Cabbage';
  } else if (lower.includes('క్యారెట్') || lower.includes('carrot')) {
    cropName = 'Carrot';
  } else if (lower.includes('బీన్స్') || lower.includes('చిక్కుడు') || lower.includes('beans')) {
    cropName = 'Green Beans';
  }

  // Quantity detection (extract numbers before/after కిలో, కేజీ, kg, బస్తా)
  const qtyMatch =
    text.match(/(\d+)\s*(?:కిలోలు|కిలో|కేజీ|కేజీలు|kg|కిలోల)/i) ||
    text.match(/(?:పరిమాణం|ఎన్ని|మొత్తం|సుమారు)\s*(\d+)/i) ||
    text.match(/(\d+)\s*(?:బస్తాలు|బస్తాల|సంచులు)/i);

  if (qtyMatch) {
    let q = parseInt(qtyMatch[1], 10);
    if (text.includes('బస్తా') || text.includes('బస్తాలు')) {
      q = q * 50; // Each bag ~ 50kg standard mandi measurement
    }
    quantity = q;
  }

  // Price detection (extract numbers before/after రూపాయలు, ధర, రేటు, ₹)
  const priceMatch =
    text.match(/(\d+)\s*(?:రూపాయలు|రూ|రూపాయి|రూపాయల|rs)/i) ||
    text.match(/(?:ధర|రేటు|ఖరీదు|కిలో)\s*(\d+)/i) ||
    text.match(/₹\s*(\d+)/);

  if (priceMatch) {
    pricePerKg = parseInt(priceMatch[1], 10);
  }

  // Location detection
  const districts = [
    { te: 'గుంటూరు', en: 'Guntur' },
    { te: 'తెనాలి', en: 'Tenali' },
    { te: 'విజయవాడ', en: 'Vijayawada' },
    { te: 'కర్నూలు', en: 'Kurnool' },
    { te: 'రాజమండ్రి', en: 'Rajahmundry' },
    { te: 'తిరుపతి', en: 'Tirupati' },
    { te: 'మదనపల్లె', en: 'Madanapalle' },
    { te: 'అనంతపురం', en: 'Anantapur' },
    { te: 'నెల్లూరు', en: 'Nellore' },
    { te: 'ఏలూరు', en: 'Eluru' },
    { te: 'విశాఖపట్నం', en: 'Visakhapatnam' },
    { te: 'కాకినాడ', en: 'Kakinada' },
    { te: 'కడప', en: 'Kadapa' },
    { te: 'ఒంగోలు', en: 'Ongole' },
    { te: 'చిత్తూరు', en: 'Chittoor' },
  ];

  for (const d of districts) {
    if (text.includes(d.te) || lower.includes(d.en.toLowerCase())) {
      location = `${d.en}, Andhra Pradesh`;
      break;
    }
  }

  // Compose a friendly Telugu summary
  let summary = '';
  if (cropName || quantity || pricePerKg) {
    summary = `మీరు చెప్పిన వివరాలు: ${cropName ? 'పంట: ' + cropName : ''} ${
      quantity ? ', పరిమాణం: ' + quantity + ' కిలోలు' : ''
    } ${pricePerKg ? ', కిలో ధర: ₹' + pricePerKg : ''} ${location ? ', ప్రాంతం: ' + location : ''}`;
  } else {
    summary = 'మీ గొంతు నమోదు చేయబడింది.';
  }

  return {
    cropName,
    quantity,
    pricePerKg,
    location,
    summary,
  };
}

/**
 * Ask Telugu AI Assistant for intelligent response
 */
export async function askTeluguAIAssistant(
  prompt: string,
  mode: 'general' | 'add_produce' | 'buy_produce' = 'general',
  userRole: 'farmer' | 'buyer' = 'farmer'
): Promise<string> {
  try {
    const res = await fetch('/api/ai/telugu-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode, userRole }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    console.warn('API assist call failed, utilizing local Telugu response generator:', err);
  }

  // Local intelligent Telugu response generator (100% Free, Zero Paid API dependencies)
  const lower = prompt.toLowerCase();
  if (lower.includes('ధర') || lower.includes('రేటు') || lower.includes('apmc') || lower.includes('మార్కెట్')) {
    return 'ఆంధ్రప్రదేశ్ మార్కెట్ యార్డుల (APMC) తాజా సమాచారం ప్రకారం టమోటా కిలో ₹25, మిర్చి కిలో ₹65, ఉల్లిపాయ కిలో ₹20, పత్తి క్వింటాల్ ₹7,200 పలుకుతోంది. మీ పంట నాణ్యతను బట్టి సరసమైన ధర నిర్ణయించండి.';
  }
  if (lower.includes('ఎస్క్రో') || lower.includes('డబ్బు') || lower.includes('సేఫ్') || lower.includes('భద్రత') || lower.includes('పేమెంట్')) {
    return 'ఫార్మ్‌డైరెక్ట్ ఎస్క్రో ఖాతా ద్వారా మీ డబ్బు వంద శాతం సురక్షితం. పంట చేతికి అంది నాణ్యత చూసుకున్న తర్వాత మాత్రమే రైతుకు డబ్బు విడుదలవుతుంది.';
  }
  if (lower.includes('అమ్మ') || lower.includes('నమోదు') || lower.includes('రైతు') || mode === 'add_produce') {
    return 'పంట నమోదు చేయడానికి పైన ఉన్న "కొత్త పంట నమోదు" బటన్ నొక్కండి. మీ పంట పేరు, ఎన్ని కిలోలు ఉన్నాయో, కిలో ధర చెప్పండి లేదా బొమ్మలను తాకండి. చివరగా ఫోటో తీసి మార్కెట్లో ఉంచండి.';
  }
  if (lower.includes('కొన') || lower.includes('వ్యాపారి') || lower.includes('కొనుగోలు') || mode === 'buy_produce') {
    return 'తాజా పంటలు కొనడానికి మార్కెట్‌లోని పంటల జాబితాను లేదా మ్యాప్‌ను చూడండి. రైతుతో నేరుగా చాట్ చేసి సరసమైన ధరకు బేరం మాట్లాడి ఎస్క్రో ద్వారా ఆర్డర్ చేయండి.';
  }
  if (lower.includes('లొకేషన్') || lower.includes('మ్యాప్') || lower.includes('దూరం') || lower.includes('రవాణా')) {
    return 'మ్యాప్ లేదా లొకేషన్ బటన్ నొక్కడం ద్వారా మీ పొలం లేదా మీ సమీపంలోని కొనుగోలుదారుల దూరం లెక్కించబడుతుంది. నేరుగా పొలం వద్దకే రవాణా వాహనం ఏర్పాటు చేసుకోవచ్చు.';
  }
  if (lower.includes('చాట్') || lower.includes('ఫోన్') || lower.includes('మాట్లాడ')) {
    return 'రైతుతో నేరుగా మాట్లాడటానికి చాట్ లేదా కాల్ బటన్ నొక్కండి. దళారులు ఎవరూ లేకుండా నేరుగా ధర బేరం మాట్లాడుకోవచ్చు.';
  }

  return userRole === 'buyer'
    ? 'నమస్కారం కొనుగోలుదారులారా! ఫార్మ్‌డైరెక్ట్ రైతు మిత్ర మీకు స్వాగతం పలుకుతోంది. తాజా పంటలను వెతకడానికి, రైతుతో చాట్ చేయడానికి లేదా ఎస్క్రో చెల్లింపుల సమాచారం కోసం నన్ను అడగండి.'
    : 'నమస్కారం రైతు సోదరులారా! ఫార్మ్‌డైరెక్ట్ రైతు మిత్ర మీకు స్వాగతం పలుకుతోంది. పంట నమోదు చేయడం, APMC మార్కెట్ ధరలు లేదా చెల్లింపుల రక్షణ గురించి ఏదైనా అడగండి.';
}
