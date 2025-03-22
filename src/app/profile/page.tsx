// ProfilePage.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup, NewGist } from "src/types/types";
import ProfileView from "./components/ProfileView";
import CreateGistForm from "@app/gist/components/CreateGistForm";
import GistList from "@app/gist/components/GistList";
import PublicGistList from "src/components/home/PublicGistList";
import Navbar from "@components/ui/Navbar";
import { FaFolder } from "react-icons/fa";
import ManageGistGroups from "@app/gist/components/ManageGistGroups"; // Import the corrected component

const ManageGistGroupsContainer = ({
  gistGroups,
  setGistGroups,
}: {
  gistGroups: GistGroup[];
  setGistGroups: React.Dispatch<React.SetStateAction<GistGroup[]>>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
      >
        {isExpanded ? "Hide Manage Groups" : "Manage Groups"}
      </button>
      {isExpanded && (
        <div className="mt-4">
          <ManageGistGroups gistGroups={gistGroups} setGistGroups={setGistGroups} />
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [gists, setGists] = useState<Gist[]>([]);
  const [publicGists, setPublicGists] = useState<Gist[]>([]);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // "" means "All Gists"
  const [showCreateGist, setShowCreateGist] = useState(false);
  const [newGist, setNewGist] = useState<NewGist>({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [linkedGist, setLinkedGist] = useState<string | null>(null);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [shouldFetchGists, setShouldFetchGists] = useState(true);
  const [githubUsername, setGithubUsername] = useState<string>("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const initializeOctokitAndGroups = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const tokenResponse = await fetch("/api/github-token", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");
        const tokenData = await tokenResponse.json();
        const { githubToken } = tokenData;

        if (!githubToken) {
          if (isMounted.current) alert("Please link your GitHub account to create Gists.");
          return;
        }

        const okt = new Octokit({ auth: githubToken });
        setOctokit(okt);

        const userResponse = await okt.request("GET /user", {
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        });
        if (isMounted.current) setGithubUsername(userResponse.data.login);

        const groupsResponse = await fetch("/api/gist-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
        const groupsData = await groupsResponse.json();
        if (isMounted.current) setGistGroups(groupsData.groups || []);

        const publicResponse = await fetch("/api/public-gist-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!publicResponse.ok) throw new Error("Failed to fetch public gists");
        const publicData = await publicResponse.json();
        if (isMounted.current) setPublicGists(publicData.gists || []);
      } catch (error) {
        console.error("Error initializing:", error);
        if (isMounted.current) alert("Failed to initialize. Please try again.");
      }

      if (status === "authenticated" && !session?.user?.location) {
        setShowLocationPrompt(true);
      }
    };

    initializeOctokitAndGroups();

    return () => {
      isMounted.current = false;
    };
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
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            if (response.ok) {
              setShowLocationPrompt(false);
              window.location.reload();
            }
          } catch (error) {
            console.error("Error updating location:", error);
            alert("Failed to update location.");
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

  const GroupList = ({
    gistGroups,
    selectedGroupId,
    setSelectedGroupId,
  }: {
    gistGroups: GistGroup[];
    selectedGroupId: string;
    setSelectedGroupId: (id: string) => void;
  }) => {
    const nonEmptyGroups = gistGroups.filter((group) => (group.gistIds?.length ?? 0) > 0);
    const sortedGroups = [...nonEmptyGroups].sort((a, b) => a.name.localeCompare(b.name));
    const groupedGroups = sortedGroups.reduce((acc, group) => {
      const firstLetter = group.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(group);
      return acc;
    }, {} as Record<string, GistGroup[]>);

    const letters = Object.keys(groupedGroups).sort();

    return (
      <div className="w-full max-h-[50vh] overflow-y-auto bg-white rounded-md shadow-sm border border-gray-200">
        <button
          onClick={() => setSelectedGroupId("")}
          className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center ${
            selectedGroupId === "" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-900"
          }`}
        >
          <FaFolder className="w-4 h-4 mr-2" />
          <span>All Gists</span>
        </button>
        {letters.map((letter) => (
          <div key={letter}>
            <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-t border-gray-200">
              {letter}
            </h3>
            {groupedGroups[letter].map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center ${
                  selectedGroupId === group.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                <FaFolder className="w-4 h-4 mr-2" />
                <div className="truncate flex-1">
                  <span className="font-medium">{group.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({group.gistIds?.length ?? 0})</span>
                  <span className="block text-xs text-gray-600 truncate">@{group.owner?.login || "unknown"}</span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteGist = async (gistId: string) => {
    if (!octokit) {
      alert("GitHub integration not initialized.");
      return;
    }

    if (!confirm("Are you sure you want to delete this gist?")) return;

    setShouldFetchGists(false);

    try {
      await octokit.request("DELETE /gists/{gist_id}", {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });

      const affectedGroups = gistGroups.filter((group) =>
        group.gistIds?.some((gist) => (typeof gist === "string" ? gist : gist.id) === gistId)
      );
      if (affectedGroups.length > 0) {
        await Promise.all(
          affectedGroups.map(async (group) => {
            const response = await fetch(`/api/gist-groups/${group.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gistIdToRemove: gistId }),
              credentials: "include",
            });
            if (!response.ok) {
              if (response.status === 404) {
                setGistGroups((prev) => prev.filter((g) => g.id !== group.id));
                return;
              }
              throw new Error("Failed to update group");
            }
            const data = await response.json();
            setGistGroups((prev) =>
              prev.map((g) => (g.id === group.id ? { ...g, gistIds: data.group.gistIds } : g))
            );
          })
        );
      }

      setGists((prev) => prev.filter((gist) => gist.id !== gistId));
      setPublicGists((prev) => prev.filter((gist) => gist.id !== gistId));
      alert("Gist deleted successfully!");
    } catch (error) {
      console.error("Error deleting Gist:", error);
      alert("Failed to delete gist.");
    } finally {
      setShouldFetchGists(true);
    }
  };

  const handleCreateGroup = async (groupName: string): Promise<GistGroup> => {
    if (!groupName.trim()) {
      throw new Error("Group name cannot be empty");
    }

    try {
      const response = await fetch("/api/gist-groups/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create group: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const group: GistGroup = data.group;

      if (!group || !group.id) {
        throw new Error("API did not return a valid group with an ID");
      }

      if (isMounted.current) {
        setGistGroups((prev) => [...prev, group]);
        setSelectedGroupId(group.id);
        setNewGroupName("");
      }

      return group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw new Error(`Failed to create group: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  useEffect(() => {
    const fetchGistsForGroup = async () => {
      if (!isMounted.current || status !== "authenticated" || !shouldFetchGists || !octokit) return;

      try {
        let gistIds: string[] = [];
        if (selectedGroupId === "") {
          const userGistsResponse = await octokit.request("GET /gists", {
            headers: { "X-GitHub-Api-Version": "2022-11-28" },
          });
          gistIds = userGistsResponse.data.map((gist: any) => gist.id);
        } else if (selectedGroupId === "my-gists") {
          const response = await fetch("/api/my-gists", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to fetch from /api/my-gists");
          const data = await response.json();
          gistIds = (data.gists || []).map((gist: any) => (typeof gist === "string" ? gist : gist.id));
        } else {
          const response = await fetch(`/api/gist-groups/${selectedGroupId}/gists`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error(`Failed to fetch from /api/gist-groups/${selectedGroupId}/gists`);
          const data = await response.json();
          gistIds = (data.gists || []).map((gist: any) => (typeof gist === "string" ? gist : gist.id));
        }

        const gistPromises = gistIds.map((gistId) =>
          octokit.request("GET /gists/{gist_id}", {
            gist_id: gistId,
            headers: { "X-GitHub-Api-Version": "2022-11-28" },
          })
        );
        const gistResponses = await Promise.allSettled(gistPromises);
        const fullGists = gistResponses
          .filter((res): res is PromiseFulfilledResult<any> => res.status === "fulfilled")
          .map((res) => res.value.data)
          .filter((gist, index, self) => gist.id && self.findIndex((g) => g.id === gist.id) === index);

        if (isMounted.current) setGists(fullGists);
      } catch (error) {
        console.error("Error fetching Gists:", error);
        if (isMounted.current) setGists([]);
      }
    };

    fetchGistsForGroup();
  }, [selectedGroupId, status, shouldFetchGists, octokit]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-base sm:text-lg text-gray-700">
          Please{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
            sign in
          </a>{" "}
          to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
     
      <div className="pt-[4rem] max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6">
          <ProfileView
            showLocationPrompt={showLocationPrompt}
            setShowLocationPrompt={setShowLocationPrompt}
            requestLocation={requestLocation}
          />
        </div>
        <ManageGistGroupsContainer gistGroups={gistGroups} setGistGroups={setGistGroups} />
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6">
          <button
            onClick={() => setShowCreateGist(!showCreateGist)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            {showCreateGist ? "Hide Create Gist" : "Create Gist"}
          </button>
          {showCreateGist && (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create a New Gist</h2>
              <CreateGistForm
                newGist={newGist}
                setNewGist={setNewGist}
                gistGroups={gistGroups}
                selectedGroupId={selectedGroupId}
                setSelectedGroupId={setSelectedGroupId}
                newGroupName={newGroupName}
                setNewGroupName={setNewGroupName}
                linkedGist={linkedGist}
                setLinkedGist={setLinkedGist}
                gists={gists}
                octokit={octokit}
                setGists={setGists}
                setGistGroups={setGistGroups}
                setActiveTab={() => {}} // No-op
                githubUsername={githubUsername}
                onCreateGroup={handleCreateGroup}
              />
            </div>
          )}
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Groups</h2>
          <GroupList
            gistGroups={gistGroups}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
          />
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
          <GistList
            gists={gists}
            selectedGroupId={selectedGroupId}
            gistGroups={gistGroups}
            linkedGist={linkedGist}
            onDeleteGist={handleDeleteGist}
          />
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto mb-4 sm:mb-6">
          <PublicGistList
            gists={publicGists}
            selectedGroupId={selectedGroupId}
            gistGroups={gistGroups}
            octokit={octokit}
            githubUsername={githubUsername}
            excludeUserGists={true}
          />
        </div>
      </div>
    </div>
  );
}