"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaArrowLeft, FaSearch, FaFolder, FaBookOpen, FaUserCog, FaTrash, FaEdit, FaGithub } from "react-icons/fa";

export default function LearnMore() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
          <Link
            href="/"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2 sm:w-5 sm:h-5" />
            <span className="text-base font-semibold sm:text-lg">Back to Home</span>
          </Link>
          {status === "authenticated" ? (
            <Link href="/profile" className="text-blue-600 dark:text-blue-400 hover:underline text-base sm:text-lg">
              Go to Profile
            </Link>
          ) : (
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline text-base sm:text-lg">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-6 sm:text-4xl md:text-5xl lg:mb-8">
          How to Use GitHub Gist Tracker (GGT)
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 text-center mb-8 max-w-3xl mx-auto sm:text-lg md:mb-12">
          GGT enhances your GitHub Gist experience with powerful tools to search, organize, and manage your code snippets—all seamlessly integrated with GitHub.
        </p>

        {/* Steps Section */}
        <div className="space-y-10 sm:space-y-12">
          {/* Step 1: Search Public Gists */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <FaSearch className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 sm:w-10 sm:h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-2xl">1. Search Public Gists</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Start exploring right away! Use the search bar on the home page to find public Gists by keyword. Filter through thousands of snippets shared by the GitHub community to discover useful code or inspiration—no sign-in required.
              </p>
            </div>
          </div>

          {/* Step 2: Group Your Gists */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <FaFolder className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 sm:w-10 sm:h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-2xl">2. Group Your Gists</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Unlike standard GitHub Gists, GGT lets you organize your Gists into custom groups (e.g., “Work Scripts,” “Learning Notes”). Sign in with GitHub to create and manage groups, keeping your snippets neatly categorized.
              </p>
            </div>
          </div>

          {/* Step 3: Read Gists Like a Book */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <FaBookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 sm:w-10 sm:h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-2xl">3. Read Gists Like a Book</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Open Gists in a paginated, reader-friendly format. Navigate from one Gist to the next with ease, like flipping through pages—perfect for tutorials, multi-part snippets, or linked ideas.
              </p>
            </div>
          </div>

          {/* Step 4: Manage Your Groups */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <FaUserCog className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 sm:w-10 sm:h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-2xl">4. Manage Your Groups</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Once signed in, take control of your Gist groups. Add new Gists, delete outdated ones, or rearrange them as needed. GGT syncs everything with GitHub, so your changes are always safe and versioned.
              </p>
            </div>
          </div>

          {/* Step 5: Customize Your Profile */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <FaEdit className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 sm:w-10 sm:h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-2xl">5. Customize Your Profile</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Make GGT your own! Update your profile with a bio, avatar, and even your location to add a personal touch to your Gist-sharing experience.
              </p>
            </div>
          </div>

          {/* Step 6: Powered by GitHub */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <FaGithub className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 sm:w-10 sm:h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-2xl">6. Powered by GitHub</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                All your Gists are stored securely on GitHub, not our servers. Create, edit, or delete Gists in GGT, and they’ll sync instantly with your GitHub account. Plus, interact with the community—star, comment, or fork Gists directly.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-10 sm:mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:text-2xl">Ready to Get Started?</h2>
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="inline-block w-full px-6 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors sm:w-auto sm:px-8 sm:py-3 sm:text-lg"
            >
              Manage Your Gists
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block w-full px-6 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors sm:w-auto sm:px-8 sm:py-3 sm:text-lg"
            >
              Sign In with GitHub
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}