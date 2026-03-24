import { OpenAPIV3 } from 'openapi-types';
import { errorSchemas } from './error.schema';
import { authSchemas } from './auth.schema';
import { groupSchemas } from './group.schema';
import { goalSchemas } from './goal.schema';

export const allSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ...errorSchemas,
  ...authSchemas,
  ...groupSchemas,
  ...goalSchemas,
};
