import { AbstractRefdataHandler } from './abstract-refdata-handler.js';
import { readFileSync } from 'fs';

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

export class FileHandler extends AbstractRefdataHandler {
  private configuration: Configuration;
  private filePath: string | null;
  private fileContent: FileObject | null;

  constructor(configuration: Configuration, filePath: string | null, fileContent: FileObject | null) {
    super('p8_file_handler_db');
    this.configuration = configuration;
    this.filePath = filePath;
    this.fileContent = fileContent;
  }

  async loadData(): Promise<string> {
    await this.initialize();
    try {
      let fileObject: FileObject | null = this.fileContent;

      if (fileObject == null && this.filePath) {
        try {
          const fileContent = readFileSync(this.filePath, 'utf8');
          fileObject = JSON.parse(fileContent);
        } catch (err) {
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

      const entityNames: string[] = Object.keys(fileObject);

      for (const entityName of entityNames) {
        const entity: EntityConfiguration = this.configuration.entities?.find(e => e.entity_name === entityName) || {
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
    } catch (err) {
      console.error('File loading failed:', err);
      throw err;
    }
  }

  async stop(): Promise<void> {
    await this.destroy();
  }
}