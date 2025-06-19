import { AbstractRefdataHandler } from './abstract-refdata-handler.js';
import { readFileSync } from 'fs';

export class FileHandler extends AbstractRefdataHandler {
  constructor(configuration, filePath, fileContent) {
    super();
    this.configuration = configuration;
    this.filePath = filePath;
    this.fileContent = fileContent;
  }

  async loadData() {
    await this.initialize();
    return new Promise(async (resolve, reject) => {
      try {
        let fileObject = this.fileContent;

        if (fileObject == null && this.filePath) {
          // Read file content
          const fileContent = readFileSync(this.filePath, 'utf8');
          fileObject = JSON.parse(fileContent);
        }

        // If no file content, create sample data
        if (!fileObject) {
          fileObject = {
            users: [
              { idx: 'user_1', username: 'john_doe', email: 'john@example.com', role: 'admin', active: true },
              { idx: 'user_2', username: 'jane_smith', email: 'jane@example.com', role: 'user', active: true }
            ],
            products: [
              { idx: 'product_1', name: 'Laptop', price: 999.99, category: 'electronics', in_stock: true },
              { idx: 'product_2', name: 'Mouse', price: 29.99, category: 'electronics', in_stock: true }
            ]
          };
        }

        const entityNames = Object.keys(fileObject);

        for (const entityName of entityNames) {
          const entity = this.configuration.entities?.find(e => e.entity_name === entityName) || {
            entity_name: entityName,
            dynamic_update: false
          };

          await this.insertDataArray(entityName, fileObject[entityName]);
        }

        resolve('ok');
      } catch (err) {
        console.error('File loading failed:', err);
        reject(err);
      }
    });
  }

  async stop() {
    await this.destroy();
  }
}
