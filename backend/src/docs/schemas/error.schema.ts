import { OpenAPIV3 } from 'openapi-types';

export const errorSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  Error: {
    type: 'object',
    required: ['success', 'error', 'code'],
    properties: {
      success: {
        type: 'boolean',
        example: false,
        description: 'Operation success status',
      },
      error: {
        type: 'string',
        example: 'Validation failed',
        description: 'Human-readable error message',
      },
      code: {
        type: 'string',
        example: 'VALIDATION_ERROR',
        description: 'Machine-readable error code',
      },
      details: {
        type: 'array',
        description: 'Additional error details',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },

  ValidationError: {
    allOf: [
      { $ref: '#/components/schemas/Error' },
      {
        type: 'object',
        properties: {
          code: { example: 'VALIDATION_ERROR' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'name' },
                message: { type: 'string', example: 'Name is required' },
              },
            },
          },
        },
      },
    ],
  },

  NotFoundError: {
    allOf: [
      { $ref: '#/components/schemas/Error' },
      {
        type: 'object',
        properties: {
          code: { example: 'NOT_FOUND' },
          error: { example: 'Group not found' },
        },
      },
    ],
  },

  UnauthorizedError: {
    allOf: [
      { $ref: '#/components/schemas/Error' },
      {
        type: 'object',
        properties: {
          code: { example: 'UNAUTHORIZED' },
          error: { example: 'No token provided' },
        },
      },
    ],
  },

  RateLimitError: {
    allOf: [
      { $ref: '#/components/schemas/Error' },
      {
        type: 'object',
        properties: {
          code: { example: 'RATE_LIMIT_EXCEEDED' },
          error: { example: 'Too many requests' },
          details: {
            type: 'object',
            properties: {
              retryAfter: { type: 'number', example: 3600 },
            },
          },
        },
      },
    ],
  },

  ConflictError: {
    allOf: [
      { $ref: '#/components/schemas/Error' },
      {
        type: 'object',
        properties: {
          code: { example: 'CONFLICT' },
          error: { example: 'User already member of group' },
        },
      },
    ],
  },
};
