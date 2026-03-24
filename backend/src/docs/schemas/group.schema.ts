import { OpenAPIV3 } from 'openapi-types';

export const groupSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  Group: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'group_1234567890',
        description: 'Unique group identifier',
      },
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        example: 'Monthly Savings Circle',
        description: 'Group name',
      },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Save together, grow together',
        description: 'Group description',
      },
      contributionAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '500',
        description: 'Required contribution amount per cycle',
      },
      frequency: {
        type: 'string',
        enum: ['daily', 'weekly', 'monthly'],
        example: 'monthly',
        description: 'Contribution frequency',
      },
      maxMembers: {
        type: 'integer',
        minimum: 2,
        maximum: 100,
        example: 10,
        description: 'Maximum group members',
      },
      currentMembers: {
        type: 'integer',
        minimum: 0,
        example: 5,
        description: 'Current number of members',
      },
      status: {
        type: 'string',
        enum: ['active', 'completed', 'cancelled'],
        example: 'active',
        description: 'Group status',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
        description: 'Group creation timestamp',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-03-20T14:45:00Z',
        description: 'Last update timestamp',
      },
      adminPublicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Group creator/admin public key',
      },
    },
    required: ['id', 'name', 'contributionAmount', 'frequency', 'maxMembers', 'status'],
  },

  CreateGroupRequest: {
    type: 'object',
    required: ['name', 'contributionAmount', 'frequency', 'maxMembers', 'adminPublicKey'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        example: 'Monthly Savings Circle',
        description: 'Group name',
      },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Save together, grow together',
        description: 'Group description',
      },
      contributionAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '500',
        description: 'Required contribution amount per cycle',
      },
      frequency: {
        type: 'string',
        enum: ['daily', 'weekly', 'monthly'],
        example: 'monthly',
        description: 'Contribution frequency',
      },
      maxMembers: {
        type: 'integer',
        minimum: 2,
        maximum: 100,
        example: 10,
        description: 'Maximum group members',
      },
      adminPublicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Group creator public key',
      },
      signedXdr: {
        type: 'string',
        description: 'Signed transaction XDR (phase 2 submission)',
      },
    },
  },

  JoinGroupRequest: {
    type: 'object',
    required: ['publicKey'],
    properties: {
      publicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Member public key',
      },
      signedXdr: {
        type: 'string',
        description: 'Signed transaction XDR (phase 2 submission)',
      },
    },
  },

  ContributionRequest: {
    type: 'object',
    required: ['amount', 'publicKey'],
    properties: {
      amount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '500',
        description: 'Contribution amount',
      },
      publicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Contributing member public key',
      },
      signedXdr: {
        type: 'string',
        description: 'Signed transaction XDR (phase 2 submission)',
      },
    },
  },

  GroupMember: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'member_1234567890',
        description: 'Member record ID',
      },
      groupId: {
        type: 'string',
        example: 'group_1234567890',
        description: 'Group ID',
      },
      publicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Member public key',
      },
      joinedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-02-01T08:00:00Z',
        description: 'Join timestamp',
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'suspended'],
        example: 'active',
        description: 'Member status',
      },
    },
  },

  Contribution: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'contrib_1234567890',
        description: 'Contribution record ID',
      },
      groupId: {
        type: 'string',
        example: 'group_1234567890',
        description: 'Group ID',
      },
      publicKey: {
        type: 'string',
        pattern: '^G[A-Z0-9]{55}$',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Contributing member public key',
      },
      amount: {
        type: 'string',
        example: '500',
        description: 'Contribution amount',
      },
      round: {
        type: 'integer',
        example: 1,
        description: 'Contribution round/cycle',
      },
      txHash: {
        type: 'string',
        example: '0x1234567890abcdef',
        description: 'Blockchain transaction hash',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-02-15T10:30:00Z',
        description: 'Contribution timestamp',
      },
    },
  },

  GroupsListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Group' },
      },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 150 },
          pages: { type: 'integer', example: 8 },
        },
      },
    },
  },

  GroupResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: { $ref: '#/components/schemas/Group' },
    },
  },
};
