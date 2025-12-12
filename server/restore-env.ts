
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '.env');
const content = `DATABASE_URL=postgresql://postgres:botvecna@localhost:5432/mh26_services
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev-access-secret-min-32-characters-long-for-security-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters-long-for-security-change-in-production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mh26services@gmail.com
SMTP_PASS=cjio nqqs lwtz sivl
SMTP_FROM=mh26services@gmail.com
CLIENT_URL=http://localhost:5173
`;

fs.writeFileSync(envPath, content, { encoding: 'utf8' });
console.log('✅ .env restored successfully');
