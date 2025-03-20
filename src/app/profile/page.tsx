"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaHeart, FaComment, FaShare, FaCode, FaTrash, FaUser, FaFileCode, FaFolder, FaChevronDown } from "react-icons/fa";
import { Octokit } from "@octokit/core";

// Define the Gist interface to match the GitHub API response with optional fields
interface Gist {
  id: string;
  html_url: string;
  description: string | null;
  files: {
    [key: string]: {
      filename: string;
      language: string;
      raw_url: string;
      size: number;
    };
  };
  created_at: string;
  updated_at: string;
  public: boolean;
  comments: number;
  owner: { login: string; html_url: string };
}

// Define the Gist group interface
interface GistGroup {
  id: string; // MongoDB ObjectId as string
  name: string;
}

// Define the structure for a new Gist file
interface GistFile {
  filename: string;
  content: string;
  language: string;
}

// Dummy Gist data (for initial display)
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
  const [gists, setGists] = useState<Gist[]>(dummyGists);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // "" means all gists
  const [activeTab, setActiveTab] = useState<"profile" | "postGist">("profile");
  const [newGist, setNewGist] = useState({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [linkedGist, setLinkedGist] = useState<string | null>(null);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false); // For dropdown toggle

  // Fetch GitHub token and initialize Octokit, fetch Gist groups
  useEffect(() => {
    const initializeOctokitAndGroups = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) throw new Error(tokenData.error || "Failed to fetch GitHub token");

          const { githubToken } = tokenData;
          if (githubToken) {
            setOctokit(new Octokit({ auth: githubToken }));
          } else {
            alert("Please link your GitHub account to create Gists.");
          }

          const groupsResponse = await fetch("/api/gist-groups", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
          const groupsData = await groupsResponse.json();
          const fetchedGroups = (groupsData.groups || []).map((group: any) => ({
            id: group._id.toString(),
            name: group.name,
          }));
          setGistGroups(fetchedGroups);
        } catch (error) {
          console.error("Error initializing:", error);
          alert("Failed to initialize. Please try again.");
        }
      }
    };

    initializeOctokitAndGroups();

    if (status === "authenticated" && !session?.user?.location) {
      setShowLocationPrompt(true);
    }
  }, [status, session]);

  // Fetch Gists based on selectedGroupId ("" for all, specific ID for group)
  useEffect(() => {
    const fetchGists = async () => {
      if (status !== "authenticated") return;

      try {
        let url = "/api/all-gists"; // New endpoint for all gists
        if (selectedGroupId) {
          url = `/api/gist-groups/${selectedGroupId}/gists`; // Group-specific gists
        }

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch Gists: ${response.statusText}`);
        }
        const data = await response.json();
        setGists(data.gists || []);
      } catch (error) {
        console.error("Error fetching Gists:", error);
        setGists(dummyGists); // Fallback to dummy data
      }
    };

    fetchGists();
  }, [selectedGroupId, status]);

  // Create a Gist using Octokit
  const createGist = async (description: string, files: GistFile[], isPublic: boolean): Promise<Gist> => {
    if (!octokit) throw new Error("Octokit not initialized.");
    const gistFiles: { [key: string]: { content: string } } = {};
    files.forEach((file) => {
      if (file.filename && file.content) gistFiles[file.filename] = { content: file.content };
    });

    const response = await octokit.request("POST /gists", {
      description,
      public: isPublic,
      files: gistFiles,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });
    const data = response.data;

    if (!data.id || !data.html_url || !data.created_at || !data.updated_at) {
      throw new Error("Invalid Gist response from GitHub API");
    }

    return {
      id: data.id,
      html_url: data.html_url,
      description: data.description ?? null,
      files: Object.fromEntries(
        Object.entries(data.files || {}).map(([filename, file]) => {
          if (!file || !file.filename || !file.raw_url || file.size === undefined) {
            throw new Error(`Invalid file data for ${filename}`);
          }
          return [
            filename,
            {
              filename: file.filename,
              language: file.language || "Text",
              raw_url: file.raw_url,
              size: file.size,
            },
          ];
        })
      ),
      created_at: data.created_at,
      updated_at: data.updated_at,
      public: data.public ?? false,
      comments: data.comments ?? 0,
      owner: {
        login: data.owner?.login || "unknown",
        html_url: data.owner?.html_url || "",
      },
    };
  };

  // Create a new Gist group
  const createGistGroup = async (name: string): Promise<GistGroup> => {
    try {
      const response = await fetch("/api/gist-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create Gist group");
      const data = await response.json();
      return { id: data.group._id.toString(), name: data.group.name };
    } catch (error) {
      console.error("Error creating Gist group:", error);
      throw error;
    }
  };

  // Add Gist to a group
  const addGistToGroup = async (groupId: string, gistId: string) => {
    const response = await fetch(`/api/gist-groups/${groupId}/gists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gistId }),
    });
    if (!response.ok) throw new Error(`Failed to add Gist to group: ${response.statusText}`);
    const data = await response.json();
    return data.group;
  };

  // Handle adding a new file to the Gist
  const handleAddFile = () => {
    setNewGist({
      ...newGist,
      files: [...newGist.files, { filename: "", content: "", language: "Text" }],
    });
  };

  // Handle deleting a file from the Gist
  const handleDeleteFile = (index: number) => {
    if (newGist.files.length === 1) return;
    const updatedFiles = newGist.files.filter((_, i) => i !== index);
    setNewGist({ ...newGist, files: updatedFiles });
  };

  // Handle updating a specific file's details
  const handleFileChange = (index: number, field: keyof GistFile, value: string) => {
    const updatedFiles = [...newGist.files];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setNewGist({ ...newGist, files: updatedFiles });
  };

  // Handle Gist creation and group assignment
  const handleCreateGist = async (e: React.FormEvent) => {
    e.preventDefault();

    const validFiles = newGist.files.filter((file) => file.filename.trim() && file.content.trim());
    if (validFiles.length === 0) {
      alert("Please provide at least one file with a filename and content.");
      return;
    }

    try {
      const createdGist = await createGist(newGist.description, validFiles, newGist.isPublic);

      let groupId: string = selectedGroupId;
      if (!selectedGroupId && newGroupName) {
        const newGroup = await createGistGroup(newGroupName);
        groupId = newGroup.id;
        setGistGroups([...gistGroups, newGroup]);
        setSelectedGroupId(newGroup.id);
      } else if (!selectedGroupId) {
        alert("Please select a group or enter a new group name.");
        return;
      }

      await addGistToGroup(groupId, createdGist.id);

      const response = await fetch(`/api/gist-groups/${groupId}/gists`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch updated Gists");
      const data = await response.json();
      setGists(data.gists || []);

      setNewGist({
        description: "",
        files: [{ filename: "", content: "", language: "Text" }],
        isPublic: false,
      });
      setNewGroupName("");
      setLinkedGist(null);
      alert("Gist created and added to group successfully!");
      setActiveTab("profile");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to create Gist: ${error.message || "An unexpected error occurred."}`);
    }
  };

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
      <div className="max-w-5xl mx-auto flex gap-6">
        <div className="w-16 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center py-4 sticky top-6 h-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-3 mb-2 rounded-full ${
              activeTab === "profile" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Profile"
          >
            <FaUser className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab("postGist")}
            className={`p-3 mb-2 rounded-full ${
              activeTab === "postGist" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Post Gist"
          >
            <FaFileCode className="w-6 h-6" />
          </button>
          <hr className="w-10 my-2 border-gray-300" />
          <div className="relative">
            <button
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className={`p-3 mb-2 rounded-full ${
                selectedGroupId ? "text-blue-600 hover:bg-blue-100" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Gist Groups"
            >
              <FaFolder className="w-6 h-6" />
            </button>
            {isGroupDropdownOpen && (
              <div className="absolute left-16 top-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setSelectedGroupId("");
                    setIsGroupDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    selectedGroupId === ""
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All Gists
                </button>
                {gistGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsGroupDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm ${
                      selectedGroupId === group.id
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              {activeTab === "profile" ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
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
                        ? `${session?.user?.location?.lat}, ${session?.user?.location?.lng}`
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
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a Gist</h2>
                  <form onSubmit={handleCreateGist}>
                    <input
                      type="text"
                      placeholder="Gist description..."
                      value={newGist.description}
                      onChange={(e) => setNewGist({ ...newGist, description: e.target.value })}
                      className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    {newGist.files.map((file, index) => (
                      <div key={index} className="mb-4 border-b pb-4 relative">
                        <input
                          type="text"
                          placeholder="Filename including extension..."
                          value={file.filename}
                          onChange={(e) => handleFileChange(index, "filename", e.target.value)}
                          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                        <textarea
                          placeholder="Paste your code here..."
                          value={file.content}
                          onChange={(e) => handleFileChange(index, "content", e.target.value)}
                          className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                          rows={4}
                        />
                        <div className="flex items-center gap-2 mb-2">
                          <select
                            value={file.language}
                            onChange={(e) => handleFileChange(index, "language", e.target.value)}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          >
                            <option value="Text">Text</option>
                            <option value="Ruby">Ruby</option>
                            <option value="Python">Python</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="TypeScript">TypeScript</option>
                          </select>
                          {index === 0 && (
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
                          )}
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            title="Delete this file"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between items-center mb-4">
                      <button
                        type="button"
                        onClick={handleAddFile}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Add file
                      </button>
                      <select
                        value={newGist.isPublic ? "public" : "secret"}
                        onChange={(e) => setNewGist({ ...newGist, isPublic: e.target.value === "public" })}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      >
                        <option value="secret">Create secret gist</option>
                        <option value="public">Create public gist</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-1">Add to Gist Group</label>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select a group (optional)</option>
                        {gistGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or enter new group name..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      {newGist.isPublic ? "Create public gist" : "Create secret gist"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Gists {selectedGroupId ? `in ${gistGroups.find((g) => g.id === selectedGroupId)?.name}` : "from All Groups"}
            </h2>
            <div className="max-h-[60vh] overflow-y-auto">
              {gists.length === 0 ? (
                <p className="text-sm text-gray-600">No gists available yet. Share one!</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {gists.map((gist) => {
                    const firstFile = Object.values(gist.files)[0];
                    return (
                      <div
                        key={gist.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
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
                        <p className="text-md font-medium text-gray-900 mb-2">
                          {gist.description || "Untitled Gist"}
                        </p>
                        {gist.description && (
                          <p className="text-sm text-gray-600 mb-2">{gist.description}</p>
                        )}
                        <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                          <p className="text-gray-500">
                            #!/usr/bin/env {firstFile.language?.toLowerCase() ?? "text"}
                          </p>
                          <p className="mt-2 italic">
                            ** {gist.description || "No description"} **
                          </p>
                        </div>
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}