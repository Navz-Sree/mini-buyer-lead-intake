import CredentialsProvider from "next-auth/providers/credentials";
import type { SessionStrategy } from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
      },
      async authorize(credentials) {
        if (credentials?.email) {
          // Demo: assign admin if email contains 'admin', else agent
          const role = credentials.email.includes("admin") ? "admin" : "agent";
          return { id: credentials.email, email: credentials.email, name: "Demo User", role };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" as SessionStrategy },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
};

// Extend NextAuth types for role
// 1. Create a next-auth.d.ts file in your project root or types folder with:
// import NextAuth from "next-auth";
// declare module "next-auth" {
//   interface User { role?: string }
//   interface Session { user: { role?: string } & DefaultSession["user"] }
// }
