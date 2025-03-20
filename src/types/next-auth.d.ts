// /src/types/next-auth.d.ts
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      location?: { lat: number; lng: number } | null; 
      avatar?: string | null; 
      bio?: string | null; 

    };
  }
}