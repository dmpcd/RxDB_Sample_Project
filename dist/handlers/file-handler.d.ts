import { AbstractRefdataHandler } from './abstract-refdata-handler.js';
interface EntityConfiguration {
    entity_name: string;
    dynamic_update: boolean;
    loki_search_keys?: string[];
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
    created_at?: string;
}
interface ProductData {
    idx: string;
    name: string;
    price: number;
    category: string;
    in_stock: boolean;
    created_at?: string;
}
interface FileObject {
    [key: string]: any[] | undefined;
    users?: UserData[];
    products?: ProductData[];
}
export declare class FileHandler extends AbstractRefdataHandler {
    private configuration;
    private filePath;
    private fileContent;
    constructor(configuration: Configuration, filePath: string | null, fileContent: FileObject | null);
    loadData(): Promise<string>;
    stop(): Promise<void>;
}
export {};
