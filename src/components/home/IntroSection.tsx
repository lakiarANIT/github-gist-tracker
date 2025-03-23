import Link from "next/link";
import { useSession } from "next-auth/react";

export default function IntroSection() {
  const { status } = useSession();

  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 dark:from-blue-900/20 dark:to-gray-900 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Discover GitHub Gist Tracker (GGT)
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Elevate your coding workflow with a powerful tool to create, manage, and explore
          GitHub Gists—all in one place.
        </p>
        <div className="flex justify-center gap-4">
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              Go to Profile
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              Sign In with GitHub
            </Link>
          )}
          <Link
            href="/learnmore"
            className="inline-block px-8 py-3 bg-transparent text-blue-600 dark:text-blue-400 text-lg font-semibold border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}