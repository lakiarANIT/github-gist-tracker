import Link from "next/link";
import { useSession } from "next-auth/react";

export default function IntroSection() {
  const { status } = useSession();

  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 dark:from-blue-900/20 dark:to-gray-900 pt-12 pb-8 md:pt-16 md:pb-12 lg:pt-20 lg:pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
          Discover GitHub Gist Tracker (GGT)
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto sm:text-lg md:text-xl lg:mb-8">
          Elevate your coding workflow with a powerful tool to create, manage, and explore GitHub Gists—all in one place.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="inline-block w-full px-6 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors sm:w-auto sm:px-8 sm:py-3 sm:text-lg"
            >
              Go to Profile
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block w-full px-6 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors sm:w-auto sm:px-8 sm:py-3 sm:text-lg"
            >
              Sign In with GitHub
            </Link>
          )}
          <Link
            href="/learnmore"
            className="inline-block w-full px-6 py-2 text-base font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 transition-colors sm:w-auto sm:px-8 sm:py-3 sm:text-lg"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}