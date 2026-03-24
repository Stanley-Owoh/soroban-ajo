import { OpenAPIV3 } from 'openapi-types';

export const authSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  TokenRequest: {
    type: 'object',
    required: ['publicKey'],
    properties: {
      publicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Stellar public key (56 characters, starts with G)',
      },
    },
  },

  TokenResponse: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT token valid for 7 days',
      },
    },
  },

  AuthContext: {
    type: 'object',
    properties: {
      publicKey: {
        type: 'string',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Authenticated user public key',
      },
      walletAddress: {
        type: 'string',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Wallet address (same as publicKey)',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com',
        description: 'User email if available',
      },
      kycLevel: {
        type: 'integer',
        minimum: 0,
        maximum: 3,
        example: 1,
        description: 'KYC verification level (0=none, 1=basic, 2=intermediate, 3=full)',
      },
      isAdmin: {
        type: 'boolean',
        example: false,
        description: 'Whether user has admin privileges',
      },
    },
  },

  KYCStatus: {
    type: 'object',
    properties: {
      level: {
        type: 'integer',
        minimum: 0,
        maximum: 3,
        example: 1,
        description: 'Current KYC level',
      },
      verified: {
        type: 'boolean',
        example: true,
        description: 'Whether KYC is verified',
      },
      expiresAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-31T23:59:59Z',
        description: 'KYC expiration date',
      },
      metadata: {
        type: 'object',
        description: 'Additional KYC metadata',
      },
    },
  },

  KYCVerificationRequest: {
    type: 'object',
    required: ['docType', 'data'],
    properties: {
      docType: {
        type: 'string',
        enum: ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE'],
        example: 'PASSPORT',
        description: 'Type of identification document',
      },
      data: {
        type: 'string',
        format: 'base64',
        example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        description: 'Base64-encoded document image',
      },
    },
  },
};
