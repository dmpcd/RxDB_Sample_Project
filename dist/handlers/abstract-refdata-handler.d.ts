import { RxCollection } from 'rxdb/plugins/core';
interface DocumentData {
    [key: string]: any;
}
interface FilterQuery {
    [key: string]: any;
}
export declare class AbstractRefdataHandler {
    private db;
    private entitySearchKeys;
    private dbName;
    constructor(dbName?: string);
    initialize(): Promise<void>;
    addSearchKeys(collectionName: string, keys: string[]): Promise<void>;
    insertData(collectionName: string, data: DocumentData): Promise<void>;
    insertDataArray(collectionName: string, dataArray: DocumentData[]): Promise<void>;
    findValueByFilter(collectionName: string, filter: FilterQuery, queryField: string): Promise<any[]>;
    findSingleValueByFilter(collectionName: string, filter: FilterQuery, queryField: string): Promise<any>;
    findOne(collectionName: string, filter: FilterQuery): Promise<DocumentData | null>;
    findMany(collectionName: string, filter: FilterQuery): Promise<DocumentData[]>;
    getAll(collectionName: string): Promise<DocumentData[]>;
    getOrCreateCollection(collectionName: string): Promise<RxCollection>;
    destroy(): Promise<void>;
}
export {};
