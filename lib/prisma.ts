import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Fix for pgbouncer prepared statement errors
// If using pgbouncer, add &prepared_statements=false to DATABASE_URL in .env
// Example: DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1&prepared_statements=false"
if (process.env.DATABASE_URL?.includes('pgbouncer=true') && !process.env.DATABASE_URL.includes('prepared_statements')) {
  console.warn('⚠️  DATABASE_URL should include &prepared_statements=false when using pgbouncer')
  console.warn('   Update your .env file: DATABASE_URL="...?pgbouncer=true&connection_limit=1&prepared_statements=false"')
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma







