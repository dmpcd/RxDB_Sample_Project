# RxDB Sample Project

This project is a Node.js app that demonstrates how to use RxDB for in-memory data storage and querying, with handlers for both simulated database and file-based data. It’s modular, uses schemas for structure, and is ready for further extension or integration.
## Features

- **AbstractRefdataHandler**: Base class providing CRUD operations similar to LokiJS implementation
- **DBHandler**: Loads data from external sources (simulating MongoDB) into RxDB collections
- **FileHandler**: Loads data from JSON files into RxDB collections
- **Schema Management**: Proper schema definitions for data consistency
- **Indexing**: Automatic index creation for fast queries
- **In-Memory Storage**: Fast in-memory operations with RxDB

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the sample:
   ```
   npm start
   ```

## Key Differences from LokiJS

1. **Schemas Required**: RxDB requires schema definitions for each collection
2. **Async Operations**: All RxDB operations are asynchronous
3. **Better Query API**: More powerful and flexible query capabilities
4. **Active Maintenance**: RxDB is actively developed and maintained

## Migration Notes

- Replace `new Loki()` with `createRxDatabase()`
- Define schemas for all collections
- Convert synchronous operations to async/await
- Use RxDB's query selector syntax instead of direct object filters
- Replace `ensureIndex()` with schema-defined indexes
