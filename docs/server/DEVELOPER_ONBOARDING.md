# Developer Onboarding Guide

## Architecture Overview

### Tech Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Sessions**: Redis
- **File Storage**: AWS S3 (or S3-compatible)
- **Real-time**: Socket.io
- **Payments**: Razorpay
- **Validation**: Zod
- **Authentication**: JWT + Refresh Tokens

### Project Structure

```
server/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma   # Prisma schema definition
│   └── seed.ts         # Database seeding script
├── src/
│   ├── config/         # Configuration modules
│   │   ├── db.ts       # Prisma client
│   │   ├── redis.ts    # Redis client
│   │   ├── s3.ts       # S3 configuration
│   │   └── logger.ts   # Winston logger
│   ├── middleware/     # Express middleware
│   │   ├── auth.ts     # JWT authentication
│   │   ├── validate.ts  # Request validation
│   │   ├── errorHandler.ts
│   │   ├── rateLimit.ts
│   │   └── upload.ts
│   ├── routes/         # API route definitions
│   ├── controllers/    # Route handlers
│   ├── services/       # Business logic layer
│   ├── models/         # TypeScript types & Zod schemas
│   ├── utils/          # Utility functions
│   │   ├── jwt.ts      # JWT token management
│   │   ├── security.ts # Password, encryption
│   │   └── email.ts    # Email sending
│   ├── socket/         # Socket.io setup
│   ├── app.ts          # Express app configuration
│   └── index.ts        # Application entry point
├── tests/              # Test files
└── infra/              # Infrastructure scripts
```

## Data Flow

### Request Flow
```
Client Request
    ↓
Express App (app.ts)
    ↓
Rate Limiter (middleware/rateLimit.ts)
    ↓
CORS & Security Headers (app.ts)
    ↓
Route Handler (routes/*.ts)
    ↓
Authentication (middleware/auth.ts)
    ↓
Validation (middleware/validate.ts)
    ↓
Controller (controllers/*.ts)
    ↓
Service Layer (services/*.ts) [if needed]
    ↓
Database (Prisma)
    ↓
Response
```

### Authentication Flow
```
1. User registers/logs in
   ↓
2. Server generates:
   - Access Token (JWT, 15m expiry)
   - Refresh Token (JWT, 7d expiry, stored in DB)
   ↓
3. Client stores tokens
   ↓
4. Client sends Access Token in Authorization header
   ↓
5. Middleware validates token
   ↓
6. If expired, client uses Refresh Token to get new Access Token
   ↓
7. Refresh Token rotation (new token issued, old revoked)
```

### File Upload Flow
```
1. Client requests presigned URL
   POST /api/providers/:id/documents
   ↓
2. Server generates S3 presigned URL
   ↓
3. Client uploads directly to S3
   ↓
4. Client notifies server (optional)
   ↓
5. Server creates document record in DB
```

### Real-time Messaging Flow
```
1. Client connects to Socket.io with JWT
   ↓
2. Server validates token
   ↓
3. Client joins room: user:${userId}
   ↓
4. Client sends message via socket
   ↓
5. Server saves to database
   ↓
6. Server emits to receiver's room
   ↓
7. Receiver receives message in real-time
```

## Key Concepts

### Authentication
- **Access Tokens**: Short-lived (15m), sent in `Authorization: Bearer <token>` header
- **Refresh Tokens**: Long-lived (7d), stored in database, used to get new access tokens
- **Token Rotation**: New refresh token issued on each refresh, old one revoked
- **Force Logout**: Admin can revoke all user tokens

### Database
- **Prisma ORM**: Type-safe database access
- **Migrations**: Version-controlled schema changes
- **Seeding**: Populate database with test data
- **Indexes**: Optimized queries (see schema.prisma)

### Security
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: Redis-backed, prevents brute force
- **Input Validation**: Zod schemas for all inputs
- **XSS Protection**: Input sanitization
- **SQL Injection**: Prevented by Prisma ORM
- **Audit Logging**: All admin actions logged

### Error Handling
- **AppError**: Custom error class for operational errors
- **Error Handler**: Global middleware catches all errors
- **Structured Logging**: Winston logger for all errors

## Where to Extend

### Adding a New Endpoint

1. **Create Validation Schema** (`src/models/schemas.ts`)
```typescript
export const myEndpointSchema = z.object({
  body: z.object({
    field: z.string().min(1),
  }),
});
```

2. **Create Controller** (`src/controllers/myController.ts`)
```typescript
export const myController = {
  async myMethod(req: AuthRequest, res: Response): Promise<void> {
    // Implementation
  },
};
```

3. **Create Route** (`src/routes/myRoutes.ts`)
```typescript
const router = Router();
router.post('/', authenticate, validate(myEndpointSchema), myController.myMethod);
export default router;
```

4. **Register Route** (`src/index.ts`)
```typescript
import myRoutes from './routes/myRoutes';
app.use('/api/my', myRoutes);
```

### Adding a New Service

Create file in `src/services/myService.ts`:
```typescript
import { prisma } from '../config/db';

export const myService = {
  async doSomething(data: any) {
    // Business logic here
    return await prisma.model.create({ data });
  },
};
```

### Adding Socket Events

In `src/socket/index.ts`:
```typescript
socket.on('my:event', async (data) => {
  // Handle event
  io?.emit('my:response', result);
});
```

## Common Patterns

### Pagination
```typescript
const { page = '1', limit = '10' } = req.query;
const skip = (parseInt(page) - 1) * parseInt(limit);
const take = parseInt(limit);

const [data, total] = await Promise.all([
  prisma.model.findMany({ skip, take }),
  prisma.model.count(),
]);
```

### Filtering
```typescript
const where: any = {};
if (req.query.status) where.status = req.query.status;
if (req.query.search) {
  where.OR = [
    { name: { contains: req.query.search } },
    { description: { contains: req.query.search } },
  ];
}
```

### Audit Logging
```typescript
await prisma.auditLog.create({
  data: {
    userId: req.user!.id,
    action: 'ACTION_NAME',
    tableName: 'ModelName',
    recordId: id,
    newData: { /* changes */ },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  },
});
```

## Testing

### Running Tests
```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:watch    # Watch mode
```

### Test Structure
```typescript
describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ /* data */ });
    expect(response.status).toBe(201);
  });
});
```

## Debugging

### Logs
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Console output in development

### Database
```bash
# Open Prisma Studio
npx prisma studio

# View migrations
npx prisma migrate status
```

### Redis
```bash
# Connect to Redis CLI
redis-cli

# View keys
KEYS *

# View rate limit keys
KEYS rl:*
```

## Production Considerations

1. **Environment Variables**: Never commit `.env` file
2. **Database**: Use connection pooling
3. **Redis**: Use Redis Cluster for high availability
4. **S3**: Use CloudFront for file delivery
5. **Monitoring**: Set up Sentry, Prometheus
6. **Backups**: Regular database backups
7. **HTTPS**: Always use HTTPS in production
8. **Rate Limiting**: Adjust limits based on traffic

## Getting Help

- Check `README.md` for setup instructions
- Review `SECURITY_CHECKLIST.md` for security measures
- See `BACKEND_IMPLEMENTATION_SUMMARY.md` for implementation status
- Check Prisma docs: https://www.prisma.io/docs
- Express docs: https://expressjs.com/

---

**Welcome to the MH26 Services backend team! 🚀**

