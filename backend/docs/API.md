# Ajo API Documentation

## Overview

Ajo is a decentralized savings group platform built on Stellar/Soroban. This document provides comprehensive information about the API endpoints, authentication, and usage patterns.

## Quick Start

### 1. Get Authentication Token

```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3D5NZ2BTZLP4FDST7G2JWFBH2"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Use Token in Requests

Include the token in the `Authorization` header:

```bash
curl -X GET http://localhost:3001/api/groups \
  -H "Authorization: Bearer <your-token>"
```

## API Endpoints

### Authentication

#### Generate Token
- **POST** `/api/auth/token`
- **Description**: Generate a JWT token using a Stellar public key
- **Body**: `{ "publicKey": "G..." }`
- **Response**: `{ "token": "..." }`
- **Rate Limit**: 5 requests/hour

#### Get KYC Status
- **GET** `/api/kyc/status`
- **Auth**: Required
- **Description**: Get KYC verification status
- **Response**: KYC status object

#### Request KYC Verification
- **POST** `/api/kyc/request`
- **Auth**: Required
- **Description**: Initiate KYC verification

#### Upload KYC Document
- **POST** `/api/kyc/upload`
- **Auth**: Required
- **Body**: `{ "docType": "PASSPORT", "data": "base64..." }`
- **Description**: Upload identification document

### Groups

#### List Groups
- **GET** `/api/groups?page=1&limit=20`
- **Description**: Get paginated list of all groups
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20, max: 100)

#### Get Group Details
- **GET** `/api/groups/{id}`
- **Description**: Get detailed information about a group

#### Create Group
- **POST** `/api/groups`
- **Auth**: Required
- **Description**: Create a new savings group
- **Two-Phase Process**:
  - Phase 1: Returns unsigned XDR for wallet signing
  - Phase 2: Submit signed XDR to confirm on-chain

**Phase 1 Request**:
```json
{
  "name": "Monthly Savings Circle",
  "description": "Save together, grow together",
  "contributionAmount": "500",
  "frequency": "monthly",
  "maxMembers": 10,
  "adminPublicKey": "G..."
}
```

**Phase 1 Response**:
```json
{
  "success": true,
  "data": {
    "unsignedXdr": "AAAAAgAAAABIW6..."
  }
}
```

**Phase 2 Request** (after wallet signing):
```json
{
  "name": "Monthly Savings Circle",
  "description": "Save together, grow together",
  "contributionAmount": "500",
  "frequency": "monthly",
  "maxMembers": 10,
  "adminPublicKey": "G...",
  "signedXdr": "AAAAAgAAAABIW6..."
}
```

#### Join Group
- **POST** `/api/groups/{id}/join`
- **Auth**: Required
- **Description**: Join an existing group
- **Two-Phase Process**: Same as group creation

#### Make Contribution
- **POST** `/api/groups/{id}/contribute`
- **Auth**: Required
- **Description**: Contribute funds to a group
- **Two-Phase Process**: Same as group creation

#### List Group Members
- **GET** `/api/groups/{id}/members?page=1&limit=20`
- **Description**: Get all members of a group

### Goals

#### List Goals
- **GET** `/api/goals`
- **Auth**: Required
- **Query Parameters**:
  - `status`: Filter by status (ACTIVE, COMPLETED, ARCHIVED)
  - `category`: Filter by category

#### Create Goal
- **POST** `/api/goals`
- **Auth**: Required
- **Body**:
```json
{
  "title": "Emergency Fund",
  "description": "Build a 6-month emergency fund",
  "targetAmount": "5000",
  "deadline": "2025-12-31T23:59:59Z",
  "category": "EMERGENCY",
  "isPublic": false
}
```

#### Get Goal Details
- **GET** `/api/goals/{id}`
- **Auth**: Required

#### Update Goal
- **PATCH** `/api/goals/{id}`
- **Auth**: Required
- **Body**: Partial goal object with fields to update

#### Delete Goal
- **DELETE** `/api/goals/{id}`
- **Auth**: Required

#### Check Affordability
- **POST** `/api/goals/affordability`
- **Auth**: Required
- **Description**: Check if a goal is affordable
- **Body**:
```json
{
  "monthlyIncome": 5000,
  "monthlyExpenses": 3000,
  "goalTarget": 5000,
  "goalDeadline": "2025-12-31T23:59:59Z"
}
```

#### Calculate Projection
- **POST** `/api/goals/projection`
- **Auth**: Required
- **Description**: Project future savings
- **Body**:
```json
{
  "currentAmount": 1200,
  "monthlyContribution": 500,
  "months": 12,
  "interestRate": 0.05
}
```

### Analytics

#### Track Event
- **POST** `/api/analytics`
- **Auth**: Optional
- **Description**: Send analytics event
- **Body**:
```json
{
  "type": "group_created",
  "userId": "G...",
  "groupId": "group_123",
  "eventData": {}
}
```

#### Get Analytics Stats
- **GET** `/api/analytics/stats?start=...&end=...`
- **Description**: Get aggregated analytics statistics

### Email

#### Send Test Email
- **POST** `/api/email/test`
- **Description**: Send a test email
- **Body**:
```json
{
  "to": "user@example.com",
  "subject": "Test Email",
  "message": "This is a test email"
}
```
- **Rate Limit**: 5 requests/hour

### Webhooks

#### List Webhooks
- **GET** `/api/webhooks`
- **Auth**: Required
- **Description**: List all registered webhooks

#### Register Webhook
- **POST** `/api/webhooks`
- **Auth**: Required
- **Description**: Register a new webhook
- **Body**:
```json
{
  "url": "https://example.com/webhooks/ajo",
  "events": ["group.created", "contribution.made"],
  "secret": "optional-secret"
}
```

#### Update Webhook
- **PATCH** `/api/webhooks/{id}`
- **Auth**: Required

#### Delete Webhook
- **DELETE** `/api/webhooks/{id}`
- **Auth**: Required

### Health

#### Health Check
- **GET** `/health`
- **Description**: Check if API is running
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-03-20T14:45:00Z",
  "service": "ajo-backend",
  "version": "0.1.0"
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists or state conflict |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

## Rate Limiting

Rate limits are enforced per IP address:

- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per hour
- **Email Endpoints**: 5 requests per hour

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

List endpoints support pagination:

```
GET /api/groups?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Webhook Events

