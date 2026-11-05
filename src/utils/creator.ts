import { JarvisLanguage } from '../types/jarvis';

export const CREATOR_NAME = 'Surajit Naskar';
export const APP_NAME = 'HINATA AI';

export const CREATOR_RESPONSES: Record<JarvisLanguage, string> = {
  en: 'My creator is Surajit Naskar. He created and developed HINATA AI.',
  bn: 'আমার Creator হলেন Surajit Naskar। তিনিই HINATA AI তৈরি ও ডেভেলপ করেছেন।',
  hi: 'मेरे Creator Surajit Naskar हैं। उन्होंने HINATA AI को बनाया और विकसित किया है।',
};

/**
 * Detects if a user message or voice command is inquiring about the creator, developer,
 * owner, or builder of HINATA AI, or directly asking about Surajit Naskar.
 */
export function isCreatorQuery(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();

  // English queries
  if (
    lower.includes('who created you') ||
    lower.includes('who is your creator') ||
    lower.includes('who developed you') ||
    lower.includes('who made hinata') ||
    lower.includes('who is behind hinata') ||
    lower.includes('who is your owner') ||
    lower.includes('who built you') ||
    lower.includes('who is surajit') ||
    lower.includes('surajit naskar') ||
    lower.includes('your developer') ||
    lower.includes('who made you') ||
    lower.includes('your maker') ||
    lower.includes('who designed you')
  ) {
    return true;
  }

  // Bengali queries (বাংলা)
  if (
    lower.includes('কে বানিয়েছে') ||
    lower.includes('কে বানিয়েছে') ||
    lower.includes('কে তৈরি করেছে') ||
    lower.includes('কে তৈরি করেছেন') ||
    lower.includes('তোমার স্রষ্টা') ||
    lower.includes('তোমার নির্মাতা') ||
    lower.includes('সুরজিৎ') ||
    lower.includes('সুরজিত') ||
    lower.includes('কে ডেভেলপ')
  ) {
    return true;
  }

  // Hindi queries (हिन्दी)
  if (
    lower.includes('किसने बनाया') ||
    lower.includes('किसने विकसित') ||
    lower.includes('तुम्हारा निर्माता') ||
    lower.includes('तुम्हारा क्रिएटर') ||
    lower.includes('तुम्हें किसने बनाया') ||
    lower.includes('सुरजीत') ||
    lower.includes('सुरजित') ||
    lower.includes('मालिक कौन')
  ) {
    return true;
  }

  return false;
}

/**
 * Returns the exact natural in-character creator recognition response.
 */
export function getCreatorResponse(language: JarvisLanguage = 'en'): string {
  return CREATOR_RESPONSES[language] || CREATOR_RESPONSES.en;
}
