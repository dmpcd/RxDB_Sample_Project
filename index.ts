import { DBHandler } from './handlers/db-handler.js';
import { FileHandler } from './handlers/file-handler.js';

interface EntityConfiguration {
  entity_name: string;
  dynamic_update: boolean;
  loki_search_keys: string[];
}

interface Configuration {
  fileName: string;
  entities: EntityConfiguration[];
}

async function testDBHandler(): Promise<void> {
  console.log('\n=== Testing DBHandler ===');

  const configuration: Configuration = {
    fileName: 'test_db.json',
    entities: [
      {
        entity_name: 'users',
        dynamic_update: false,
        loki_search_keys: ['idx', 'username', 'email', 'role']
      },
      {
        entity_name: 'products',
        dynamic_update: false,
        loki_search_keys: ['idx', 'name', 'category']
      }
    ]
  };

  const dbHandler = new DBHandler(configuration, 'mongodb://localhost:27017/test');

  try {
    await dbHandler.loadData();

    console.log('\n--- Testing Queries ---');

    const activeUsers = await dbHandler.findMany('users', { active: true });
    console.log(`Found ${activeUsers.length} active users`);

    const user = await dbHandler.findOne('users', { username: 'user1' });
    console.log('Found user:', user);

    const adminEmails = await dbHandler.findValueByFilter('users', { role: 'admin' }, 'email');
    console.log('Admin emails:', adminEmails);

    const firstAdminUsername = await dbHandler.findSingleValueByFilter('users', { role: 'admin' }, 'username');
    console.log('First admin username:', firstAdminUsername);

    const allProducts = await dbHandler.getAll('products');
    console.log(`Total products: ${allProducts.length}`);

  } catch (error) {
    console.error('Error in DBHandler test:', error);
  } finally {
    await dbHandler.stop();
  }
}

async function testFileHandler(): Promise<void> {
  console.log('\n=== Testing FileHandler ===');

  const configuration: Configuration = {
    fileName: 'sample-data.json',
    entities: [
      {
        entity_name: 'users',
        dynamic_update: false,
        loki_search_keys: ['idx', 'username']
      }
    ]
  };

  const fileHandler = new FileHandler(configuration, './sample-data.json', null);

  try {
    await fileHandler.loadData();

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

async function main(): Promise<void> {
  try {
    await testDBHandler();
    await testFileHandler();
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();