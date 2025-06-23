import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { get } from 'lodash-es';
import { userSchema, entitySchema } from '../schemas/entity-schema.js';
addRxPlugin(RxDBDevModePlugin);
export class AbstractRefdataHandler {
    constructor(dbName = 'p8_in_memory_db') {
        this.db = null;
        this.entitySearchKeys = new Map();
        this.dbName = dbName;
    }
    async initialize() {
        this.db = await createRxDatabase({
            name: this.dbName,
            storage: getRxStorageMemory()
        });
    }
    async addSearchKeys(collectionName, keys) {
        this.entitySearchKeys.set(collectionName, keys);
        console.log(`Added search keys for ${collectionName}:`, keys);
    }
    async insertData(collectionName, data) {
        const collection = await this.getOrCreateCollection(collectionName);
        await collection.insert(data);
        console.log(`Data inserted into ${collectionName}:`, JSON.stringify(data));
    }
    async insertDataArray(collectionName, dataArray) {
        if (!dataArray || dataArray.length === 0)
            return;
        const collection = await this.getOrCreateCollection(collectionName);
        await collection.bulkInsert(dataArray);
        console.log(`Bulk inserted ${dataArray.length} documents into ${collectionName}`);
    }
    async findValueByFilter(collectionName, filter, queryField) {
        console.log(`findValueByFilter: ${collectionName}, filter: ${JSON.stringify(filter)}, field: ${queryField}`);
        const startTime = Date.now();
        if (!this.db) {
            console.error('Database not initialized');
            return [];
        }
        const collection = this.db[collectionName];
        if (!collection) {
            console.log(`Collection not found: ${collectionName}`);
            return [];
        }
        const result = await collection.find({
            selector: filter
        }).exec();
        const values = result.map((doc) => get(doc.toJSON(), queryField));
        console.log(`findValueByFilter completed in ${Date.now() - startTime}ms`);
        return values;
    }
    async findSingleValueByFilter(collectionName, filter, queryField) {
        console.log(`findSingleValueByFilter: ${collectionName}, filter: ${JSON.stringify(filter)}, field: ${queryField}`);
        const startTime = Date.now();
        if (!this.db) {
            console.error('Database not initialized');
            return null;
        }
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
        if (!this.db) {
            console.error('Database not initialized');
            return null;
        }
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
        if (!this.db) {
            console.error('Database not initialized');
            return [];
        }
        const collection = this.db[collectionName];
        if (!collection) {
            console.log(`Collection not found: ${collectionName}`);
            return [];
        }
        const result = await collection.find({
            selector: filter
        }).exec();
        console.log(`findMany completed in ${Date.now() - startTime}ms`);
        return result.map((doc) => doc.toJSON());
    }
    async getAll(collectionName) {
        if (!this.db) {
            console.error('Database not initialized');
            return [];
        }
        const collection = this.db[collectionName];
        if (!collection) {
            console.log(`Collection not found: ${collectionName}`);
            return [];
        }
        const result = await collection.find().exec();
        return result.map((doc) => doc.toJSON());
    }
    async getOrCreateCollection(collectionName) {
        if (!this.db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        if (this.db[collectionName]) {
            return this.db[collectionName];
        }
        let schema;
        if (collectionName === 'users') {
            schema = { ...userSchema, additionalProperties: false };
            const searchKeys = this.entitySearchKeys.get(collectionName);
            if (searchKeys && searchKeys.length > 0) {
                // Filter out primary key from indexes
                schema.indexes = searchKeys.filter(key => key !== 'idx');
            }
            schema.additionalProperties = false;
        }
        else if (collectionName === 'products') {
            schema = { ...entitySchema, additionalProperties: false };
            const searchKeys = this.entitySearchKeys.get(collectionName);
            if (searchKeys && searchKeys.length > 0) {
                // Filter out primary key from indexes
                schema.indexes = searchKeys.filter(key => key !== 'idx');
            }
            schema.additionalProperties = false;
        }
        else {
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
                additionalProperties: false
            };
            const searchKeys = this.entitySearchKeys.get(collectionName);
            if (searchKeys && searchKeys.length > 0) {
                // Filter out primary key from indexes
                schema.indexes = searchKeys.filter(key => key !== 'idx');
            }
            schema.additionalProperties = false;
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
            this.db = null;
        }
    }
}
//# sourceMappingURL=abstract-refdata-handler.js.map