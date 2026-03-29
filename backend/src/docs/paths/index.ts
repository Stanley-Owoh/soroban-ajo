import { OpenAPIV3 } from 'openapi-types';
import { authPaths } from './auth';
import { groupPaths } from './groups';
import { goalPaths } from './goals';

export const allPaths: OpenAPIV3.PathsObject = {
  ...authPaths,
  ...groupPaths,
  ...goalPaths,

  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Check if the API is running and healthy.',
      operationId: 'healthCheck',
      responses: {
        '200': {
          description: 'Service is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  timestamp: { type: 'string', format: 'date-time' },
                  service: { type: 'string', example: 'ajo-backend' },
                  version: { type: 'string', example: '0.1.0' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/analytics': {
    post: {
      tags: ['Analytics'],
      summary: 'Track analytics event',
      description: 'Send analytics event from frontend for tracking and insights.',
      operationId: 'trackEvent',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['type'],
              properties: {
                type: {
                  type: 'string',
                  example: 'group_created',
                  description: 'Event type',
                },
                userId: {
                  type: 'string',
                  description: 'User ID (optional)',
                },
                groupId: {
                  type: 'string',
                  description: 'Group ID (optional)',
                },
                eventData: {
                  type: 'object',
                  description: 'Additional event data',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Event tracked successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid event data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
      },
    },

    get: {
      tags: ['Analytics'],
      summary: 'Get analytics stats',
      description: 'Retrieve aggregated analytics statistics.',
      operationId: 'getAnalyticsStats',
      parameters: [
        {
          name: 'start',
          in: 'query',
          description: 'Start date (ISO 8601)',
          schema: { type: 'string', format: 'date-time' },
        },
        {
          name: 'end',
          in: 'query',
          description: 'End date (ISO 8601)',
          schema: { type: 'string', format: 'date-time' },
        },
      ],
      responses: {
        '200': {
          description: 'Analytics stats retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      totalUsers: { type: 'integer' },
                      totalGroups: { type: 'integer' },
                      totalContributions: { type: 'string' },
                      activeUsers: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/email/test': {
    post: {
      tags: ['Email'],
      summary: 'Send test email',
      description: 'Send a test email to verify email service is working.',
      operationId: 'sendTestEmail',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['to', 'subject', 'message'],
              properties: {
                to: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                  description: 'Recipient email address',
                },
                subject: {
                  type: 'string',
                  example: 'Test Email',
                  description: 'Email subject',
                },
                message: {
                  type: 'string',
                  example: 'This is a test email',
                  description: 'Email message body',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Email queued successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Email queued' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid email data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        '429': {
          description: 'Too many email requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RateLimitError' },
            },
          },
        },
      },
    },
  },

  '/api/webhooks': {
    get: {
      tags: ['Webhooks'],
      summary: 'List webhooks',
      description: 'List all registered webhook endpoints.',
      operationId: 'listWebhooks',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Webhooks retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        url: { type: 'string', format: 'uri' },
                        events: { type: 'array', items: { type: 'string' } },
                        active: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
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

    post: {
      tags: ['Webhooks'],
      summary: 'Register webhook',
      description: 'Register a new webhook endpoint for event notifications.',
      operationId: 'registerWebhook',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['url', 'events'],
              properties: {
                url: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://example.com/webhooks/ajo',
                  description: 'Webhook endpoint URL',
                },
                events: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: [
                      'group.created',
                      'group.completed',
                      'member.joined',
                      'contribution.made',
                      'payout.executed',
                      'payout.completed',
                    ],
                  },
                  example: ['group.created', 'contribution.made'],
                  description: 'Events to subscribe to',
                },
                secret: {
                  type: 'string',
                  description: 'Optional webhook secret for HMAC verification',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Webhook registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      url: { type: 'string' },
                      events: { type: 'array', items: { type: 'string' } },
                      active: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid webhook data',
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

  '/api/webhooks/{id}': {
    patch: {
      tags: ['Webhooks'],
      summary: 'Update webhook',
      description: 'Update an existing webhook endpoint.',
      operationId: 'updateWebhook',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Webhook ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                url: { type: 'string', format: 'uri' },
                events: { type: 'array', items: { type: 'string' } },
                active: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Webhook updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      url: { type: 'string' },
                      events: { type: 'array', items: { type: 'string' } },
                      active: { type: 'boolean' },
                    },
                  },
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
        '404': {
          description: 'Webhook not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Webhooks'],
      summary: 'Delete webhook',
      description: 'Delete a webhook endpoint.',
      operationId: 'deleteWebhook',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Webhook ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '204': {
          description: 'Webhook deleted successfully',
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
          description: 'Webhook not found',
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
