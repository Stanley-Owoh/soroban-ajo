import { OpenAPIV3 } from 'openapi-types';

export const groupPaths: Record<string, OpenAPIV3.PathItemObject> = {
  '/api/groups': {
    get: {
      tags: ['Groups'],
      summary: 'List all groups',
      description: 'Retrieve a paginated list of all savings groups.',
      operationId: 'listGroups',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number (1-indexed)',
          schema: { type: 'integer', default: 1, minimum: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page (max 100)',
          schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
        },
      ],
      responses: {
        '200': {
          description: 'List of groups retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GroupsListResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid pagination parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
      },
    },

    post: {
      tags: ['Groups'],
      summary: 'Create a new group',
      description:
        'Create a new savings group. Phase 1 returns unsigned XDR for wallet signing. Phase 2 submits signed XDR.',
      operationId: 'createGroup',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateGroupRequest' },
            examples: {
              phase1: {
                summary: 'Phase 1: Initial creation',
                value: {
                  name: 'Monthly Savings Circle',
                  description: 'Save together, grow together',
                  contributionAmount: '500',
                  frequency: 'monthly',
                  maxMembers: 10,
                  adminPublicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                },
              },
              phase2: {
                summary: 'Phase 2: Signed submission',
                value: {
                  name: 'Monthly Savings Circle',
                  description: 'Save together, grow together',
                  contributionAmount: '500',
                  frequency: 'monthly',
                  maxMembers: 10,
                  adminPublicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                  signedXdr: 'AAAAAgAAAABIW6...',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Phase 1: Unsigned XDR returned for wallet signing',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      unsignedXdr: { type: 'string', description: 'Unsigned transaction XDR' },
                    },
                  },
                },
              },
            },
          },
        },
        '201': {
          description: 'Phase 2: Group created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GroupResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid group data',
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

  '/api/groups/{id}': {
    get: {
      tags: ['Groups'],
      summary: 'Get group details',
      description: 'Retrieve detailed information about a specific group.',
      operationId: 'getGroup',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Group ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Group details retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GroupResponse' },
            },
          },
        },
        '404': {
          description: 'Group not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },
  },

  '/api/groups/{id}/join': {
    post: {
      tags: ['Groups'],
      summary: 'Join a group',
      description: 'Join an existing savings group as a member.',
      operationId: 'joinGroup',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Group ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JoinGroupRequest' },
            examples: {
              phase1: {
                summary: 'Phase 1: Initial join request',
                value: {
                  publicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                },
              },
              phase2: {
                summary: 'Phase 2: Signed submission',
                value: {
                  publicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                  signedXdr: 'AAAAAgAAAABIW6...',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Successfully joined group',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/GroupMember' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid request or group full',
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
        '404': {
          description: 'Group not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
        '409': {
          description: 'User already member of group',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConflictError' },
            },
          },
        },
      },
    },
  },

  '/api/groups/{id}/contribute': {
    post: {
      tags: ['Groups'],
      summary: 'Make a contribution',
      description: 'Contribute funds to a group.',
      operationId: 'contributeToGroup',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Group ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ContributionRequest' },
            examples: {
              phase1: {
                summary: 'Phase 1: Initial contribution',
                value: {
                  amount: '500',
                  publicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                },
              },
              phase2: {
                summary: 'Phase 2: Signed submission',
                value: {
                  amount: '500',
                  publicKey: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
                  signedXdr: 'AAAAAgAAAABIW6...',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Contribution recorded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Contribution' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid contribution amount',
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
        '404': {
          description: 'Group or member not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },
  },

  '/api/groups/{id}/members': {
    get: {
      tags: ['Groups'],
      summary: 'List group members',
      description: 'Retrieve all members of a specific group.',
      operationId: 'getGroupMembers',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Group ID',
          schema: { type: 'string' },
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: { type: 'integer', default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: { type: 'integer', default: 20, maximum: 100 },
        },
      ],
      responses: {
        '200': {
          description: 'Group members retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/GroupMember' },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        '404': {
          description: 'Group not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },
  },
};