Subscribe to real-time events:

- `group.created`: New group created
- `group.completed`: Group completed payout
- `member.joined`: Member joined group
- `contribution.made`: Member made contribution
- `payout.executed`: Payout executed

Webhook payload example:
```json
{
  "event": "group.created",
  "timestamp": "2024-03-20T14:45:00Z",
  "data": {
    "groupId": "group_123",
    "name": "Monthly Savings Circle",
    "creator": "G...",
    "contributionAmount": "500",
    "maxMembers": 10
  }
}
```

## Two-Phase Transaction Flow

For operations that interact with the blockchain (create group, join, contribute):

1. **Phase 1**: Client sends request
   - API validates data
   - API generates unsigned XDR
   - API returns unsigned XDR to client

2. **Client Signs**: User signs XDR with wallet

3. **Phase 2**: Client submits signed XDR
   - API submits to blockchain
   - API confirms transaction
   - API returns confirmation

## Authentication Flow

1. Get user's Stellar public key from wallet
2. Call `POST /api/auth/token` with public key
3. Receive JWT token
4. Include token in `Authorization: Bearer <token>` header for all protected requests
5. Token valid for 7 days

## Best Practices

### Security
- Always use HTTPS in production
- Store tokens securely (not in localStorage for sensitive apps)
- Validate all user input
- Use rate limiting to prevent abuse

### Performance
- Use pagination for list endpoints
- Cache responses when appropriate
- Batch requests when possible
- Use webhooks instead of polling

### Error Handling
- Always check `success` field
- Handle rate limit errors with exponential backoff
- Log errors for debugging
- Provide user-friendly error messages

## Examples

### Create a Group and Join

```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"G..."}' | jq -r '.token')

# 2. Create group (Phase 1)
RESPONSE=$(curl -s -X POST http://localhost:3001/api/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Savings",
    "contributionAmount": "500",
    "frequency": "monthly",
    "maxMembers": 10,
    "adminPublicKey": "G..."
  }')

UNSIGNED_XDR=$(echo $RESPONSE | jq -r '.data.unsignedXdr')

# 3. Sign XDR with wallet (done in frontend)
# SIGNED_XDR = wallet.sign(UNSIGNED_XDR)

# 4. Create group (Phase 2)
curl -X POST http://localhost:3001/api/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Monthly Savings\",
    \"contributionAmount\": \"500\",
    \"frequency\": \"monthly\",
    \"maxMembers\": 10,
    \"adminPublicKey\": \"G...\",
    \"signedXdr\": \"$SIGNED_XDR\"
  }"
```

### Create and Track a Goal

```bash
# Create goal
curl -X POST http://localhost:3001/api/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Fund",
    "targetAmount": "5000",
    "deadline": "2025-12-31T23:59:59Z",
    "category": "EMERGENCY"
  }'

# Check affordability
curl -X POST http://localhost:3001/api/goals/affordability \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 5000,
    "monthlyExpenses": 3000,
    "goalTarget": 5000,
    "goalDeadline": "2025-12-31T23:59:59Z"
  }'

# Calculate projection
curl -X POST http://localhost:3001/api/goals/projection \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 1200,
    "monthlyContribution": 500,
    "months": 12,
    "interestRate": 0.05
  }'
```

## Interactive Documentation

Access the interactive Swagger UI at:
- **Development**: http://localhost:3001/api-docs
- **Production**: https://api.ajo.app/api-docs

The Swagger UI allows you to:
- Browse all endpoints
- View request/response schemas
- Try endpoints interactively
- See live examples

## Support

For issues or questions:
- 📖 GitHub: https://github.com/Christopherdominic/soroban-ajo
- 📧 Email: support@ajo.app
- 🐛 Issues: https://github.com/Christopherdominic/soroban-ajo/issues
