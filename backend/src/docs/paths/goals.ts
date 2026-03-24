import { OpenAPIV3 } from 'openapi-types';

export const goalPaths: Record<string, OpenAPIV3.PathItemObject> = {
  '/api/goals': {
    get: {
      tags: ['Goals'],
      summary: 'List user goals',
      description: 'Retrieve all savings goals for the authenticated user.',
      operationId: 'listGoals',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          description: 'Filter by goal status',
          schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] },
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by goal category',
          schema: {
            type: 'string',
            enum: ['EMERGENCY', 'VACATION', 'EDUCATION', 'HOME', 'RETIREMENT', 'CUSTOM'],
          },
        },
      ],
      responses: {
        '200': {
          description: 'Goals retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoalsListResponse' },
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

    post: {
      tags: ['Goals'],
      summary: 'Create a new goal',
      description: 'Create a new savings goal for the authenticated user.',
      operationId: 'createGoal',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateGoalRequest' },
            examples: {
              emergency: {
                summary: 'Emergency fund goal',
                value: {
                  title: 'Emergency Fund',
                  description: 'Build a 6-month emergency fund',
                  targetAmount: '5000',
                  deadline: '2025-12-31T23:59:59Z',
                  category: 'EMERGENCY',
                  isPublic: false,
                },
              },
              vacation: {
                summary: 'Vacation goal',
                value: {
                  title: 'Summer Vacation',
                  description: 'Save for a beach vacation',
                  targetAmount: '2000',
                  deadline: '2025-07-01T23:59:59Z',
                  category: 'VACATION',
                  isPublic: true,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Goal created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoalResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid goal data',
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

  '/api/goals/{id}': {
    get: {
      tags: ['Goals'],
      summary: 'Get goal details',
      description: 'Retrieve detailed information about a specific goal.',
      operationId: 'getGoal',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Goal ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Goal details retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoalResponse' },
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
          description: 'Goal not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },

    patch: {
      tags: ['Goals'],
      summary: 'Update goal',
      description: 'Update an existing savings goal.',
      operationId: 'updateGoal',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Goal ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateGoalRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Goal updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoalResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid goal data',
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
          description: 'Goal not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Goals'],
      summary: 'Delete goal',
      description: 'Delete a savings goal.',
      operationId: 'deleteGoal',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Goal ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '204': {
          description: 'Goal deleted successfully',
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
          description: 'Goal not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },
  },

  '/api/goals/affordability': {
    post: {
      tags: ['Goals', 'Financial Intelligence'],
      summary: 'Check goal affordability',
      description: 'Check if a savings goal is affordable based on income and expenses.',
      operationId: 'checkAffordability',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AffordabilityCheckRequest' },
            examples: {
              default: {
                value: {
                  monthlyIncome: 5000,
                  monthlyExpenses: 3000,
                  goalTarget: 5000,
                  goalDeadline: '2025-12-31T23:59:59Z',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Affordability check completed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AffordabilityCheckResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid input data',
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

  '/api/goals/projection': {
    post: {
      tags: ['Goals', 'Financial Intelligence'],
      summary: 'Calculate savings projection',
      description: 'Project future savings based on current amount and monthly contributions.',
      operationId: 'calculateProjection',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectionRequest' },
            examples: {
              default: {
                value: {
                  currentAmount: 1200,
                  monthlyContribution: 500,
                  months: 12,
                  interestRate: 0.05,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Projection calculated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProjectionResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid input data',
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
