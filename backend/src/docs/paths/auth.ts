import { OpenAPIV3 } from 'openapi-types';

export const authPaths: Record<string, OpenAPIV3.PathItemObject> = {
  '/api/auth/token': {
    post: {
      tags: ['Auth'],
      summary: 'Generate JWT token',
      description: 'Generate a JWT token using a Stellar public key. Token is valid for 7 days.',
      operationId: 'generateToken',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TokenRequest' },
            examples: {
              default: {
                value: {
                  publicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Token generated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TokenResponse' },
              examples: {
                success: {
                  value: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNLZXkiOiJHQlJQWUhJTDJDSTNXSFpEVE9PUUZDNkVCNFJSSkMzRDVOWjJCVFpMUDRGRFNUN0cySldGQkgyIiwiaWF0IjoxNzEwOTI4MDAwLCJleHAiOjE3MTE1MzI4MDB9.signature',
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid public key format',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
              examples: {
                invalidKey: {
                  value: {
                    success: false,
                    error: 'Invalid public key format',
                    code: 'VALIDATION_ERROR',
                  },
                },
              },
            },
          },
        },
        '429': {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RateLimitError' },
            },
          },
        },
      },
    },
  },

  '/api/kyc/status': {
    get: {
      tags: ['Auth', 'KYC'],
      summary: 'Get KYC verification status',
      description: 'Retrieve the current KYC verification status for the authenticated user.',
      operationId: 'getKYCStatus',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'KYC status retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  status: { $ref: '#/components/schemas/KYCStatus' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized - no token provided',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' },
            },
          },
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },
  },

  '/api/kyc/request': {
    post: {
      tags: ['Auth', 'KYC'],
      summary: 'Request KYC verification',
      description: 'Initiate KYC verification process for the authenticated user.',
      operationId: 'requestKYCVerification',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'KYC verification request submitted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Verification request submitted' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' },
            },
          },
        },
      },
    },
  },

  '/api/kyc/upload': {
    post: {
      tags: ['Auth', 'KYC'],
      summary: 'Upload KYC document',
      description: 'Upload identification document for KYC verification.',
      operationId: 'uploadKYCDocument',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/KYCVerificationRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Document uploaded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  document: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      docType: { type: 'string' },
                      uploadedAt: { type: 'string', format: 'date-time' },
                      status: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid document data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' },
            },
          },
        },
      },
    },
  },
};
