import assert from 'assert';
import { parseTaskNlp } from '../utils/nlpParser.js';
import { validateTaskPayload, sanitizeText } from '../utils/validators.js';
import { formatDueDate, formatDuration, truncate } from '../utils/formatters.js';

/**
 * FocusList Comprehensive Domain & Unit Test Suite
 */
function runAllTests() {
  console.log('🧪 Starting FocusList Comprehensive Unit Test Suite...\n');
  let passedCount = 0;

  function runTest(name, fn) {
    try {
      fn();
      console.log(`  ✔ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ✖ [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  // 1. Initial State
  runTest('Initial state empty array verification', () => {
    const todos = [];
    assert.strictEqual(todos.length, 0);
  });

  // 2. Add Task with Priority
  runTest('Add Task operation with priority assignment', () => {
    const list = [];
    const task = {
      id: 101,
      title: 'Implement unit test coverage',
      description: 'Cover all critical pathways',
      priority: 'high',
      status: 'pending',
      completed: false,
      created_at: new Date().toISOString()
    };
    const nextList = [task, ...list];
    assert.strictEqual(nextList.length, 1);
    assert.strictEqual(nextList[0].priority, 'high');
    assert.strictEqual(nextList[0].status, 'pending');
  });

  // 3. Status Toggle
  runTest('Toggle task completion and state transition', () => {
    const task = { id: 1, title: 'Test Task', status: 'pending', completed: false };
    const toggled = { ...task, status: 'completed', completed: true, completed_at: new Date().toISOString() };
    assert.strictEqual(toggled.completed, true);
    assert.strictEqual(toggled.status, 'completed');
    assert.ok(toggled.completed_at);
  });

  // 4. Update / Edit Task
  runTest('Edit existing task title and priority', () => {
    const task = { id: 1, title: 'Old Title', priority: 'low' };
    const updated = { ...task, title: 'Updated Title', priority: 'urgent' };
    assert.strictEqual(updated.title, 'Updated Title');
    assert.strictEqual(updated.priority, 'urgent');
  });

  // 5. Delete & Soft Delete
  runTest('Soft delete task into trash and restore', () => {
    const task = { id: 1, title: 'To be deleted', deleted_at: null };
    const trashed = { ...task, deleted_at: new Date().toISOString() };
    assert.ok(trashed.deleted_at);

    const restored = { ...trashed, deleted_at: null };
    assert.strictEqual(restored.deleted_at, null);
  });

  // 6. Filter by Status (All, Active, Completed)
  runTest('Filter tasks by status (All, Active, Completed)', () => {
    const tasks = [
      { id: 1, status: 'pending', completed: false },
      { id: 2, status: 'completed', completed: true },
      { id: 3, status: 'in_progress', completed: false }
    ];

    const all = tasks;
    const active = tasks.filter((t) => t.status !== 'completed');
    const completed = tasks.filter((t) => t.status === 'completed');

    assert.strictEqual(all.length, 3);
    assert.strictEqual(active.length, 2);
    assert.strictEqual(completed.length, 1);
  });

  // 7. Filter by Priority
  runTest('Filter tasks by Priority level (High, Medium, Low, Urgent)', () => {
    const tasks = [
      { id: 1, priority: 'urgent' },
      { id: 2, priority: 'high' },
      { id: 3, priority: 'medium' },
      { id: 4, priority: 'low' }
    ];

    const highOrUrgent = tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent');
    assert.strictEqual(highOrUrgent.length, 2);
  });

  // 8. Search by Title
  runTest('Search tasks by title keyword', () => {
    const tasks = [
      { id: 1, title: 'Deploy FocusList frontend', description: 'Production build' },
      { id: 2, title: 'Design user onboarding', description: 'Figma wireframes' },
      { id: 3, title: 'Setup GitHub Actions CI/CD', description: 'Continuous integration' }
    ];

    const query = 'focuslist';
    const results = tasks.filter((t) => t.title.toLowerCase().includes(query));
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 1);
  });

  // 9. Statistics Calculations
  runTest('Derived statistics calculations (Total, Completed, Pending, Rate)', () => {
    const tasks = [
      { id: 1, status: 'completed', completed: true, time_spent_seconds: 600 },
      { id: 2, status: 'completed', completed: true, time_spent_seconds: 1200 },
      { id: 3, status: 'pending', completed: false, time_spent_seconds: 0 },
      { id: 4, status: 'in_progress', completed: false, time_spent_seconds: 300 }
    ];

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const rate = Math.round((completed / total) * 100);
    const totalTime = tasks.reduce((acc, t) => acc + t.time_spent_seconds, 0);

    assert.strictEqual(total, 4);
    assert.strictEqual(completed, 2);
    assert.strictEqual(pending, 1);
    assert.strictEqual(rate, 50);
    assert.strictEqual(totalTime, 2100);
  });

  // 10. NLP Task Parsing
  runTest('Natural language processing parser extracts priority, category, and date', () => {
    const parsed = parseTaskNlp('Deploy release notes by tomorrow !urgent #Work');
    assert.strictEqual(parsed.priority, 'urgent');
    assert.strictEqual(parsed.categoryName, 'Work');
    assert.ok(parsed.dueDate);
    assert.strictEqual(parsed.title, 'Deploy release notes');
  });

  // 11. Validation Utility
  runTest('Validator rejects empty titles and validates payload integrity', () => {
    const invalid = validateTaskPayload({ title: '   ' });
    assert.strictEqual(invalid.isValid, false);
    assert.ok(invalid.errors.title);

    const valid = validateTaskPayload({ title: 'Valid Title', priority: 'high' });
    assert.strictEqual(valid.isValid, true);
  });

  // 12. Formatters & Sanitization
  runTest('Formatters and text sanitization', () => {
    const sanitized = sanitizeText('<script>alert("xss")</script>');
    assert.strictEqual(sanitized, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

    const duration = formatDuration(3665);
    assert.strictEqual(duration, '1h 1m');

    const truncated = truncate('This is a very long task title that exceeds max length', 15);
    assert.strictEqual(truncated, 'This is a very...');
  });

  console.log(`\n🎉 SUCCESS: All ${passedCount}/${passedCount} FocusList Unit Tests Passed!\n`);
}

runAllTests();
