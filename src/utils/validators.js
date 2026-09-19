/**
 * FocusList Input & Schema Validation Utilities
 */

/**
 * Validates task creation payload.
 * @param {Object} taskData - The task object to validate.
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateTaskPayload(taskData) {
  const errors = {};

  if (!taskData || typeof taskData !== 'object') {
    return { isValid: false, errors: { general: 'Task payload must be an object' } };
  }

  if (!taskData.title || typeof taskData.title !== 'string' || !taskData.title.trim()) {
    errors.title = 'Task title is required and cannot be empty.';
  } else if (taskData.title.trim().length > 255) {
    errors.title = 'Task title cannot exceed 255 characters.';
  }

  if (taskData.description && taskData.description.length > 2000) {
    errors.description = 'Task description cannot exceed 2000 characters.';
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (taskData.priority && !validPriorities.includes(taskData.priority)) {
    errors.priority = `Priority must be one of: ${validPriorities.join(', ')}`;
  }

  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (taskData.status && !validStatuses.includes(taskData.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitizes text to prevent XSS.
 * @param {string} input - Raw user input.
 * @returns {string} Sanitized string.
 */
export function sanitizeText(input = '') {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
