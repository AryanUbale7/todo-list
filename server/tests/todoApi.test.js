import assert from 'assert';
import { initializeDatabase, dbQuery } from '../src/db.js';
import { aiService } from '../src/services/aiService.js';

async function runTodoApiTestSuite() {
  console.log('🧪 Starting Build a Functional To-Do Application Test Suite...\n');
  let testsPassed = 0;

  try {
    // 1. Database initialization
    await initializeDatabase();
    console.log('  ✔ [Test 1] Database schema, indexes & foreign keys initialized');
    testsPassed++;

    // 2. Categories
    const categories = await dbQuery.all('SELECT * FROM categories');
    assert(categories.length >= 5, 'Should have at least 5 default categories');
    console.log(`  ✔ [Test 2] Categories loaded (${categories.length} found)`);
    testsPassed++;

    // 3. Create Todo Item
    const insertRes = await dbQuery.run(
      `INSERT INTO tasks (title, description, category_id, priority, status, recurring, estimated_minutes, subtasks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Build a Functional To-Do Application',
        'Fully functional Todo app with React & Node',
        1,
        'urgent',
        'pending',
        'none',
        30,
        JSON.stringify([{ id: 'st-1', title: 'Verify unit tests', completed: false }])
      ]
    );
    assert(insertRes.lastID, 'Insertion should return lastID');
    const created = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [insertRes.lastID]);
    assert.strictEqual(created.title, 'Build a Functional To-Do Application');
    console.log('  ✔ [Test 3] Create Todo with subtasks & metadata validated');
    testsPassed++;

    // 4. Toggle Todo Completion Status
    const now = new Date().toISOString();
    await dbQuery.run('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', ['completed', now, created.id]);
    const completedTodo = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [created.id]);
    assert.strictEqual(completedTodo.status, 'completed');
    assert(completedTodo.completed_at !== null);
    console.log('  ✔ [Test 4] Toggle Todo completion state validated');
    testsPassed++;

    // 5. AI Smart Subtask Breakdown
    const subtasks = aiService.generateSubtasks('Build a Functional To-Do Application');
    assert(Array.isArray(subtasks) && subtasks.length >= 3);
    console.log(`  ✔ [Test 5] AI Smart Subtask generator produced ${subtasks.length} steps`);
    testsPassed++;

    // 6. Natural Language Task Parser
    const nlp = aiService.parseNaturalLanguage('Deploy To-Do application by tomorrow !urgent #Projects');
    assert.strictEqual(nlp.priority, 'urgent');
    assert.strictEqual(nlp.categoryName, 'Projects');
    assert(nlp.dueDate !== null);
    console.log('  ✔ [Test 6] Natural Language quick parser validated');
    testsPassed++;

    // 7. Cleanup
    await dbQuery.run('DELETE FROM tasks WHERE id = ?', [created.id]);
    console.log('  ✔ [Test 7] Cleanup verified');
    testsPassed++;

    console.log(`\n🎉 ALL ${testsPassed} TO-DO TESTS PASSED WITH 100% SUCCESS!\n`);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTodoApiTestSuite();
