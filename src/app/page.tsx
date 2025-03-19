// /app/page.tsx
"use client";

import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the GitHub Gist Tracker</p>
      {status === "loading" ? (
        <p>Loading...</p>
      ) : session ? (
        <p>You are authenticated as {session.user?.email}</p>
      ) : (
        <p>
          You are not authenticated. Please{" "}
          <a href="/auth/login" className="text-purple-700">
            sign in
          </a>
          .
        </p>
      )}
    </div>
  );
}