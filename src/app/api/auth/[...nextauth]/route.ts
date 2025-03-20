import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";
import { connectDB } from "@lib/database";
import UserModel from "@models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: "user gist", 
        },
      },
      profile(profile: GithubProfile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login ?? null,
          email: profile.email ?? null,
          image: profile.avatar_url ?? null,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await UserModel.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          await connectDB();
          let dbUser = await UserModel.findOne({ email: user.email });

          const githubProfile = profile as GithubProfile;

          if (!dbUser) {
            dbUser = new UserModel({
              email: user.email!,
              name: user.name ?? githubProfile.login ?? undefined,
              avatar: user.image ?? undefined,
              githubToken: account.access_token,
            });
            await dbUser.save();
          } else {
            dbUser.name = dbUser.name ?? user.name ?? githubProfile.login ?? undefined;
            dbUser.avatar = dbUser.avatar ?? user.image ?? undefined;
            dbUser.githubToken = account.access_token;
            await dbUser.save();
          }
          user.id = dbUser._id.toString();
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      await connectDB();
      const dbUser = await UserModel.findById(token.id);
      if (dbUser) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: dbUser.name,
          email: dbUser.email,
          bio: dbUser.bio,
          avatar: dbUser.avatar,
          location: dbUser.location || null,
          githubToken: dbUser.githubToken, 
        };
      }
      console.log("Session updated:", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = async (req: Request, context: any) => {
  try {
    return await NextAuth(authOptions)(req, context);
  } catch (error) {
    console.error("NextAuth handler error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
};

export { handler as GET, handler as POST };