# Ajo API Documentation

Welcome to the Ajo API documentation. This directory contains comprehensive guides for using and maintaining the Ajo API.

## 📚 Documentation Files

### [API.md](./API.md)
**Comprehensive API Reference Guide**

Complete documentation of all API endpoints including:
- Authentication and token management
- Group management endpoints
- Goal management endpoints
- KYC verification
- Analytics and webhooks
- Error handling and rate limiting
- Pagination and filtering
- Two-phase transaction flow
- Real-world code examples

**Best for**: Developers integrating with the API

### [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Quick Lookup Guide**

Fast reference for common tasks:
- Endpoint table
- Common request examples
- Error codes
- Rate limits
- Query parameters
- Response formats
- Webhook events
- Testing in Swagger UI

**Best for**: Quick lookups and common tasks

### [OPENAPI_SETUP.md](./OPENAPI_SETUP.md)
**Setup and Maintenance Guide**

Technical guide for documentation setup:
- Installation instructions
- Project structure overview
- How the documentation system works
- Adding new endpoints
- Documentation standards
- Testing procedures
- Best practices
- Troubleshooting

**Best for**: Developers maintaining the API documentation

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install openapi-types
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Documentation

| Resource | URL |
|----------|-----|
| **Interactive Swagger UI** | http://localhost:3001/api-docs |
| **OpenAPI Spec (JSON)** | http://localhost:3001/api-docs.json |
| **API Info** | http://localhost:3001/api-docs/info |

## 🎯 Quick Start

### Get Authentication Token

```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2"}'
```

### Use Token in Requests

```bash
curl -X GET http://localhost:3001/api/groups \
  -H "Authorization: Bearer <your-token>"
```

### Test in Swagger UI

1. Navigate to http://localhost:3001/api-docs
2. Click "Authorize" button
3. Paste your JWT token
4. Click "Authorize"
5. Try any endpoint interactively

## 📖 Documentation Structure

```
backend/
├── docs/
│   ├── README.md                 # This file
│   ├── API.md                    # Full API reference
│   ├── QUICK_REFERENCE.md        # Quick lookup guide
│   └── OPENAPI_SETUP.md          # Setup and maintenance
└── src/
    ├── docs/
    │   ├── openapi-spec.ts       # Main OpenAPI spec
    │   ├── schemas/              # Schema definitions
    │   │   ├── error.schema.ts
    │   │   ├── auth.schema.ts
    │   │   ├── group.schema.ts
    │   │   ├── goal.schema.ts
    │   │   └── index.ts
    │   └── paths/                # Endpoint definitions
    │       ├── auth.ts
    │       ├── groups.ts
    │       ├── goals.ts
    │       └── index.ts
    └── swagger.ts                # Swagger UI setup
```

## 🔑 Key Features

### ✅ Comprehensive Documentation
- 25+ endpoints fully documented
- 30+ schemas with examples
- Request/response examples
- Clear descriptions

### ✅ Interactive Testing
- Try endpoints in Swagger UI
- Authorize with JWT token
- See live responses
- Test different scenarios

### ✅ Two-Phase Transactions
- Documented for blockchain operations
- Phase 1: Returns unsigned XDR
- Phase 2: Submits signed XDR
- Clear flow documentation

### ✅ Error Documentation
- All error codes documented
- Error response schemas
- HTTP status codes
- Error details structure

### ✅ Rate Limiting
- Rate limit information in headers
- Different limits for different endpoints
- Retry guidance

### ✅ Authentication
- JWT token generation
- Token usage in headers
- Token expiration (7 days)
- KYC verification levels

### ✅ Pagination
- Documented for list endpoints
- Page and limit parameters
- Pagination metadata
- Examples provided

### ✅ Webhook Events
- All webhook events documented
- Event payload examples
- Subscription management
- Event types and descriptions

## 📋 API Endpoints Overview

### Authentication (4 endpoints)
- `POST /api/auth/token` - Generate JWT token
- `GET /api/kyc/status` - Get KYC status
- `POST /api/kyc/request` - Request KYC verification
- `POST /api/kyc/upload` - Upload KYC document

