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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-start pt-10">
      {/* Login Form Section - Prominent at the Top */}
      <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Login to GitHub Gist Tracker
        </h1>
        <form onSubmit={handleCredentialsSignIn}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-800 disabled:bg-purple-400 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-gray-500 dark:text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>
        <button
          onClick={handleGitHubSignIn}
          className="w-full bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-500 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign in with GitHub"}
        </button>
      </div>

      {/* Header Section - Below Login Form */}
      <div className="text-center mt-10 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to GitHub Gist Tracker (GGT)
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Unlock a seamless way to manage your GitHub Gists with GGT!
        </p>
      </div>

      {/* Content Section - Pushed Down */}
      <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 mb-10">
        {/* Left Column: Why Sign In with GitHub */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Why Sign In with GitHub?
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Unified Access:</span> Use your existing
              GitHub account—no extra credentials needed.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Secure Authentication:</span> GitHub’s
              OAuth ensures a fast, secure login trusted by developers worldwide.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Gist Management:</span> Instantly access
              and manage your GitHub Gists in one place.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Version Control:</span> Track changes to
              your Gists with GitHub’s built-in versioning.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Community Integration:</span> Share public
              Gists and get feedback from the GitHub community.
            </li>
          </ul>
        </div>

        {/* Right Column: Added Features with GGT */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Added Features with GGT
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Organize Gists:</span> Group Gists into
              custom categories for better organization.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Enhanced Editing:</span> Edit Gists
              directly in GGT, synced seamlessly with GitHub.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Location Insights:</span> Tag Gists with
              your location for added context.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Public Gist Discovery:</span> Explore and
              interact with others’ public Gists within GGT.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Personal Dashboard:</span> View all your
              Gists and activity in a tailored dashboard.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}