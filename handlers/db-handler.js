import { AbstractRefdataHandler } from './abstract-refdata-handler.js';

export class DBHandler extends AbstractRefdataHandler {

  constructor(configuration, dburl) {
    super();
    this.configuration = configuration;
    this.dburl = dburl;
  }

  async loadData() {
    await this.initialize();

    // Simulate loading data from MongoDB
    const sampleEntities = [
      'users', 'products', 'orders', 'categories'
    ];

    const promises = [];
    for (const entityName of sampleEntities) {
      const entity = this.configuration.entities?.find(e => e.entity_name === entityName) || {
        entity_name: entityName,
        dynamic_update: false,
        loki_search_keys: ['idx', 'name']
      };

      promises.push(this.loadDataForCollection(entity, entityName));
    }

    await Promise.all(promises);

    console.log("===========================================>");
    console.log("====> LOAD UP COMPLETED");
    console.log("===========================================>");
  }

  async loadDataForCollection(entity, collectionName) {
    try {
      const startTime = Date.now();

      // Generate sample data (simulating MongoDB load)
      const sampleData = this.generateSampleData(collectionName, 100);

      const loadLatency = Date.now() - startTime;
      const insertStartTime = Date.now();

      await this.insertDataArray(collectionName, sampleData);

      const insertLatency = Date.now() - insertStartTime;

      console.log(`------------ Loadup complete for collection: ${collectionName} ---------`);
      console.log(`Count: ${sampleData.length}, load up latency: ${loadLatency}ms, insert latency: ${insertLatency}ms`);

      // Add search keys (indexes)
      const searchKeys = entity.loki_search_keys || ['idx'];
      console.log(`Adding search keys for collection ${collectionName}:`, searchKeys);
      await this.addSearchKeys(collectionName, searchKeys);

    } catch (error) {
      console.error(`DBHandler loadData failed for ${collectionName}:`, error);
      throw error;
    }
  }

  generateSampleData(collectionName, count) {
    const data = [];
    for (let i = 1; i <= count; i++) {
      if (collectionName === 'users') {
        data.push({
          idx: `user${i}`,
          username: `user${i}`,
          email: `user${i}@example.com`,
          role: i % 2 === 0 ? 'admin' : 'user',
          active: i % 3 !== 0,
          created_at: new Date().toISOString()
        });
      } else if (collectionName === 'products') {
        data.push({
          idx: `product${i}`,
          name: `Product ${i}`,
          category: i % 2 === 0 ? 'electronics' : 'clothing',
          price: Math.round(Math.random() * 1000) / 100,
          in_stock: i % 2 === 0,
          created_at: new Date().toISOString()
        });
      } else if (collectionName === 'orders') {
        data.push({
          idx: `order${i}`,
          user_id: `user${(i % 100) + 1}`,
          product_id: `product${(i % 100) + 1}`,
          quantity: Math.ceil(Math.random() * 5),
          status: i % 2 === 0 ? 'shipped' : 'pending',
          created_at: new Date().toISOString()
        });
      } else if (collectionName === 'categories') {
        data.push({
          idx: `category${i}`,
          name: `Category ${i}`,
          description: `Description for category ${i}`,
          created_at: new Date().toISOString()
        });
      }
    }
    return data;
  }

  async stop() {
    await this.destroy();
  }
}

