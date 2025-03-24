"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import LoginForm from "@components/auth/LoginForm"; // Adjust path as needed
import GitHubSignInButton from "@components/auth/GitHubSignInButton"; // Adjust path as needed
import LoginContent from "@components/auth/LoginContent"; // Adjust path as needed

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
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          isLoading={isLoading}
          handleCredentialsSignIn={handleCredentialsSignIn}
        />
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-gray-500 dark:text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>
        <GitHubSignInButton
          isLoading={isLoading}
          handleGitHubSignIn={handleGitHubSignIn}
        />
      </div>

      {/* Content Section - Pushed Down */}
      <LoginContent />
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