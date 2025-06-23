interface SchemaProperty {
    type: string;
    maxLength?: number;
    format?: string;
}
interface Schema {
    title: string;
    version: number;
    description: string;
    type: string;
    primaryKey: string;
    properties: {
        [key: string]: SchemaProperty;
    };
    required: string[];
    indexes: string[];
}
export declare const entitySchema: Schema;
export declare const userSchema: Schema;
export {};
