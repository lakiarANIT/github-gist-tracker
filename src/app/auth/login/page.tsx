"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError("");
    const result = await signIn("github", { redirect: false, callbackUrl });
    if (result?.error) {
      setError("Failed to sign in with GitHub");
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) {
      setError("Invalid email or password (GitHub sign-in required first)");
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <button
        onClick={handleGitHubSignIn}
        className="w-full bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 disabled:bg-gray-500 mb-4"
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign in with GitHub"}
      </button>
      <div className="my-4 flex items-center">
        <hr className="flex-grow border-gray-300" />
        <span className="px-2 text-gray-500">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>
      <form onSubmit={handleCredentialsSignIn}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-purple-700 text-white p-2 rounded disabled:bg-purple-400"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In with Email"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
