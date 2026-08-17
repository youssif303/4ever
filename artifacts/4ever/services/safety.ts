export type SafetyLevel = 'normal' | 'concern' | 'crisis';

const crisisSignals = [
  'kill myself',
  'killing myself',
  'suicide',
  'end my life',
  'hurt myself',
  'harm myself',
  'not safe',
  'want to die',
];

const concernSignals = ['hopeless', 'can’t cope', "can't cope", 'panic', 'overwhelmed'];

export function checkSafety(message: string): { level: SafetyLevel } {
  const normalized = message.toLowerCase();
  if (crisisSignals.some((signal) => normalized.includes(signal))) return { level: 'crisis' };
  if (concernSignals.some((signal) => normalized.includes(signal))) return { level: 'concern' };
  return { level: 'normal' };
}