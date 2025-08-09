import { normalizeText, levenshtein } from '../utils/textUtils';

export function gradeAnswer(question, answer) {
  if (answer === null || answer === undefined) return false;

  switch (question.type) {
    case 'mcq':
      return answer === question.answerIndex;
    case 'numeric': {
      const numericAnswer = parseNumericAnswer(answer);
      if (numericAnswer === null) return false;
      const tolerance = question.tolerance || 0;
      return Math.abs(numericAnswer - question.answerNumeric) <= tolerance;
    }
    case 'short': {
      if (!question.acceptableAnswers || !Array.isArray(question.acceptableAnswers)) return false;
      const normalizedAnswer = normalizeText(String(answer));
      if (!normalizedAnswer) return false;
      // exact
      for (const acceptable of question.acceptableAnswers) {
        if (normalizeText(acceptable) === normalizedAnswer) return true;
      }
      // fuzzy
      for (const acceptable of question.acceptableAnswers) {
        const normalizedAcceptable = normalizeText(acceptable);
        const threshold = Math.max(1, Math.round(normalizedAcceptable.length / 6));
        const distance = levenshtein(normalizedAnswer, normalizedAcceptable);
        if (distance <= threshold) return true;
      }
      return false;
    }
    default:
      return false;
  }
}

function parseNumericAnswer(answer) {
  if (typeof answer === 'number') return answer;
  if (typeof answer !== 'string') return null;
  let cleaned = answer.replace(/N\$|R|\$/gi, '').replace(/\s+/g, '');
  cleaned = cleaned.replace(/,/g, '.').trim();

  const frac = cleaned.match(/^(-?\d+)\/(\d+)$/);
  if (frac) {
    const num = parseFloat(frac[1]); const den = parseFloat(frac[2]);
    if (!den) return null; return num/den;
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
