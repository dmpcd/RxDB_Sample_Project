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
export declare class DBHandler extends AbstractRefdataHandler {
    private configuration;
    private dburl;
    constructor(configuration: Configuration, dburl: string);
    loadData(): Promise<void>;
    loadDataForCollection(entity: EntityConfiguration, collectionName: string): Promise<void>;
    generateSampleData(collectionName: string, count: number): SampleData[];
    stop(): Promise<void>;
}
export {};
