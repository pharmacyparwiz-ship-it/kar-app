// Prisma client singleton — prevents exhausting DB connections during
// Next.js dev hot-reload, which otherwise creates a new client per reload.

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma };
