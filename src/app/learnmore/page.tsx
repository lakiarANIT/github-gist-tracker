"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaArrowLeft, FaSearch, FaFolder, FaBookOpen, FaUserCog, FaTrash, FaEdit, FaGithub } from "react-icons/fa";

export default function LearnMore() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FaArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-lg font-semibold">Back to Home</span>
          </Link>
          {status === "authenticated" ? (
            <Link href="/profile" className="text-blue-600 hover:underline">
              Go to Profile
            </Link>
          ) : (
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-8">
          How to Use GitHub Gist Tracker (GGT)
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          GGT enhances your GitHub Gist experience with powerful tools to search, organize, and manage your code snippets—all seamlessly integrated with GitHub.
        </p>

        {/* Steps Section */}
        <div className="space-y-12">
          {/* Step 1: Search Public Gists */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <FaSearch className="w-10 h-10 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Search Public Gists</h2>
              <p className="text-gray-700">
                Start exploring right away! Use the search bar on the home page to find public Gists by keyword. Filter through thousands of snippets shared by the GitHub community to discover useful code or inspiration—no sign-in required.
              </p>
            </div>
          </div>

          {/* Step 2: Group Your Gists */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <FaFolder className="w-10 h-10 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Group Your Gists</h2>
              <p className="text-gray-700">
                Unlike standard GitHub Gists, GGT lets you organize your Gists into custom groups (e.g., “Work Scripts,” “Learning Notes”). Sign in with GitHub to create and manage groups, keeping your snippets neatly categorized.
              </p>
            </div>
          </div>

          {/* Step 3: Read Gists Like a Book */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <FaBookOpen className="w-10 h-10 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">3. Read Gists Like a Book</h2>
              <p className="text-gray-700">
                Open Gists in a paginated, reader-friendly format. Navigate from one Gist to the next with ease, like flipping through pages—perfect for tutorials, multi-part snippets, or linked ideas.
              </p>
            </div>
          </div>

          {/* Step 4: Manage Your Groups */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <FaUserCog className="w-10 h-10 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">4. Manage Your Groups</h2>
              <p className="text-gray-700">
                Once signed in, take control of your Gist groups. Add new Gists, delete outdated ones, or rearrange them as needed. GGT syncs everything with GitHub, so your changes are always safe and versioned.
              </p>
            </div>
          </div>

          {/* Step 5: Customize Your Profile */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <FaEdit className="w-10 h-10 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">5. Customize Your Profile</h2>
              <p className="text-gray-700">
                Make GGT your own! Update your profile with a bio, avatar, and even your location to add a personal touch to your Gist-sharing experience.
              </p>
            </div>
          </div>

          {/* Step 6: Powered by GitHub */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <FaGithub className="w-10 h-10 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">6. Powered by GitHub</h2>
              <p className="text-gray-700">
                All your Gists are stored securely on GitHub, not our servers. Create, edit, or delete Gists in GGT, and they’ll sync instantly with your GitHub account. Plus, interact with the community—star, comment, or fork Gists directly.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Manage Your Gists
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Sign In with GitHub
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}