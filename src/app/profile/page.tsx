"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup, NewGist } from "./types";
import Sidebar from "./components/Sidebar";
import ProfileView from "./components/ProfileView";
import CreateGistForm from "./components/CreateGistForm";
import GistList from "./components/GistList";
import PublicGistList from "src/components/home/PublicGistList";
import Navbar from "@components/ui/Navbar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [gists, setGists] = useState<Gist[]>([]);
  const [publicGists, setPublicGists] = useState<Gist[]>([]);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // "" for All Gists
  const [activeTab, setActiveTab] = useState<"profile" | "postGist">("profile");
  const [newGist, setNewGist] = useState<NewGist>({
    description: "",
    files: [{ filename: "", content: "", language: "Text" }],
    isPublic: false,
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [linkedGist, setLinkedGist] = useState<string | null>(null);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
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

        await fetchGroupsAndGists();
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

  const fetchGroupsAndGists = async () => {
    try {
      const groupsResponse = await fetch("/api/gist-groups", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
      const groupsData = await groupsResponse.json();
      console.log("fetchGroupsAndGists - Response:", groupsData); // Debug
      if (isMounted.current) {
        setGistGroups(groupsData.groups || []);
        // Don’t set gists here; let fetchGistsForGroup handle it
      }

      const publicResponse = await fetch("/api/public-gist-groups", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!publicResponse.ok) throw new Error("Failed to fetch public gists");
      const publicData = await publicResponse.json();
      console.log("fetchPublicGists - Response:", publicData); // Debug
      if (isMounted.current) setPublicGists(publicData.gists || []);
    } catch (error) {
      console.error("Error fetching groups and gists:", error);
      if (isMounted.current) {
        setGistGroups([]);
        setGists([]);
      }
    }
  };

  useEffect(() => {
    const fetchGistsForGroup = async () => {
      if (!isMounted.current || status !== "authenticated" || !shouldFetchGists || !octokit) return;

      try {
        let gistIds: string[] = [];

        if (selectedGroupId === "") {
          // For "All Gists," aggregate all gistIds from gistGroups
          console.log("Aggregating all gistIds from groups for 'All Gists'"); // Debug
          gistIds = Array.from(
            new Set(
              gistGroups.flatMap((group) =>
                (group.gistIds || []).map((gist) =>
                  typeof gist === "string" ? gist : gist.id
                )
              )
            )
          ); // Handle both string and object cases
          if (gistIds.length === 0) {
            console.log("No group gists found; fetching all user gists from GitHub"); // Debug
            const userGistsResponse = await octokit.request("GET /gists", {
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            });
            gistIds = userGistsResponse.data.map((gist) => gist.id);
          }
        } else if (selectedGroupId === "my-gists") {
          console.log("Fetching from: /api/my-gists"); // Debug
          const response = await fetch("/api/my-gists", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to fetch from /api/my-gists");
          const data = await response.json();
          gistIds = (data.gists || []).map((gist: any) =>
            typeof gist === "string" ? gist : gist.id
          );
        } else {
          console.log(`Fetching from: /api/gist-groups/${selectedGroupId}/gists`); // Debug
          const response = await fetch(`/api/gist-groups/${selectedGroupId}/gists`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error(`Failed to fetch from /api/gist-groups/${selectedGroupId}/gists`);
          const data = await response.json();
          gistIds = (data.gists || []).map((gist: any) =>
            typeof gist === "string" ? gist : gist.id
          );
        }

        console.log("Gist IDs to fetch:", gistIds); // Debug

        // Fetch full gist details from GitHub
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
  }, [selectedGroupId, status, shouldFetchGists, octokit, gistGroups]); // All dependencies included

  const handleCreateGroup = async (groupName: string) => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/gist-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create group");
      const { group } = await response.json();

      if (isMounted.current) {
        setGistGroups((prev) => [...prev, group]);
        setSelectedGroupId(group.id); // Auto-select the new group
        setNewGroupName("");
        setIsGroupDropdownOpen(false);
        await fetchGroupsAndGists(); // Refresh all data
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
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
      await fetchGroupsAndGists();
      alert("Gist deleted successfully!");
    } catch (error) {
      console.error("Error deleting Gist:", error);
      alert("Failed to delete gist.");
    } finally {
      setShouldFetchGists(true);
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
          <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
            sign in
          </a>{" "}
          to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <Navbar
        gistGroups={gistGroups}
        gists={gists}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
      />
      <div className="max-w-5xl mx-auto flex gap-6">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          gistGroups={gistGroups}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          isGroupDropdownOpen={isGroupDropdownOpen}
          setIsGroupDropdownOpen={setIsGroupDropdownOpen}
        />
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              {activeTab === "profile" ? (
                <ProfileView
                  showLocationPrompt={showLocationPrompt}
                  setShowLocationPrompt={setShowLocationPrompt}
                  requestLocation={requestLocation}
                />
              ) : (
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
                  setActiveTab={setActiveTab}
                  githubUsername={githubUsername}
                  onCreateGroup={handleCreateGroup}
                />
              )}
            </div>
          </div>
          <GistList
            gists={gists}
            selectedGroupId={selectedGroupId}
            gistGroups={gistGroups}
            linkedGist={linkedGist}
            onDeleteGist={handleDeleteGist}
          />
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