# 🚀 Deployment Guide

## Prerequisites Checklist

Before deployment, ensure you have:

- [ ] PostgreSQL database set up (Supabase, Railway, or AWS RDS recommended)
- [ ] Redis instance (Upstash or Redis Cloud)
- [ ] Google OAuth credentials configured
- [ ] Google Meet API access (optional)
- [ ] Domain name (for production)
- [ ] Email service configured (Gmail SMTP or SendGrid)

## Environment Variables

Create `.env` file with all required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google APIs
GOOGLE_MEET_API_KEY="your-meet-api-key"
GOOGLE_CALENDAR_API_KEY="your-calendar-api-key"

# Redis
REDIS_URL="redis://default:password@host:6379"

# Email
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Socket.IO Server
NEXT_PUBLIC_SOCKET_SERVER_URL="https://socket.your-domain.com"
SOCKET_SERVER_PORT=3001

# File Storage (choose one)
# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket"

# OR Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# App
NODE_ENV="production"
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel

1. **Connect Repository**
   ```bash
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all frontend variables (NEXT_PUBLIC_*, NEXTAUTH_*, GOOGLE_*, etc.)

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### Deploy Socket.IO Server to Railway

1. **Create New Project**
   - Go to Railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Build**
   - Add `Procfile`:
     ```
     web: npm run socket
     ```
   
   - Or set Start Command in Railway:
     ```
     npm run socket
     ```

3. **Add Environment Variables**
   - DATABASE_URL
   - REDIS_URL
   - All other backend variables

4. **Deploy**
   - Railway auto-deploys on push to main branch
   - Get the public URL for SOCKET_SERVER_URL

### Option 2: All-in-One on Railway

1. **Create Two Services**
   - Service 1: Next.js app (frontend)
   - Service 2: Socket.IO server (backend)

2. **Configure Next.js Service**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add all environment variables

3. **Configure Socket Service**
   - Build Command: `npm install`
   - Start Command: `npm run socket`
   - Add backend environment variables

### Option 3: Docker Deployment

1. **Create Dockerfile for Next.js**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Create Dockerfile for Socket.IO**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npx prisma generate
   EXPOSE 3001
   CMD ["npm", "run", "socket"]
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     frontend:
       build:
         context: .
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       env_file:
         - .env
       depends_on:
         - db
         - redis

     socket:
       build:
         context: .
         dockerfile: Dockerfile.socket
       ports:
         - "3001:3001"
       env_file:
         - .env
       depends_on:
         - db
         - redis

     db:
       image: postgres:15-alpine
       environment:
         POSTGRES_PASSWORD: password
         POSTGRES_DB: classroom_quiz
       volumes:
         - postgres_data:/var/lib/postgresql/data

     redis:
       image: redis:7-alpine
       volumes:
         - redis_data:/data

   volumes:
     postgres_data:
     redis_data:
   ```

## Database Setup

### 1. Create Database

**Supabase:**
```bash
# Create project at supabase.com
# Get connection string from Settings → Database
```

**Railway:**
```bash
# Add PostgreSQL plugin
# Copy DATABASE_URL from plugin
```

### 2. Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 3. Seed Initial Data (Optional)

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });
  
  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx tsx prisma/seed.ts
```

## Google OAuth Setup

1. **Create OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable Google+ API
   - Go to Credentials → Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

2. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to environment variables

## Google Meet API Setup

1. **Enable Google Meet API**
   - In Google Cloud Console
   - Enable Google Meet API
   - Create API key

2. **Configure Scopes**
   - Add required OAuth scopes for Meet

## Redis Setup

**Upstash (Recommended for Serverless):**
1. Create database at upstash.com
2. Copy REDIS_URL
3. Add to environment variables

**Redis Cloud:**
1. Create database at redis.com/cloud
2. Get connection URL
3. Add to environment variables

## Domain & SSL

1. **Configure Domain**
   - Point A record to your server IP
   - Point CNAME for socket to socket server

2. **SSL Certificate**
   - Vercel provides automatic SSL
   - For custom deployment, use Let's Encrypt:
     ```bash
     sudo certbot --nginx -d your-domain.com
     ```

## Monitoring & Logging

1. **Add Error Tracking**
   - Sentry.io integration
   - LogRocket for session replay

2. **Performance Monitoring**
   - Vercel Analytics
   - Custom metrics tracking

3. **Uptime Monitoring**
   - UptimeRobot or Pingdom

## Scaling Considerations

### For 1000+ Concurrent Users

1. **Database Optimization**
   - Connection pooling (PgBouncer)
   - Read replicas for analytics
   - Proper indexing

2. **Redis Caching**
   - Cache frequently accessed data
   - Session storage
   - Rate limiting data

3. **Socket.IO Scaling**
   - Use Redis adapter for multiple instances
   - Load balancing
   - Sticky sessions

4. **CDN for Static Assets**
   - Cloudflare or AWS CloudFront
   - Image optimization

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Google OAuth working
- [ ] Socket.IO connections working
- [ ] Email notifications working
- [ ] SSL certificate active
- [ ] Monitoring tools set up
- [ ] Backup strategy in place
- [ ] Error tracking configured
- [ ] Performance baseline established

## Troubleshooting

**Socket.IO Connection Issues:**
- Check CORS configuration
- Verify WebSocket support
- Check firewall rules

**Database Connection:**
- Verify connection string
- Check SSL mode
- Ensure IP whitelist

**Authentication Issues:**
- Verify NEXTAUTH_SECRET
- Check OAuth redirect URIs
- Ensure session cookies working

## Support

For deployment help:
- Documentation: docs.your-domain.com
- Email: support@your-domain.com
- Discord: discord.gg/your-server
