/**
 * Helper to identify fast intents locally for Route Minds assistant
 * to avoid unnecessary network calls for clear conversational / unrelated queries.
 */

export interface FastIntentResult {
  intent: string;
  response: string;
  quickReplies?: string[];
}

export function classifyLocalIntent(text: string, language: 'en' | 'te'): FastIntentResult | null {
  const clean = text.trim().toLowerCase();
  const isTelugu = language === 'te' || /[\u0C00-\u0C7F]/.test(clean);

  // 1. Route Minds Platform Questions
  if (
    clean.includes('route minds') ||
    clean.includes('routeminds') ||
    clean.includes('what is this platform') ||
    clean.includes('what is this app') ||
    clean.includes('what is this website') ||
    clean.includes('about route minds') ||
    clean.includes('రూట్ మైండ్స్')
  ) {
    return {
      intent: 'PLATFORM_INFO',
      response: isTelugu
        ? 'రూట్ మైండ్స్ అనేది ప్రయాణీకుల సమాచార వేదిక, ఇది వినియోగదారులకు బస్సు సమాచారం మరియు ప్రయాణీకుల సేవలను సులభంగా పొందేందుకు సహాయపడుతుంది.'
        : 'Route Minds is a passenger information platform that helps users access bus information and passenger services more easily.',
      quickReplies: isTelugu
        ? ['ఏలూరు నుండి విజయవాడ', 'మహిళా భద్రత', 'ఫిర్యాదు నమోదు']
        : ['Buses from Eluru to Vijayawada', "Women's Safety", 'Register Complaint']
    };
  }

  // 2. Jokes and Humor
  if (
    clean.includes('joke') ||
    clean.includes('funny') ||
    clean.includes('laugh') ||
    clean.includes('comic') ||
    clean.includes('జోక్') ||
    clean.includes('హాస్యం')
  ) {
    return {
      intent: 'CASUAL_CHITCHAT',
      response: isTelugu
        ? 'నేను ప్రధానంగా మీ బస్సు ప్రయాణం మరియు రూట్ మైండ్స్ సేవల కోసం ఇక్కడ ఉన్నాను. బస్సు రూట్ లేదా సమయాలు తెలుసుకోవడంలో మీకు సహాయం కావాలా?'
        : "I'm mainly here to help with your bus travel and Route Minds services. Would you like help finding a bus route or timetable?",
      quickReplies: isTelugu
        ? ['ఏలూరు నుండి విజయవాడ', 'హైదరాబాద్ బస్సులు', 'హెల్ప్‌లైన్ నంబర్']
        : ['Buses from Eluru to Vijayawada', 'Buses to Hyderabad', 'Helpline numbers']
    };
  }

  // 3. Clear Unrelated Topics (Cinema, Movies, Entertainment, Songs, Cricket, Weather)
  if (
    clean.includes('cinema') ||
    clean.includes('movie') ||
    clean.includes('film') ||
    clean.includes('actor') ||
    clean.includes('actress') ||
    clean.includes('hero') ||
    clean.includes('song') ||
    clean.includes('cricket') ||
    clean.includes('football') ||
    clean.includes('weather') ||
    clean.includes('recipe') ||
    clean.includes('సినిమా') ||
    clean.includes('పాట') ||
    clean.includes('హీరో') ||
    clean.includes('క్రికెట్')
  ) {
    return {
      intent: 'UNRELATED_QUERY',
      response: isTelugu
        ? 'నేను మీ రూట్ మైండ్స్ ప్రయాణ అసిస్టెంట్ ను. బస్సు రూట్లు, సమయాలు మరియు ప్రయాణీకుల సేవలకు సహాయం చేయడానికి రూపొందించబడ్డాను. మీ ప్రయాణ సమాచారాన్ని కనుగొనడంలో నేను సహాయపడగలను.'
        : "I'm your Route Minds travel assistant, designed to help with bus routes, timings, and passenger services. I can help you plan your journey or find information about our platform.",
      quickReplies: isTelugu
        ? ['ఏలూరు నుండి విజయవాడ', 'మహిళా భద్రత', 'ఫిర్యాదు నమోదు']
        : ['Buses from Eluru to Vijayawada', "Women's Safety", 'Register Complaint']
    };
  }

  return null;
}
