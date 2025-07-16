// /lib/prisma.ts (The Corrected Version)

import { PrismaClient } from '@prisma/client';

// This declares a global variable to hold the Prisma Client instance.
declare global {
  var prisma: PrismaClient | undefined;
}

// This line is the core of the singleton pattern.
// It checks if a prisma instance already exists on the universal global object.
// If it does, it reuses it. If not, it creates a new one.
const prisma = globalThis.prisma || new PrismaClient();

// In development, when Next.js hot-reloads, it clears the module cache.
// This code prevents new connections from being created on every hot reload
// by saving the single instance to the global object.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Export the single, shared instance of Prisma Client.
export default prisma;
