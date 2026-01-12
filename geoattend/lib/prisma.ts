import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the global object in development to prevent
// exhausting database connections due to hot reloading in Next.js

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Supabase PostgreSQL - standard connection
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
