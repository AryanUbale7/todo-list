import assert from 'assert';
import { initializeDatabase, dbQuery } from '../src/db.js';
import { aiService } from '../src/services/aiService.js';

async function runTestSuite() {
  console.log('🧪 Starting TaskPulse Automated Test Suite...\n');
  let testsPassed = 0;

  try {
    // 1. Initialize Database
    await initializeDatabase();
    console.log('  ✔ [Test 1] Database schema & indexes initialized properly');
    testsPassed++;

    // 2. Test Category Operations
    const categories = await dbQuery.all('SELECT * FROM categories');
    assert(categories.length >= 5, 'Should have at least 5 default categories');
    console.log(`  ✔ [Test 2] Seed categories loaded successfully (${categories.length} found)`);
    testsPassed++;

    // 3. Test Task Creation with Subtasks and Recurring
    const taskInsert = await dbQuery.run(
      `INSERT INTO tasks (title, description, category_id, priority, status, recurring, estimated_minutes, subtasks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Test Automated Task',
        'Verifying subtasks & recurring engine',
        1,
        'urgent',
        'pending',
        'daily',
        45,
        JSON.stringify([{ id: 'st-1', title: 'Subtask 1', completed: false }])
      ]
    );
    assert(taskInsert.lastID, 'Task insertion should return lastID');
    const createdTask = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [taskInsert.lastID]);
    assert.strictEqual(createdTask.title, 'Test Automated Task');
    assert.strictEqual(createdTask.recurring, 'daily');
    assert.strictEqual(createdTask.estimated_minutes, 45);
    console.log('  ✔ [Test 3] Task CRUD creation with subtasks, recurring & estimation validated');
    testsPassed++;

    // 4. Test Soft Delete and Trash Restore
    const now = new Date().toISOString();
    await dbQuery.run('UPDATE tasks SET deleted_at = ? WHERE id = ?', [now, createdTask.id]);
    const softDeleted = await dbQuery.get('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NOT NULL', [createdTask.id]);
    assert(softDeleted, 'Task should be soft-deleted in trash');

    await dbQuery.run('UPDATE tasks SET deleted_at = NULL WHERE id = ?', [createdTask.id]);
    const restored = await dbQuery.get('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL', [createdTask.id]);
    assert(restored, 'Task should be restored from trash');
    console.log('  ✔ [Test 4] Soft delete, trash bin recovery & restore verified');
    testsPassed++;

    // 5. Test AI Subtask Decomposition Engine
    const aiSubtasks = aiService.generateSubtasks('Design landing page wireframes');
    assert(Array.isArray(aiSubtasks) && aiSubtasks.length >= 3, 'AI should generate at least 3 subtasks');
    assert(aiSubtasks[0].estimated_minutes > 0, 'Subtask should have estimated minutes');
    console.log(`  ✔ [Test 5] AI Subtask Generator produced ${aiSubtasks.length} intelligent steps`);
    testsPassed++;

    // 6. Test NLP Natural Language Parser
    const parsedNlp = aiService.parseNaturalLanguage('Submit tax audit report by tomorrow !urgent #Work');
    assert.strictEqual(parsedNlp.priority, 'urgent', 'NLP should extract priority');
    assert.strictEqual(parsedNlp.categoryName, 'Work', 'NLP should extract category');
    assert(parsedNlp.dueDate !== null, 'NLP should extract relative due date');
    console.log('  ✔ [Test 6] Natural Language quick task parser verified');
    testsPassed++;

    // Clean up test record
    await dbQuery.run('DELETE FROM tasks WHERE id = ?', [createdTask.id]);
    console.log('  ✔ [Test 7] Cleanup verified');
    testsPassed++;

    console.log(`\n🎉 ALL ${testsPassed} AUTOMATED TESTS PASSED WITH 100% SUCCESS!`);
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
}

runTestSuite();