### Groups (6 endpoints)
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create group
- `GET /api/groups/{id}` - Get group details
- `POST /api/groups/{id}/join` - Join group
- `POST /api/groups/{id}/contribute` - Make contribution
- `GET /api/groups/{id}/members` - List members

### Goals (7 endpoints)
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `GET /api/goals/{id}` - Get goal details
- `PATCH /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- `POST /api/goals/affordability` - Check affordability
- `POST /api/goals/projection` - Calculate projection

### Other (8 endpoints)
- `GET /health` - Health check
- `POST /api/analytics` - Track event
- `GET /api/analytics/stats` - Get stats
- `POST /api/email/test` - Send test email
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Register webhook
- `PATCH /api/webhooks/{id}` - Update webhook
- `DELETE /api/webhooks/{id}` - Delete webhook

## 🛠️ Common Tasks

### Adding a New Endpoint

1. Create schema in `src/docs/schemas/`
2. Create path in `src/docs/paths/`
3. Export from index files
4. Update `API.md`
5. Test in Swagger UI

See [OPENAPI_SETUP.md](./OPENAPI_SETUP.md) for detailed instructions.

### Testing an Endpoint

1. Go to http://localhost:3001/api-docs
2. Click "Authorize" and paste token
3. Find endpoint
4. Click "Try it out"
5. Fill parameters
6. Click "Execute"

### Validating OpenAPI Spec

1. Go to https://editor.swagger.io/
2. Paste spec from `/api-docs.json`
3. Check for validation errors

## 📊 Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

## ⏱️ Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 100 requests per 15 minutes |
| Auth | 5 requests per hour |
| Email | 5 requests per hour |

## 🔐 Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are valid for 7 days.

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* if paginated */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## 🔗 Webhook Events

| Event | Trigger |
|-------|---------|
| group.created | New group created |
| group.completed | Group completed payout |
| member.joined | Member joined group |
| contribution.made | Member made contribution |
| payout.executed | Payout executed |

## 🧪 Testing

### Verify Swagger UI Loads
```bash
curl http://localhost:3001/api-docs
```

### Verify OpenAPI Spec
```bash
curl http://localhost:3001/api-docs.json | jq .
```

### Test Endpoint
```bash
curl -X GET http://localhost:3001/api/groups \
  -H "Authorization: Bearer <token>"
```

## 📚 Additional Resources

- [Full API Reference](./API.md)
- [Quick Reference Guide](./QUICK_REFERENCE.md)
- [Setup and Maintenance](./OPENAPI_SETUP.md)
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md)
- [OpenAPI 3.0 Spec](http://localhost:3001/api-docs.json)
- [Swagger Editor](https://editor.swagger.io/)
- [GitHub Repository](https://github.com/Christopherdominic/soroban-ajo)

## 🆘 Support

### Documentation Issues
- Check [OPENAPI_SETUP.md](./OPENAPI_SETUP.md) troubleshooting section
- Validate spec at https://editor.swagger.io/
- Check browser console for errors

### API Issues
- Review error response details
- Check rate limit headers
- Verify authentication token
- Check request format

### General Support
- 📧 Email: support@ajo.app
- 🐛 Issues: https://github.com/Christopherdominic/soroban-ajo/issues
- 📖 GitHub: https://github.com/Christopherdominic/soroban-ajo

## 📋 Checklist for New Developers

- [ ] Read this README
- [ ] Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ ] Access Swagger UI at http://localhost:3001/api-docs
- [ ] Get authentication token
- [ ] Try a few endpoints in Swagger UI
- [ ] Read [API.md](./API.md) for detailed information
- [ ] Review [OPENAPI_SETUP.md](./OPENAPI_SETUP.md) if maintaining docs

## 🎓 Learning Path

1. **Start Here**: This README
2. **Quick Lookup**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. **Full Reference**: [API.md](./API.md)
4. **Maintenance**: [OPENAPI_SETUP.md](./OPENAPI_SETUP.md)
5. **Interactive**: Swagger UI at `/api-docs`

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | March 2024 | Initial OpenAPI 3.0 implementation |

## 📄 License

MIT License - See LICENSE file in repository root

---

**Last Updated**: March 2024
**API Version**: 1.0.0
**Documentation Version**: 1.0.0

For the latest information, visit the [GitHub repository](https://github.com/Christopherdominic/soroban-ajo).
