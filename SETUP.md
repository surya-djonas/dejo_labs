# 🎯 Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials.

## 3. Set Up Database
```bash
# Start PostgreSQL (if local)
# Then push schema
npm run db:push
npm run db:generate
```

## 4. Start Development

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Socket.IO Server:**
```bash
npm run socket
```

## 5. Access Application
- Frontend: http://localhost:3000
- Socket Server: http://localhost:3001

## 6. Create Admin Account
Use the sign up page or seed the database.

## Key Features to Test

1. **Authentication**: Sign up → Sign in → Dashboard
2. **Create Classroom**: Dashboard → Create classroom → Get invite code
3. **Join Classroom**: Student signs up → Uses invite code
4. **Create Quiz**: Teacher → Create quiz with questions
5. **Live Quiz**: Start quiz → Students join → Real-time timer → Leaderboard updates
6. **Analytics**: View performance metrics

## Common Issues

**Port already in use:**
```bash
# Kill process on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Run `npm run db:push` again

**Socket.IO not connecting:**
- Ensure both servers are running
- Check SOCKET_SERVER_URL matches port 3001
- Clear browser cache

## Next Steps

1. Read the full [README.md](README.md)
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
3. Explore the codebase structure
4. Customize branding and styles
5. Add your own features

## Development Commands

```bash
# Development
npm run dev              # Start Next.js
npm run socket           # Start Socket.IO server

# Database
npm run db:push          # Push schema
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio

# Testing
npm test                 # Run tests
npm run test:e2e         # E2E tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Production
npm run build            # Build for production
npm start                # Start production server
```

## Support

Need help? Check:
- Full documentation in README.md
- Code comments in source files
- TypeScript types for API contracts
