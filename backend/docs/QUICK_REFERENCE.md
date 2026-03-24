# Ajo API - Quick Reference Guide

## Access Documentation

| Resource | URL |
|----------|-----|
| Interactive Swagger UI | http://localhost:3001/api-docs |
| OpenAPI Spec (JSON) | http://localhost:3001/api-docs.json |
| API Info | http://localhost:3001/api-docs/info |
| Full API Guide | `backend/docs/API.md` |
| Setup Guide | `backend/docs/OPENAPI_SETUP.md` |

## Authentication

### Get Token
```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"G..."}'
```

### Use Token
```bash
curl -X GET http://localhost:3001/api/groups \
  -H "Authorization: Bearer <token>"
```

## Core Endpoints

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | List all groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/{id}` | Get group details |
| POST | `/api/groups/{id}/join` | Join group |
| POST | `/api/groups/{id}/contribute` | Make contribution |
| GET | `/api/groups/{id}/members` | List members |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| GET | `/api/goals/{id}` | Get goal details |
| PATCH | `/api/goals/{id}` | Update goal |
| DELETE | `/api/goals/{id}` | Delete goal |
| POST | `/api/goals/affordability` | Check affordability |
| POST | `/api/goals/projection` | Calculate projection |

### KYC
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kyc/status` | Get KYC status |
| POST | `/api/kyc/request` | Request verification |
| POST | `/api/kyc/upload` | Upload document |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks` | List webhooks |
| POST | `/api/webhooks` | Register webhook |
| PATCH | `/api/webhooks/{id}` | Update webhook |
| DELETE | `/api/webhooks/{id}` | Delete webhook |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/analytics` | Track event |
| GET | `/api/analytics/stats` | Get stats |
| POST | `/api/email/test` | Send test email |

## Common Requests

### Create Group (Phase 1)
```bash
curl -X POST http://localhost:3001/api/groups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Savings",
    "contributionAmount": "500",
    "frequency": "monthly",
    "maxMembers": 10,
    "adminPublicKey": "G..."
  }'
```

### Create Group (Phase 2)
```bash
curl -X POST http://localhost:3001/api/groups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Savings",
    "contributionAmount": "500",
    "frequency": "monthly",
    "maxMembers": 10,
    "adminPublicKey": "G...",
    "signedXdr": "<signed-xdr>"
  }'
```

### Create Goal
```bash
curl -X POST http://localhost:3001/api/goals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Fund",
    "targetAmount": "5000",
    "deadline": "2025-12-31T23:59:59Z",
    "category": "EMERGENCY"
  }'
```

### Check Affordability
```bash
curl -X POST http://localhost:3001/api/goals/affordability \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 5000,
    "monthlyExpenses": 3000,
    "goalTarget": 5000,
    "goalDeadline": "2025-12-31T23:59:59Z"
  }'
```

### Register Webhook
```bash
curl -X POST http://localhost:3001/api/webhooks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhooks/ajo",
    "events": ["group.created", "contribution.made"]
  }'
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 100 req/15 min |
| Auth | 5 req/hour |
| Email | 5 req/hour |

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Filtering
- `status`: Filter by status
- `category`: Filter by category

## Response Format

### Success
```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* if paginated */ }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Webhook Events

| Event | Trigger |
|-------|---------|
| group.created | New group created |
| group.completed | Group completed payout |
| member.joined | Member joined group |
| contribution.made | Member made contribution |
| payout.executed | Payout executed |

## Goal Categories

- EMERGENCY
- VACATION
- EDUCATION
- HOME
- RETIREMENT
- CUSTOM

## Goal Status

- ACTIVE
- COMPLETED
- ARCHIVED

## Group Frequency

- daily
- weekly
- monthly

## KYC Levels

- 0: None
- 1: Basic
- 2: Intermediate
- 3: Full

## Document Types

- PASSPORT
- NATIONAL_ID
- DRIVERS_LICENSE

## Testing in Swagger UI

1. Go to http://localhost:3001/api-docs
2. Click "Authorize" button
3. Paste JWT token
4. Click "Authorize"
5. Find endpoint
6. Click "Try it out"
7. Fill parameters
8. Click "Execute"
9. View response

## Useful Links

- [Full API Documentation](./API.md)
- [Setup Guide](./OPENAPI_SETUP.md)
- [OpenAPI Specification](http://localhost:3001/api-docs.json)
- [GitHub Repository](https://github.com/Christopherdominic/soroban-ajo)
- [Swagger Editor](https://editor.swagger.io/)

## Common Issues

### Token Expired
- Get new token: `POST /api/auth/token`
- Tokens valid for 7 days

### Rate Limited
- Wait for window to reset
- Check `X-RateLimit-Reset` header

### Validation Error
- Check request body format
- Verify required fields
- Check field types and constraints

### Not Found
- Verify resource ID
- Check resource exists
- Verify correct endpoint

## Development

### Start Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```

## File Locations

| File | Purpose |
|------|---------|
| `src/docs/openapi-spec.ts` | Main OpenAPI spec |
| `src/docs/schemas/` | Schema definitions |
| `src/docs/paths/` | Endpoint definitions |
| `src/swagger.ts` | Swagger UI setup |
| `docs/API.md` | Full API guide |
| `docs/OPENAPI_SETUP.md` | Setup guide |

## Support

- 📖 Documentation: [GitHub](https://github.com/Christopherdominic/soroban-ajo)
- 📧 Email: support@ajo.app
- 🐛 Issues: [GitHub Issues](https://github.com/Christopherdominic/soroban-ajo/issues)

---

**Last Updated**: March 2024
**API Version**: 1.0.0
