"use client";
interface GitHubSignInButtonProps {
    isLoading: boolean;
    handleGitHubSignIn: () => Promise<void>;
  }
  
  export default function GitHubSignInButton({ isLoading, handleGitHubSignIn }: GitHubSignInButtonProps) {
    return (
      <button
        onClick={handleGitHubSignIn}
        className="w-full bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-500 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign in with GitHub"}
      </button>
    );
  }