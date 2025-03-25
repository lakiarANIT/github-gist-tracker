"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

interface AuthControlsProps {
  session: Session | null;
}

export function AuthControls({ session }: AuthControlsProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/auth/login");
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {session ? (
        <>
          <Link href="/profile" className="text-sm sm:text-base hover:text-purple-300 dark:hover:text-purple-200 transition-colors">
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="bg-purple-700 dark:bg-purple-800 text-xs sm:text-sm text-white hover:bg-purple-600 dark:hover:bg-purple-700 hover:shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => handleRedirect()}
          className="bg-purple-700 dark:bg-purple-800 text-xs sm:text-sm text-white hover:bg-purple-600 dark:hover:bg-purple-700 hover:shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
        >
          Sign In with GitHub
        </button>
      )}
    </div>
  );
}