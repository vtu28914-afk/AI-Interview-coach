export function calculateWpm(text: string, durationSeconds: number): number {
  if (!text || durationSeconds <= 0) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = durationSeconds / 60;
  return Math.round(wordCount / minutes);
}

export function countFillerWords(text: string): { total: number; breakdown: { word: string; count: number }[] } {
  if (!text) return { total: 0, breakdown: [] };
  const lower = text.toLowerCase();
  const fillers = [
    { word: 'um', regex: /\bum\b/gi },
    { word: 'uh', regex: /\buh\b/gi },
    { word: 'like', regex: /\blike\b/gi },
    { word: 'you know', regex: /\byou know\b/gi },
    { word: 'actually', regex: /\bactually\b/gi },
    { word: 'basically', regex: /\bbasically\b/gi },
    { word: 'so yeah', regex: /\bso yeah\b/gi },
    { word: 'kind of', regex: /\bkind of\b/gi },
  ];

  let total = 0;
  const breakdown: { word: string; count: number }[] = [];

  for (const item of fillers) {
    const matches = lower.match(item.regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      breakdown.push({ word: item.word, count });
      total += count;
    }
  }

  return { total, breakdown };
}
