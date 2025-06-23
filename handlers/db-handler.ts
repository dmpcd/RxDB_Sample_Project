import { AbstractRefdataHandler } from './abstract-refdata-handler.js';

interface EntityConfiguration {
  entity_name: string;
  dynamic_update: boolean;
  loki_search_keys: string[];
}

interface Configuration {
  fileName: string;
  entities?: EntityConfiguration[];
}

interface UserData {
  idx: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
}

interface ProductData {
  idx: string;
  name: string;
  category: string;
  price: number;
  in_stock: boolean;
  created_at: string;
}

interface OrderData {
  idx: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: string;
  created_at: string;
}

interface CategoryData {
  idx: string;
  name: string;
  description: string;
  created_at: string;
}

type SampleData = UserData | ProductData | OrderData | CategoryData;

export class DBHandler extends AbstractRefdataHandler {
  private configuration: Configuration;
  private dburl: string;

  constructor(configuration: Configuration, dburl: string) {
    super('p8_db_handler_db');
    this.configuration = configuration;
    this.dburl = dburl;
  }

  async loadData(): Promise<void> {
    await this.initialize();

    const sampleEntities: string[] = [
      'users', 'products', 'orders', 'categories'
    ];

    const promises: Promise<void>[] = [];
    for (const entityName of sampleEntities) {
      const entity: EntityConfiguration = this.configuration.entities?.find(e => e.entity_name === entityName) || {
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

  async loadDataForCollection(entity: EntityConfiguration, collectionName: string): Promise<void> {
    try {
      const startTime = Date.now();

      const sampleData = this.generateSampleData(collectionName, 100);

      const loadLatency = Date.now() - startTime;
      const insertStartTime = Date.now();

      await this.insertDataArray(collectionName, sampleData);

      const insertLatency = Date.now() - insertStartTime;

      console.log(`------------ Loadup complete for collection: ${collectionName} ---------`);
      console.log(`Count: ${sampleData.length}, load up latency: ${loadLatency}ms, insert latency: ${insertLatency}ms`);

      const searchKeys = entity.loki_search_keys || ['idx'];
      console.log(`Adding search keys for collection ${collectionName}:`, searchKeys);
      await this.addSearchKeys(collectionName, searchKeys);

    } catch (error) {
      console.error(`DBHandler loadData failed for ${collectionName}:`, error);
      throw error;
    }
  }

  generateSampleData(collectionName: string, count: number): SampleData[] {
    const data: SampleData[] = [];
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

  async stop(): Promise<void> {
    await this.destroy();
  }
}