import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { User } from './models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Authorizing credentials:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing email or password');
          return null;
        }
        try {
          const user: any = await User.findOne({ email: credentials.email as string });
          if (!user) {
            console.log('[Auth] User not found in database:', credentials.email);
            return null;
          }
          console.log('[Auth] User found:', user.email, 'Blocked:', user.isBlocked);
          if (user.isBlocked) {
            console.log('[Auth] User is blocked');
            return null;
          }
          const isMatch = await user.comparePassword(credentials.password as string);
          console.log('[Auth] Password match result:', isMatch);
          if (!isMatch) return null;
          
          console.log('[Auth] Authorization successful!');
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            addresses: user.addresses,
          };
        } catch (e: any) {
          console.error('[Auth] Error in authorize callback:', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.addresses = (user as any).addresses;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).addresses = token.addresses;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  trustHost: true,
});
