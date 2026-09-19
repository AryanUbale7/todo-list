/**
 * @typedef {Object} Subtask
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 * @property {number} [estimated_minutes]
 */

/**
 * @typedef {'low' | 'medium' | 'high' | 'urgent'} TodoPriority
 */

/**
 * @typedef {'pending' | 'in_progress' | 'completed'} TodoStatus
 */

/**
 * @typedef {'none' | 'daily' | 'weekly' | 'monthly'} RecurringInterval
 */

/**
 * @typedef {Object} Todo
 * @property {number|string} id - Unique identifier
 * @property {string} title - Main todo title or description
 * @property {string} [description] - Extended notes
 * @property {boolean} completed - Completed state flag
 * @property {TodoStatus} status - Lifecycle status
 * @property {TodoPriority} priority - Urgency / priority level
 * @property {number|null} [category_id] - Associated category foreign key
 * @property {string|null} [category_name] - Associated category display name
 * @property {string|null} [category_color] - Associated category theme color
 * @property {string|null} [category_icon] - Associated category icon name
 * @property {string|null} [due_date] - ISO date string (YYYY-MM-DD)
 * @property {RecurringInterval} [recurring] - Recurring schedule rule
 * @property {number} [estimated_minutes] - Estimated duration in minutes
 * @property {number} [time_spent_seconds] - Tracked focus time in seconds
 * @property {Subtask[]} [subtasks] - Nested checklist items
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Last modified timestamp
 * @property {string|null} [completed_at] - Completion timestamp
 * @property {string|null} [deleted_at] - Soft-deletion timestamp
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} color
 * @property {string} icon
 * @property {number} [task_count]
 * @property {number} [completed_task_count]
 */

export {};
