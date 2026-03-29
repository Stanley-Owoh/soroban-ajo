# Soroban Ajo - Monorepo Structure

This project uses **Turborepo** to manage a monorepo structure with shared packages and independent applications.

## 📦 Packages

### `packages/shared`
Shared types, schemas, and utilities used across all packages.

**Exports:**
- Common types (Group, User, Transaction, etc.)
- Zod validation schemas
- Utility functions (formatting, retry logic, etc.)

**Usage:**
```typescript
import { Group, GroupCreateSchema, formatCurrency } from '@soroban-ajo/shared'
```

### `packages/frontend`
Next.js web application for the Ajo platform.

**Features:**
- User interface for group management
- Wallet integration
- Real-time updates
- Responsive design

### `packages/backend`
Express.js API server with Soroban integration.

**Features:**
- RESTful API endpoints
- Blockchain interaction
- Database management
- Authentication & authorization

### `packages/contracts`
Soroban smart contracts (Rust).

**Features:**
- Group management contracts
- Token handling
- Dispute resolution

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Rust 1.70+
- Stellar CLI

### Installation

```bash
# Install dependencies for all packages
npm install

# Or use Turborepo directly
npx turbo install
```

### Development

```bash
# Run all dev servers
npm run dev

# Or run specific package
npm run dev --filter=@soroban-ajo/frontend
npm run dev --filter=@soroban-ajo/backend

# Run in watch mode
npm run dev:watch
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build --filter=@soroban-ajo/shared
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests for specific package
npm run test --filter=@soroban-ajo/backend
```

### Linting & Type Checking

```bash
# Lint all packages
npm run lint

# Type check all packages
npm run type-check

# Format code
npm run format
```

## 📁 Directory Structure

```
soroban-ajo/
├── packages/
│   ├── shared/              # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types.ts     # Common types
│   │   │   ├── schemas.ts   # Zod schemas
│   │   │   ├── utils.ts     # Utility functions
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/            # Next.js application
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── backend/             # Express API server
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── contracts/           # Soroban contracts
│       ├── src/
│       ├── Cargo.toml
│       └── tests/
├── turbo.json               # Turborepo configuration
├── package.json             # Root package.json
└── README.md
```

## 🔄 Turborepo Pipeline

The `turbo.json` file defines the build pipeline:

- **build**: Builds all packages with caching
- **dev**: Runs development servers (no caching)
- **lint**: Lints all packages
- **type-check**: Type checks all packages
- **test**: Runs tests with caching
- **clean**: Cleans build artifacts

## 📚 Shared Package Usage

### In Frontend

```typescript
import { Group, formatCurrency } from '@soroban-ajo/shared'

const displayAmount = formatCurrency(group.contributionAmount)
```

### In Backend

```typescript
import { GroupCreateSchema, Group } from '@soroban-ajo/shared'

const validated = GroupCreateSchema.parse(req.body)
const group: Group = await groupService.create(validated)
```

## 🔗 Dependencies

### Shared Package
- `zod`: Schema validation

### Frontend
- `next`: React framework
- `react`: UI library
- `@soroban-ajo/shared`: Shared types

### Backend
- `express`: Web framework
- `typescript`: Type safety
- `@soroban-ajo/shared`: Shared types

## 🚢 Deployment

Each package can be deployed independently:

- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Backend**: Deploy to Railway, Render, or similar
- **Contracts**: Deploy to Stellar testnet/mainnet

## 📖 Documentation

- [Frontend README](packages/frontend/README.md)
- [Backend README](packages/backend/README.md)
- [Shared Package README](packages/shared/README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make changes in relevant packages
3. Run tests and linting
4. Submit a pull request

## 📄 License

See LICENSE file for details.
