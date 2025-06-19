import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { get, map } from 'lodash-es';
import { userSchema, entitySchema } from '../schemas/entity-schema.js';

// Add dev mode plugin for better development experience
addRxPlugin(RxDBDevModePlugin);

export class AbstractRefdataHandler {

  constructor() {
    this.db = null;
    this.entitySearchKeys = new Map();
  }

  async initialize() {
    // Create the database with in-memory storage
    this.db = await createRxDatabase({
      name: 'p8_in_memory_db',
      storage: getRxStorageMemory()
    });
  }

  async addSearchKeys(collectionName, keys) {
    // Store search keys for future reference
    this.entitySearchKeys.set(collectionName, keys);
    // Do not recreate or modify the collection here!
    console.log(`Added search keys for ${collectionName}:`, keys);
  }

  async insertData(collectionName, data) {
    const collection = await this.getOrCreateCollection(collectionName);
    await collection.insert(data);
    console.log(`Data inserted into ${collectionName}:`, JSON.stringify(data));
  }

  async insertDataArray(collectionName, dataArray) {
    if (!dataArray || dataArray.length === 0) return;

    const collection = await this.getOrCreateCollection(collectionName);
    await collection.bulkInsert(dataArray);
    console.log(`Bulk inserted ${dataArray.length} documents into ${collectionName}`);
  }

  async findValueByFilter(collectionName, filter, queryField) {
    console.log(`findValueByFilter: ${collectionName}, filter: ${JSON.stringify(filter)}, field: ${queryField}`);
    const startTime = Date.now();

    const collection = this.db[collectionName];
    if (!collection) {
      console.log(`Collection not found: ${collectionName}`);
      return [];
    }

    const result = await collection.find({
      selector: filter
    }).exec();

    const values = result.map(doc => get(doc.toJSON(), queryField));
    console.log(`findValueByFilter completed in ${Date.now() - startTime}ms`);
    return values;
  }

  async findSingleValueByFilter(collectionName, filter, queryField) {
    console.log(`findSingleValueByFilter: ${collectionName}, filter: ${JSON.stringify(filter)}, field: ${queryField}`);
    const startTime = Date.now();

    const collection = this.db[collectionName];
    if (!collection) {
      console.log(`Collection not found: ${collectionName}`);
      return null;
    }

    const result = await collection.findOne({
      selector: filter
    }).exec();

    if (result) {
      const value = get(result.toJSON(), queryField);
      console.log(`findSingleValueByFilter completed in ${Date.now() - startTime}ms`);
      return value;
    }
    return null;
  }

  async findOne(collectionName, filter) {
    console.log(`findOne: ${collectionName}, filter: ${JSON.stringify(filter)}`);
    const startTime = Date.now();

    const collection = this.db[collectionName];
    if (!collection) {
      console.log(`Collection not found: ${collectionName}`);
      return null;
    }

    const result = await collection.findOne({
      selector: filter
    }).exec();

    console.log(`findOne completed in ${Date.now() - startTime}ms`);
    return result ? result.toJSON() : null;
  }

  async findMany(collectionName, filter) {
    console.log(`findMany: ${collectionName}, filter: ${JSON.stringify(filter)}`);
    const startTime = Date.now();

    const collection = this.db[collectionName];
    if (!collection) {
      console.log(`Collection not found: ${collectionName}`);
      return [];
    }

    const result = await collection.find({
      selector: filter
    }).exec();

    console.log(`findMany completed in ${Date.now() - startTime}ms`);
    return result.map(doc => doc.toJSON());
  }

  async getAll(collectionName) {
    const collection = this.db[collectionName];
    if (!collection) {
      console.log(`Collection not found: ${collectionName}`);
      return [];
    }

    const result = await collection.find().exec();
    return result.map(doc => doc.toJSON());
  }

  async getOrCreateCollection(collectionName) {
    // Check if collection already exists
    if (this.db[collectionName]) {
      return this.db[collectionName];
    }

    // Use static schemas for known collections
    let schema;
    if (collectionName === 'users') {
      schema = { ...userSchema };
      // Add search keys as indexes if available
      const searchKeys = this.entitySearchKeys.get(collectionName);
      if (searchKeys && searchKeys.length > 0) {
        schema.indexes = searchKeys;
      }
    } else if (collectionName === 'products') {
      schema = { ...entitySchema };
      const searchKeys = this.entitySearchKeys.get(collectionName);
      if (searchKeys && searchKeys.length > 0) {
        schema.indexes = searchKeys;
      }
    } else {
      // Create a generic schema for dynamic collections
      schema = {
        title: `${collectionName} schema`,
        version: 0,
        description: `Dynamic schema for ${collectionName}`,
        type: 'object',
        primaryKey: 'idx',
        properties: {
          idx: {
            type: 'string',
            maxLength: 100
          }
        },
        required: ['idx'],
        additionalProperties: true
      };
      const searchKeys = this.entitySearchKeys.get(collectionName);
      if (searchKeys && searchKeys.length > 0) {
        schema.indexes = searchKeys;
      }
    }

    await this.db.addCollections({
      [collectionName]: {
        schema: schema
      }
    });

    return this.db[collectionName];
  }

  async destroy() {
    if (this.db) {
      await this.db.destroy();
    }
  }
}
