/**
 * AI & Smart Heuristic Service for Task Breakdown, Priority Estimation, and NLP Parsing
 */

export const aiService = {
  /**
   * Intelligently decompose a task into actionable subtasks with estimates
   * @param {string} title
   * @param {string} description
   * @returns {Array<{id: string, title: string, completed: boolean, estimated_minutes: number}>}
   */
  generateSubtasks(title, description = '') {
    const lowerTitle = (title + ' ' + description).toLowerCase();

    // Domain-specific heuristic generators
    if (lowerTitle.includes('deploy') || lowerTitle.includes('release') || lowerTitle.includes('launch')) {
      return [
        { id: 'st-1', title: 'Run automated tests & verify build', completed: false, estimated_minutes: 10 },
        { id: 'st-2', title: 'Review environment configuration & secrets', completed: false, estimated_minutes: 5 },
        { id: 'st-3', title: 'Deploy to production/staging server', completed: false, estimated_minutes: 15 },
        { id: 'st-4', title: 'Perform post-deployment health check', completed: false, estimated_minutes: 10 },
      ];
    }

    if (lowerTitle.includes('design') || lowerTitle.includes('mockup') || lowerTitle.includes('wireframe') || lowerTitle.includes('ui')) {
      return [
        { id: 'st-1', title: 'Research inspiration & user flow patterns', completed: false, estimated_minutes: 15 },
        { id: 'st-2', title: 'Create low-fidelity wireframe sketches', completed: false, estimated_minutes: 25 },
        { id: 'st-3', title: 'Build high-fidelity responsive components', completed: false, estimated_minutes: 35 },
        { id: 'st-4', title: 'Collect stakeholder feedback & polish UI', completed: false, estimated_minutes: 15 },
      ];
    }

    if (lowerTitle.includes('study') || lowerTitle.includes('learn') || lowerTitle.includes('read') || lowerTitle.includes('exam') || lowerTitle.includes('research')) {
      return [
        { id: 'st-1', title: 'Review core documentation & key concepts', completed: false, estimated_minutes: 25 },
        { id: 'st-2', title: 'Take structured notes & highlight questions', completed: false, estimated_minutes: 20 },
        { id: 'st-3', title: 'Practice hands-on examples or quiz problems', completed: false, estimated_minutes: 30 },
        { id: 'st-4', title: 'Summarize key takeaways in flashcards', completed: false, estimated_minutes: 15 },
      ];
    }

    if (lowerTitle.includes('workout') || lowerTitle.includes('gym') || lowerTitle.includes('run') || lowerTitle.includes('health') || lowerTitle.includes('fitness')) {
      return [
        { id: 'st-1', title: 'Dynamic warm-up & joint mobility (5 min)', completed: false, estimated_minutes: 5 },
        { id: 'st-2', title: 'Primary exercise routine / main sets', completed: false, estimated_minutes: 30 },
        { id: 'st-3', title: 'Cool down, stretching & hydration', completed: false, estimated_minutes: 10 },
      ];
    }

    if (lowerTitle.includes('clean') || lowerTitle.includes('shop') || lowerTitle.includes('buy') || lowerTitle.includes('grocery')) {
      return [
        { id: 'st-1', title: 'Draft itemized checklist & verify inventory', completed: false, estimated_minutes: 5 },
        { id: 'st-2', title: 'Execute tasks in logical order', completed: false, estimated_minutes: 25 },
        { id: 'st-3', title: 'Organize, put away items & final review', completed: false, estimated_minutes: 10 },
      ];
    }

    // Generalized smart breakdown for any generic goal
    const words = title.trim().split(/\s+/);
    const mainAction = words[0] || 'Plan';
    const subject = words.slice(1).join(' ') || 'task requirements';

    return [
      { id: 'st-1', title: `Define scope and prepare materials for ${subject}`, completed: false, estimated_minutes: 10 },
      { id: 'st-2', title: `Execute primary milestone: ${title}`, completed: false, estimated_minutes: 25 },
      { id: 'st-3', title: `Review output for quality and completeness`, completed: false, estimated_minutes: 10 },
      { id: 'st-4', title: `Finalize documentation and archive results`, completed: false, estimated_minutes: 5 },
    ];
  },

  /**
   * Parse natural language text into structured task fields
   * Example: "Finish Q3 financial slides by tomorrow !urgent #Work"
   */
  parseNaturalLanguage(text) {
    let cleanText = text;
    let priority = 'medium';
    let categoryName = null;
    let dueDate = null;

    // Check priority tags: !urgent, !high, !low, !medium
    if (/!urgent/i.test(cleanText)) {
      priority = 'urgent';
      cleanText = cleanText.replace(/!urgent/i, '');
    } else if (/!high/i.test(cleanText)) {
      priority = 'high';
      cleanText = cleanText.replace(/!high/i, '');
    } else if (/!low/i.test(cleanText)) {
      priority = 'low';
      cleanText = cleanText.replace(/!low/i, '');
    }

    // Check category tag: #Work, #Personal, etc.
    const catMatch = cleanText.match(/#(\w+)/);
    if (catMatch) {
      categoryName = catMatch[1];
      cleanText = cleanText.replace(/#\w+/, '');
    }

    // Check relative date: "today", "tomorrow", "next week"
    const today = new Date();
    if (/\btoday\b/i.test(cleanText)) {
      dueDate = today.toISOString().split('T')[0];
      cleanText = cleanText.replace(/\b(by\s+)?today\b/i, '');
    } else if (/\btomorrow\b/i.test(cleanText)) {
      const tomorrow = new Date(today.getTime() + 86400000);
      dueDate = tomorrow.toISOString().split('T')[0];
      cleanText = cleanText.replace(/\b(by\s+)?tomorrow\b/i, '');
    }

    return {
      title: cleanText.replace(/\s+/g, ' ').trim(),
      priority,
      categoryName,
      dueDate
    };
  }
};
