import { OpenAPIV3 } from 'openapi-types';

export const goalSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  Goal: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'goal_1234567890',
        description: 'Unique goal identifier',
      },
      userId: {
        type: 'string',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Goal owner public key',
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        example: 'Emergency Fund',
        description: 'Goal title',
      },
      description: {
        type: 'string',
        maxLength: 1000,
        example: 'Build a 6-month emergency fund',
        description: 'Goal description',
      },
      targetAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '5000',
        description: 'Target amount in base currency',
      },
      currentAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '1200',
        description: 'Current saved amount',
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-31T23:59:59Z',
        description: 'Goal deadline',
      },
      category: {
        type: 'string',
        enum: ['EMERGENCY', 'VACATION', 'EDUCATION', 'HOME', 'RETIREMENT', 'CUSTOM'],
        example: 'EMERGENCY',
        description: 'Goal category',
      },
      isPublic: {
        type: 'boolean',
        example: false,
        description: 'Whether goal is visible to other users',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
        example: 'ACTIVE',
        description: 'Goal status',
      },
      progress: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        example: 24,
        description: 'Progress percentage',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z',
        description: 'Goal creation timestamp',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-03-20T14:45:00Z',
        description: 'Last update timestamp',
      },
    },
    required: ['id', 'userId', 'title', 'targetAmount', 'deadline', 'category', 'status'],
  },

  CreateGoalRequest: {
    type: 'object',
    required: ['title', 'targetAmount', 'deadline', 'category'],
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        example: 'Emergency Fund',
        description: 'Goal title',
      },
      description: {
        type: 'string',
        maxLength: 1000,
        example: 'Build a 6-month emergency fund',
        description: 'Goal description',
      },
      targetAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '5000',
        description: 'Target amount in base currency',
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-31T23:59:59Z',
        description: 'Goal deadline',
      },
      category: {
        type: 'string',
        enum: ['EMERGENCY', 'VACATION', 'EDUCATION', 'HOME', 'RETIREMENT', 'CUSTOM'],
        example: 'EMERGENCY',
        description: 'Goal category',
      },
      isPublic: {
        type: 'boolean',
        example: false,
        description: 'Whether goal is visible to other users',
      },
    },
  },

  UpdateGoalRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        example: 'Emergency Fund',
        description: 'Goal title',
      },
      description: {
        type: 'string',
        maxLength: 1000,
        example: 'Build a 6-month emergency fund',
        description: 'Goal description',
      },
      targetAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '5000',
        description: 'Target amount in base currency',
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-31T23:59:59Z',
        description: 'Goal deadline',
      },
      category: {
        type: 'string',
        enum: ['EMERGENCY', 'VACATION', 'EDUCATION', 'HOME', 'RETIREMENT', 'CUSTOM'],
        example: 'EMERGENCY',
        description: 'Goal category',
      },
      isPublic: {
        type: 'boolean',
        example: false,
        description: 'Whether goal is visible to other users',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
        example: 'ACTIVE',
        description: 'Goal status',
      },
    },
  },

  GoalMember: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'member_1234567890',
        description: 'Member record ID',
      },
      goalId: {
        type: 'string',
        example: 'goal_1234567890',
        description: 'Goal ID',
      },
      userId: {
        type: 'string',
        example: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2',
        description: 'Member public key',
      },
      contributionAmount: {
        type: 'string',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
        example: '1200',
        description: 'Total contribution to goal',
      },
      joinedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-02-01T08:00:00Z',
        description: 'Join timestamp',
      },
    },
  },

  AffordabilityCheckRequest: {
    type: 'object',
    required: ['monthlyIncome', 'monthlyExpenses', 'goalTarget', 'goalDeadline'],
    properties: {
      monthlyIncome: {
        type: 'number',
        minimum: 0,
        example: 5000,
        description: 'Monthly income',
      },
      monthlyExpenses: {
        type: 'number',
        minimum: 0,
        example: 3000,
        description: 'Monthly expenses',
      },
      goalTarget: {
        type: 'number',
        minimum: 0,
        example: 5000,
        description: 'Goal target amount',
      },
      goalDeadline: {
        type: 'string',
        format: 'date-time',
        example: '2025-12-31T23:59:59Z',
        description: 'Goal deadline',
      },
    },
  },

  AffordabilityCheckResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          isAffordable: {
            type: 'boolean',
            example: true,
            description: 'Whether goal is affordable',
          },
          monthlyRequired: {
            type: 'number',
            example: 416.67,
            description: 'Monthly savings required',
          },
          availableMonthly: {
            type: 'number',
            example: 2000,
            description: 'Available monthly surplus',
          },
          monthsToGoal: {
            type: 'number',
            example: 12,
            description: 'Months until deadline',
          },
          recommendation: {
            type: 'string',
            example: 'Goal is achievable with current income',
            description: 'Affordability recommendation',
          },
        },
      },
    },
  },

  ProjectionRequest: {
    type: 'object',
    required: ['currentAmount', 'monthlyContribution', 'months'],
    properties: {
      currentAmount: {
        type: 'number',
        minimum: 0,
        example: 1200,
        description: 'Current saved amount',
      },
      monthlyContribution: {
        type: 'number',
        minimum: 0,
        example: 500,
        description: 'Monthly contribution amount',
      },
      months: {
        type: 'integer',
        minimum: 1,
        example: 12,
        description: 'Number of months to project',
      },
      interestRate: {
        type: 'number',
        minimum: 0,
        example: 0.05,
        description: 'Annual interest rate (optional)',
      },
    },
  },

  ProjectionResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          projectedAmount: {
            type: 'number',
            example: 7200,
            description: 'Projected amount after period',
          },
          totalContributed: {
            type: 'number',
            example: 6000,
            description: 'Total contributions made',
          },
          interestEarned: {
            type: 'number',
            example: 1200,
            description: 'Interest earned',
          },
          monthlyBreakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'integer' },
                balance: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },

  GoalsListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Goal' },
      },
    },
  },

  GoalResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: { $ref: '#/components/schemas/Goal' },
    },
  },
};
