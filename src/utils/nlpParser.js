/**
 * FocusList Natural Language Processing (NLP) Parser
 * Extracts structured task metadata (priority, category, due date, subtasks) from raw text.
 */

/**
 * Parses conversational natural text into a structured task object.
 * @param {string} text - Raw natural language string (e.g. "Draft OKR slides by tomorrow !urgent #Work")
 * @returns {{ title: string, priority: string, categoryName: string|null, dueDate: string|null }}
 */
export function parseTaskNlp(text = '') {
  let clean = text || '';
  let priority = 'medium';
  let categoryName = null;
  let dueDate = null;

  // Extract Priority: !urgent, !high, !med, !low
  if (/!(urgent|critical|p0)/i.test(clean)) {
    priority = 'urgent';
    clean = clean.replace(/!(urgent|critical|p0)/gi, '');
  } else if (/!(high|p1)/i.test(clean)) {
    priority = 'high';
    clean = clean.replace(/!(high|p1)/gi, '');
  } else if (/!(medium|med|p2)/i.test(clean)) {
    priority = 'medium';
    clean = clean.replace(/!(medium|med|p2)/gi, '');
  } else if (/!(low|p3)/i.test(clean)) {
    priority = 'low';
    clean = clean.replace(/!(low|p3)/gi, '');
  }

  // Extract Category: #Work, #Personal, #Shopping, etc.
  const catMatch = clean.match(/#([a-zA-Z0-9_-]+)/);
  if (catMatch) {
    categoryName = catMatch[1];
    clean = clean.replace(/#([a-zA-Z0-9_-]+)/g, '');
  }

  // Extract Due Dates: "today", "tomorrow", "next week", "in X days"
  const today = new Date();
  if (/\b(by\s+)?today\b/i.test(clean)) {
    dueDate = today.toISOString().split('T')[0];
    clean = clean.replace(/\b(by\s+)?today\b/gi, '');
  } else if (/\b(by\s+)?tomorrow\b/i.test(clean)) {
    const tomorrow = new Date(today.getTime() + 86400000);
    dueDate = tomorrow.toISOString().split('T')[0];
    clean = clean.replace(/\b(by\s+)?tomorrow\b/gi, '');
  } else if (/\bin\s+(\d+)\s+days?\b/i.test(clean)) {
    const match = clean.match(/\bin\s+(\d+)\s+days?\b/i);
    if (match) {
      const days = parseInt(match[1], 10);
      const targetDate = new Date(today.getTime() + days * 86400000);
      dueDate = targetDate.toISOString().split('T')[0];
      clean = clean.replace(/\bin\s+\d+\s+days?\b/gi, '');
    }
  }

  return {
    title: clean.replace(/\s+/g, ' ').trim(),
    priority,
    categoryName,
    dueDate
  };
}
