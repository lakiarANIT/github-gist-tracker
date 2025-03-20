"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaHeart, FaComment, FaShare, FaCode } from "react-icons/fa";

interface Gist {
  id: string;
  html_url: string;
  description: string | null;
  files: { [key: string]: { filename: string; language: string; raw_url: string; size: number } };
  created_at: string;
  updated_at: string;
  public: boolean;
  comments: number;
  owner: { login: string; html_url: string };
}

// Dummy Gist data (expanded with more entries for demonstration)
const dummyGists: Gist[] = [
  {
    id: "aa5a315d61ae9438b18d",
    html_url: "https://gist.github.com/aa5a315d61ae9438b18d",
    description: "Hello World Examples",
    files: {
      "hello_world.rb": {
        filename: "hello_world.rb",
        language: "Ruby",
        raw_url:
          "https://gist.githubusercontent.com/octocat/6cad326836d38bd3a7ae/raw/db9c55113504e46fa076e7df3a04ce592e2e86d8/hello_world.rb",
        size: 167,
      },
    },
    created_at: "2010-04-14T02:15:15Z",
    updated_at: "2011-06-20T11:34:15Z",
    public: true,
    comments: 0,
    owner: { login: "octocat", html_url: "https://github.com/octocat" },
  },
  {
    id: "bb5b315d61ae9438b19e",
    html_url: "https://gist.github.com/bb5b315d61ae9438b19e",
    description: "Simple Python Script",
    files: {
      "script.py": {
        filename: "script.py",
        language: "Python",
        raw_url: "https://gist.githubusercontent.com/octocat/bb5b315d61ae9438b19e/raw/script.py",
        size: 245,
      },
    },
    created_at: "2020-05-10T09:00:00Z",
    updated_at: "2020-05-11T14:20:00Z",
    public: false,
    comments: 2,
    owner: { login: "octocat", html_url: "https://github.com/octocat" },
  },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [gists, setGists] = useState<Gist[]>([]);
  const [showProfile, setShowProfile] = useState(true);
  const [newGist, setNewGist] = useState({ title: "", description: "", code: "", language: "Text" });
  const [linkedGist, setLinkedGist] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && !session?.user?.location) {
      setShowLocationPrompt(true);
    }
    setGists(dummyGists); // Use dummy data
  }, [status, session]);

  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch("/api/profile", {
              method: "PUT",
              body: JSON.stringify({ location: { lat: latitude, lng: longitude } }),
            });
            if (response.ok) {
              setShowLocationPrompt(false);
              window.location.reload();
            }
          } catch (error) {
            console.error("Error updating location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleCreateGist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGist.title || !newGist.code) return;

    const newGistData: Gist = {
      id: `gist-${Date.now()}`,
      html_url: `https://gist.github.com/fake/${Date.now()}`,
      description: newGist.title,
      files: {
        [`${newGist.title.toLowerCase().replace(/\s/g, "_")}.${newGist.language.toLowerCase()}`]: {
          filename: `${newGist.title.toLowerCase().replace(/\s/g, "_")}.${newGist.language.toLowerCase()}`,
          language: newGist.language,
          raw_url: "",
          size: newGist.code.length,
        },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      public: true,
      comments: 0,
      owner: { login: session?.user?.name || "user", html_url: "https://github.com/user" },
    };

    setGists([newGistData, ...gists]);
    setNewGist({ title: "", description: "", code: "", language: "Text" });
    setLinkedGist(null);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">
          Please{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            sign in
          </Link>{" "}
          to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Profile Section (Toggleable) */}
        {showProfile && (
          <div className="lg:w-1/3 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={session?.user?.avatar || "/default-avatar.png"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">
                  {session?.user?.name || "Unnamed User"}
                </h1>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {session?.user?.bio || "No bio set yet."}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {session?.user?.location
                  ? `${session.user.location.lat}, ${session.user.location.lng}`
                  : "Location not set"}
              </p>
              <Link
                href="/profile/edit"
                className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
            {showLocationPrompt && (
              <div className="mt-4 p-4 border border-amber-200 rounded-lg bg-amber-50">
                <p className="text-sm text-amber-800 mb-3">
                  Share your location to enhance your experience
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={requestLocation}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setShowLocationPrompt(false)}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Gist Feed */}
        <div className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 ${showProfile ? "lg:w-2/3" : "w-full"}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Gist Feed</h2>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showProfile ? "Hide Profile" : "Show Profile"}
            </button>
          </div>

          {/* Create Gist Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <form onSubmit={handleCreateGist}>
              <input
                type="text"
                placeholder="What's your Gist title?"
                value={newGist.title}
                onChange={(e) => setNewGist({ ...newGist, title: e.target.value })}
                className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Add a description (optional)..."
                value={newGist.description}
                onChange={(e) => setNewGist({ ...newGist, description: e.target.value })}
                className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                rows={2}
              />
              <textarea
                placeholder="Paste your code here..."
                value={newGist.code}
                onChange={(e) => setNewGist({ ...newGist, code: e.target.value })}
                className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                rows={4}
              />
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={newGist.language}
                  onChange={(e) => setNewGist({ ...newGist, language: e.target.value })}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="Text">Text</option>
                  <option value="Ruby">Ruby</option>
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                </select>
                <select
                  value={linkedGist || ""}
                  onChange={(e) => setLinkedGist(e.target.value || null)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Link to another Gist (optional)</option>
                  {gists.map((gist) => (
                    <option key={gist.id} value={gist.id}>
                      {gist.description || "Untitled Gist"}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Share Gist
              </button>
            </form>
          </div>

          {/* Gist Feed */}
          <div className="max-h-[60vh] overflow-y-auto space-y-6">
            {gists.length === 0 ? (
              <p className="text-sm text-gray-600">No gists yet. Share your first Gist!</p>
            ) : (
              gists.map((gist) => {
                const firstFile = Object.values(gist.files)[0];
                return (
                  <div
                    key={gist.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Gist Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={session?.user?.avatar || "/default-avatar.png"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                        onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{gist.owner.login}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(gist.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Gist Title */}
                    <p className="text-md font-medium text-gray-900 mb-2">
                      {gist.description || "Untitled Gist"}
                    </p>

                    {/* Gist Description */}
                    {gist.description && (
                      <p className="text-sm text-gray-600 mb-2">{gist.description}</p>
                    )}

                    {/* Code Preview */}
                    <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                      <p className="text-gray-500">
                        #!/usr/bin/env {firstFile.language.toLowerCase()}
                      </p>
                      <p className="mt-2 italic">
                        ** {gist.description || "No description"} **
                      </p>
                    </div>

                    {/* Linked Gist (if any) */}
                    {linkedGist === gist.id && (
                      <div className="text-sm text-blue-600 mb-2">
                        <p>
                          Related Gist:{" "}
                          <a
                            href={gists.find((g) => g.id === linkedGist)?.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {gists.find((g) => g.id === linkedGist)?.description || "Untitled Gist"}
                          </a>
                        </p>
                      </div>
                    )}

                    {/* Social Actions */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-red-500">
                        <FaHeart className="w-4 h-4" /> 24
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <FaComment className="w-4 h-4" /> {gist.comments}
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500">
                        <FaShare className="w-4 h-4" /> 2
                      </button>
                      <a
                        href={gist.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <FaCode className="w-4 h-4" /> View Full Gist
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}