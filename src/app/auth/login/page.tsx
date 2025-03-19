// /app/auth/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGitHubSignIn = () => {
    setIsLoading(true);
    signIn("github", { callbackUrl });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      {/* Email/Password Form for non-GitHub users */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            disabled={isLoading}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-purple-700 text-white p-2 rounded-md hover:bg-purple-600 disabled:bg-purple-400"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <hr className="flex-grow border-gray-300" />
        <span className="px-2 text-gray-500">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* GitHub Login Option */}
      <button
        onClick={handleGitHubSignIn}
        className="w-full bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 disabled:bg-gray-500"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Sign in with GitHub"}
      </button>

      {/* Sign Up Link */}
      <p className="mt-4 text-center text-gray-600">
        Don’t have an account?{" "}
        <a href="/auth/register" className="text-purple-700 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}