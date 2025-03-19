import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { connectDB } from "@lib/database";
import UserModel from "@models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { GithubProfile } from "next-auth/providers/github"; // Import GithubProfile type

interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    location?: { lat: number; lng: number } | null;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        console.log("Authorizing credentials:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          await connectDB();
          const user = await UserModel.findOne({ email: credentials.email });
          if (!user || !user.password) {
            console.log("User not found or no password set");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("User authorized:", user.email);
          return { id: user._id.toString(), email: user.email, name: user.name || null };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      profile(profile: GithubProfile) {
        console.log("GitHub profile:", profile);
        return {
          id: profile.id.toString(), // GitHub returns id as number, convert to string
          name: profile.name ?? profile.login ?? null, // Handle null case explicitly
          email: profile.email ?? null, // GitHub email can be null
          image: profile.avatar_url ?? null, // Use avatar_url from GithubProfile
        };
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

          const githubProfile = profile as GithubProfile | undefined; // Type assertion with safety

          if (!dbUser) {
            // Create a new user if they don't exist
            dbUser = new UserModel({
              email: user.email!,
              name: user.name ?? (githubProfile?.login) ?? undefined, // Convert null to undefined
              avatar: user.image ?? undefined, // Convert null to undefined
              githubToken: account.access_token, // Safe since it's GitHub
            });
            await dbUser.save();
            console.log("New GitHub user created:", dbUser.email);
          } else {
            // Update existing user with GitHub data if needed
            dbUser.name = dbUser.name ?? user.name ?? (githubProfile?.login) ?? undefined;
            dbUser.avatar = dbUser.avatar ?? user.image ?? undefined;
            dbUser.githubToken = account.access_token; // Update token
            await dbUser.save();
            console.log("GitHub user updated:", dbUser.email);
          }
          // Update the user object with the MongoDB _id
          user.id = dbUser._id.toString();
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false; // Deny sign-in if there's an error
        }
      }
      return true; // Allow sign-in
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        console.log("JWT callback - Token updated with id:", token.id);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Token:", token);
      await connectDB();
      const dbUser = await UserModel.findById(token.id);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          location: dbUser?.location || null,
        },
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

// Wrap handler with error handling
const handler = async (req: Request, context: any) => {
  try {
    console.log("NextAuth handler invoked for:", req.url);
    return await NextAuth(authOptions)(req, context);
  } catch (error) {
    console.error("NextAuth handler error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
};

export { handler as GET, handler as POST };