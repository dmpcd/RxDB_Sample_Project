export const entitySchema = {
    title: 'entity schema',
    version: 0,
    description: 'describes a generic entity',
    type: 'object',
    primaryKey: 'idx',
    properties: {
        idx: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string',
            maxLength: 100
        },
        category: {
            type: 'string',
            maxLength: 100
        },
        price: {
            type: 'number'
        },
        in_stock: {
            type: 'boolean'
        },
        entity_type: {
            type: 'string',
            maxLength: 100
        },
        status: {
            type: 'string',
            maxLength: 100
        },
        created_at: {
            type: 'string',
            format: 'date-time'
        },
        metadata: {
            type: 'object'
        }
    },
    required: ['idx', 'name'],
    indexes: ['name', 'category', 'entity_type', 'status']
};
export const userSchema = {
    title: 'user schema',
    version: 0,
    description: 'describes a user',
    type: 'object',
    primaryKey: 'idx',
    properties: {
        idx: {
            type: 'string',
            maxLength: 100
        },
        username: {
            type: 'string',
            maxLength: 100
        },
        email: {
            type: 'string',
            maxLength: 100
        },
        role: {
            type: 'string',
            maxLength: 100
        },
        active: {
            type: 'boolean'
        },
        created_at: {
            type: 'string',
            format: 'date-time'
        }
    },
    required: ['idx', 'username', 'email', 'role', 'active'],
    indexes: ['username', 'email', 'role', 'active']
};
//# sourceMappingURL=entity-schema.js.map