import { initializeDatabase, dbQuery } from './src/db.js';

async function testBackend() {
  console.log('Testing backend initialization and database queries...');
  try {
    await initializeDatabase();
    
    // Check categories
    const categories = await dbQuery.all('SELECT * FROM categories');
    console.log(`✅ Loaded ${categories.length} categories:`, categories.map(c => c.name).join(', '));

    // Check tasks
    const tasks = await dbQuery.all('SELECT * FROM tasks');
    console.log(`✅ Loaded ${tasks.length} seeded tasks`);

    // Test creating a task
    const insertRes = await dbQuery.run(
      'INSERT INTO tasks (title, description, priority, status) VALUES (?, ?, ?, ?)',
      ['Automated Test Task', 'Verifying SQLite DB insertion', 'high', 'pending']
    );
    console.log(`✅ Inserted test task with ID: ${insertRes.lastID}`);

    // Verify retrieval
    const retrieved = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [insertRes.lastID]);
    console.log('✅ Retrieved test task:', retrieved.title);

    // Clean up test task
    await dbQuery.run('DELETE FROM tasks WHERE id = ?', [insertRes.lastID]);
    console.log('✅ Cleaned up test task');

    console.log('\n🎉 Backend & SQLite database tests PASSED successfully!');
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    process.exit(1);
  }
}

testBackend();
