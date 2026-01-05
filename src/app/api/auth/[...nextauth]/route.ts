/**
 * NextAuth.js API Route Handler
 * Platform Web Frontend - Next.js TypeScript
 */

import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
