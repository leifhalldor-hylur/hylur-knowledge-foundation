import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  password: string;
  emailVerified: Date | null;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}