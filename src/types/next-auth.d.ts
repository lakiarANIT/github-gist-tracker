// /src/types/next-auth.d.ts
import { DefaultUser } from "next-auth";

declare module "next-auth" {
  // Extend the User type used in callbacks
  interface User extends DefaultUser {
    id: string;
    login?: string; // Add login to User type
    email?: string | null;
    name?: string | null;
    image?: string | null;
    bio?: string | null;
    avatar?: string | null;
    githubToken?: string;
    location?: { lat: number; lng: number } | null;
  }

  // Extend the Session type
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      location?: { lat: number; lng: number } | null;
      avatar?: string | null;
      bio?: string | null;
      githubToken?: string;
      login?: string; // Add login to Session user type
    };
  }
}

declare module "next-auth/jwt" {
  // Extend the JWT type
  interface JWT {
    id: string;
    login?: string; // Add login to JWT type
  }
}