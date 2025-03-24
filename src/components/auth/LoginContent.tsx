export default function LoginContent() {
    return (
      <>
        <div className="text-center mt-10 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to GitHub Gist Tracker (GGT)
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Unlock a seamless way to manage your GitHub Gists with GGT!
          </p>
        </div>
        <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 mb-10">
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
      </>
    );
  }