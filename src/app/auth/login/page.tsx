"use client";

import { Suspense } from "react";
import { useLogin } from "@hooks/auth/useLogin";
import LoginForm from "@components/auth/LoginForm";
import GitHubSignInButton from "@components/auth/GitHubSignInButton";
import LoginContent from "@components/auth/LoginContent";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleGitHubSignIn,
    handleCredentialsSignIn,
  } = useLogin();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-start pt-10">
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
          <GitHubSignInButton isLoading={isLoading} handleGitHubSignIn={handleGitHubSignIn} />
        </div>
        <LoginContent />
      </div>
    </Suspense>
  );
}

export const dynamic = "force-dynamic"; 