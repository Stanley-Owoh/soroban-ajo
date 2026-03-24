import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response } from 'express';
import { openApiSpec } from './docs/openapi-spec';

export const setupSwagger = (app: Express): void => {
  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { font-size: 2em; margin: 20px 0; }
        .swagger-ui .scheme-container { background: #fafafa; }
        .swagger-ui .btn { border-radius: 4px; }
      `,
      customSiteTitle: 'Ajo API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true,
        filter: true,
        showExtensions: true,
        deepLinking: true,
      },
    })
  );

  // Serve OpenAPI spec as JSON
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openApiSpec);
  });

  // API documentation info endpoint
  app.get('/api-docs/info', (_req: Request, res: Response) => {
    res.json({
      title: 'Ajo API Documentation',
      version: '1.0.0',
      description: 'Decentralized Savings Groups API',
      endpoints: {
        interactive: '/api-docs',
        openapi: '/api-docs.json',
      },
      resources: {
        github: 'https://github.com/Christopherdominic/soroban-ajo',
        support: 'support@ajo.app',
      },
    });
  });
};
