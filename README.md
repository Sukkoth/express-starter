# Express TypeScript Starter Kit

An Express.js starter template with TypeScript, featuring logging, error handling, security, and development tools.

## Features

### Core Technologies

- **TypeScript**: Full TypeScript support with configured paths aliases for clean imports
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Module Aliases**: Clean import paths (e.g., `@middlewares/`, `@routes/`, `@controllers/`, etc.)

### Security

- **Helmet**: Secures Express apps by setting various HTTP headers
- **CORS**: Cross-Origin Resource Sharing support
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing utility

### Documentation

- **Swagger/OpenAPI**: API documentation via swagger-jsdoc and swagger-ui-express
  - Available at: `/api-docs`
  - Configured to scan routes in `./src/routes/*.ts` and `./src/routes/v2/*.ts`

### Logging System

- **Winston**: Advanced logging with multiple transports

  - Log levels: error, warn, info, http, debug
  - Environment-based logging (development: debug, production: warn)
  - File logging: (only in production, but disabled, you can enable it later if DevOps team approve it)
    - `logs/error.log`: Error-level logs
    - `logs/all.log`: All logs
  - Console logging with colored output

- **Morgan**: HTTP request logging middleware
  - Integrated with Winston
  - Development-only HTTP logging

### Error Handling

The template includes a robust error handling system with predefined error codes:

#### Internal Error Codes (Server-side)

- Database related: `DB_COULD_NOT_CONNECT`, `DB_TIMEOUT`, `DB_QUERY_FAILED`, etc.
- Redis/Queue related: `REDIS_COULD_NOT_CONNECT`, `NO_QUEUE_FOUND`, etc.
- External services: `THIRD_PARTY_SERVICE_ERROR`, `NETWORK_ERROR`, `TIMEOUT_ERROR`

#### Client-safe Error Codes

- Authentication: `UNAUTHORIZED`, `UNAUTHENTICATED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`
- Validation: `VALIDATION_ERROR`
- General: `BAD_REQUEST`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `INTERNAL_SERVER_ERROR`

### Development Tools

- **ESLint**: TypeScript-aware linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit actions
  - Runs linting and tests before commits
- **lint-staged**: Runs linters on staged git files
- **Cucumber**: Testing framework

## Available Commands

```bash
# Development
pnpm run dev         # Start development server with hot-reload
pnpm run build      # Build the project
pnpm run start      # Run the built project

# Testing
pnpm test          # Run tests with coverage

# Code Quality
pnpm run lint      # Run ESLint
pnpm run format    # Run Prettier formatting

# Git Hooks
pnpm run prepare   # Install Husky hooks
```

## Project Structure

```
src/
├── controllers/    # Route controllers
├── middlewares/    # Express middlewares
├── routes/         # API routes
├── libs/          # Shared libraries
│   ├── exceptions/ # Custom exceptions
│   └── logger.ts   # Winston logger configuration
├── types/         # TypeScript type definitions
└── index.ts       # Application entry point

tests/             # Test files
logs/              # Application logs
dist/              # Compiled JavaScript files
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create `.env` file
4. Start development server:
   ```bash
   pnpm run dev
   ```

## API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## Error Handling Usage

```typescript
// Using AppException
throw new AppException({
  status: 400,
  code: ErrorCodes.BAD_REQUEST,
  message: 'Invalid input',
});

// Using ValidationException
throw new ValidationException({
  status: 400,
  code: ErrorCodes.VALIDATION_ERROR,
  message: 'Validation failed',
  violations: errors,
});
```

## Logging

The project uses Winston for logging with multiple levels:

- error: For critical errors that need immediate attention
- warn: For warnings that don't stop the application but need monitoring
- info: For general information about application state
- http: For HTTP request logging (used with Morgan)
- debug: For detailed debugging information

To use the logger in your code:

```typescript
import Logger from '@libs/logger';
import { ErrorCodes } from '@libs/exceptions/error-codes';

Logger.error('Critical error occurred', { ...error });
Logger.warn('Warning: resource running low');
Logger.info('User logged in', { userId });
Logger.http('GET /api/users');
Logger.debug('Debugging information', { details });
Logger.debug({ error: 'you can use object directly' });
Logging.error(ErrorCodes.NOT_FOUND, { ...error });
```

Log levels are environment-dependent:

- Development: Logs debug and above
- Production: Logs warn and above

Logs are written to console and files:

- `logs/error.log`: Contains error-level logs
- `logs/all.log`: Contains all logs

# Code standard

You are good enough already but we need to make some rules about typings

- You should write a better comments on your work (not everywhere but where things get messy) and use JSDocs
- Use ErrorCodes as Logging title if you know what the issue is when you throw then write the description inside the meta of the logging body.

```ts
import { ErrorCodes } from '@libs/exceptions/error-codes';
import Logger from '@libs/logger';

Logger.error(ErrorCodes.DB_COULD_NOT_CONNECT, {
  message: 'Database connection failed',
});

//so later when debugging, we can just search for the error code make it easier
//more common error codes will be added when working in the project
```

- use express-async-handler to handle async errors in controllers by wrapping the controller function with it

```ts
import asyncHandler from 'express-async-handler';

export const a2pController = asyncHandler(async (req, res) => {
  res.json({
    message: 'message queued successfully',
    id: '1234567890',
  });
});
```

Now you can throw your errors without catching them and global error handler will handle them. But incase you need to handle the thrown error, you can use try catch and make your logic

**Naming**

- Use kebab-case-for-file-names
- Use camelCase for function and variable names
- Use SCREAMING_SNAKE_CASE for constants

## Contributing

1. Ensure tests pass: `pnpm test`
2. Ensure linting passes: `pnpm run lint`
3. Format code: `pnpm run format`

The project uses Husky to run these checks before each commit.

```
pnpm run format  # Ensures Prettier formatting is correct
pnpm exec lint-staged  # Runs lint-staged on staged files
pnpm test  # Runs tests before committing
```
