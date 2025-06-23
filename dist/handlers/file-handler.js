import { AbstractRefdataHandler } from './abstract-refdata-handler.js';
import { readFileSync } from 'fs';
export class FileHandler extends AbstractRefdataHandler {
    constructor(configuration, filePath, fileContent) {
        super('p8_file_handler_db');
        this.configuration = configuration;
        this.filePath = filePath;
        this.fileContent = fileContent;
    }
    async loadData() {
        await this.initialize();
        try {
            let fileObject = this.fileContent;
            if (fileObject == null && this.filePath) {
                try {
                    const fileContent = readFileSync(this.filePath, 'utf8');
                    fileObject = JSON.parse(fileContent);
                }
                catch (err) {
                    console.error(`Error reading file ${this.filePath}:`, err);
                    throw err;
                }
            }
            if (!fileObject) {
                fileObject = {
                    users: [
                        {
                            idx: 'user_1',
                            username: 'john_doe',
                            email: 'john@example.com',
                            role: 'admin',
                            active: true,
                            created_at: new Date().toISOString()
                        },
                        {
                            idx: 'user_2',
                            username: 'jane_smith',
                            email: 'jane@example.com',
                            role: 'user',
                            active: true,
                            created_at: new Date().toISOString()
                        }
                    ],
                    products: [
                        {
                            idx: 'product_1',
                            name: 'Laptop',
                            price: 999.99,
                            category: 'electronics',
                            in_stock: true,
                            created_at: new Date().toISOString()
                        },
                        {
                            idx: 'product_2',
                            name: 'Mouse',
                            price: 29.99,
                            category: 'electronics',
                            in_stock: true,
                            created_at: new Date().toISOString()
                        }
                    ]
                };
            }
            const entityNames = Object.keys(fileObject);
            for (const entityName of entityNames) {
                const entity = this.configuration.entities?.find(e => e.entity_name === entityName) || {
                    entity_name: entityName,
                    dynamic_update: false
                };
                // Add search keys if present in configuration
                if (entity.loki_search_keys && entity.loki_search_keys.length > 0) {
                    await this.addSearchKeys(entityName, entity.loki_search_keys);
                }
                const entityData = fileObject[entityName];
                if (entityData && entityData.length > 0) {
                    await this.insertDataArray(entityName, entityData);
                }
            }
            return 'ok';
        }
        catch (err) {
            console.error('File loading failed:', err);
            throw err;
        }
    }
    async stop() {
        await this.destroy();
    }
}
//# sourceMappingURL=file-handler.js.map