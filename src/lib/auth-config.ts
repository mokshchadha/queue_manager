import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log({user, account, profile })
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // First time JWT is created
        token.username = user.email?.split('@')[0] || user.name || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.username) {
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};