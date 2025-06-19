import { DBHandler } from './handlers/db-handler.js';
import { FileHandler } from './handlers/file-handler.js';

async function testDBHandler() {
  console.log('\n=== Testing DBHandler ===');

  const configuration = {
    fileName: 'test_db.json',
    entities: [
      {
        entity_name: 'users',
        loki_search_keys: ['idx', 'username', 'email', 'role']
      },
      {
        entity_name: 'products',
        loki_search_keys: ['idx', 'name', 'category']
      }
    ]
  };

  const dbHandler = new DBHandler(configuration, 'mongodb://localhost:27017/test');

  try {
    // Load sample data
    await dbHandler.loadData();

    // Test queries
    console.log('\n--- Testing Queries ---');

    // Find all active users
    const activeUsers = await dbHandler.findMany('users', { active: true });
    console.log(`Found ${activeUsers.length} active users`);

    // Find a specific user
    const user = await dbHandler.findOne('users', { username: 'user1' });
    console.log('Found user:', user);

    // Find user emails for admin role
    const adminEmails = await dbHandler.findValueByFilter('users', { role: 'admin' }, 'email');
    console.log('Admin emails:', adminEmails);

    // Find first admin username
    const firstAdminUsername = await dbHandler.findSingleValueByFilter('users', { role: 'admin' }, 'username');
    console.log('First admin username:', firstAdminUsername);

    // Get all products
    const allProducts = await dbHandler.getAll('products');
    console.log(`Total products: ${allProducts.length}`);

  } catch (error) {
    console.error('Error in DBHandler test:', error);
  } finally {
    await dbHandler.stop();
  }
}

async function testFileHandler() {
  console.log('\n=== Testing FileHandler ===');

  const configuration = {
    fileName: 'file_db.json',
    entities: [
      {
        entity_name: 'users',
        loki_search_keys: ['idx', 'username']
      }
    ]
  };

  const fileHandler = new FileHandler(configuration, null, null);

  try {
    // Load data from sample content
    await fileHandler.loadData();

    // Test queries
    const allUsers = await fileHandler.getAll('users');
    console.log('Users from file:', allUsers);

    const adminUser = await fileHandler.findOne('users', { role: 'admin' });
    console.log('Admin user:', adminUser);

  } catch (error) {
    console.error('Error in FileHandler test:', error);
  } finally {
    await fileHandler.stop();
  }
}

async function main() {
  try {
    await testDBHandler();
    await testFileHandler();
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();

