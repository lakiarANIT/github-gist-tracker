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
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
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
      if (status === "authenticated" && session?.user?.email) {
        try {
          const tokenResponse = await fetch("/api/github-token", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Failed to fetch GitHub token: ${errorText}`);
          }
          const tokenData = await tokenResponse.json();
          const { githubToken } = tokenData;
          if (githubToken) {
            const okt = new Octokit({ auth: githubToken });
            setOctokit(okt);
            const userResponse = await okt.request("GET /user", {
              headers: { "X-GitHub-Api-Version": "2022-11-28" },
            });
            if (isMounted.current) setGithubUsername(userResponse.data.login);
          } else {
            alert("Please link your GitHub account to create Gists.");
          }

          // Fetch user's gists
          const groupsResponse = await fetch("/api/gist-groups", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!groupsResponse.ok) throw new Error("Failed to fetch Gist groups");
          const groupsData = await groupsResponse.json();
          if (isMounted.current) {
            setGistGroups(groupsData.groups || []);
            setGists(groupsData.gists || []);
          }

          // Fetch public gists
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
      }
    };

    initializeOctokitAndGroups();

    if (status === "authenticated" && !session?.user?.location) {
      setShowLocationPrompt(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, [status, session]);

  useEffect(() => {
    const fetchGists = async () => {
      if (!isMounted.current || status !== "authenticated" || !shouldFetchGists) return;

      try {
        let url = "/api/gist-groups";
        if (selectedGroupId === "my-gists") {
          url = "/api/my-gists";
        } else if (selectedGroupId) {
          url = `/api/gist-groups/${selectedGroupId}/gists`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch Gists: ${errorText}`);
        }
        const data = await response.json();
        if (isMounted.current) {
          setGists(data.gists || []);
          if (selectedGroupId) setGistGroups(data.groups || []);
        }
      } catch (error) {
        console.error("Error fetching Gists:", error);
        if (isMounted.current) setGists([]);
      }
    };

    fetchGists();
  }, [selectedGroupId, status, shouldFetchGists]);

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
      console.log("[DELETE] Octokit not initialized, aborting deletion");
      alert("Octokit not initialized.");
      return;
    }

    console.log("[DELETE] Preparing to delete Gist:", gistId);
    if (!confirm("Are you sure you want to delete this gist?")) {
      console.log("[DELETE] Deletion cancelled by user");
      return;
    }

    setShouldFetchGists(false);
    console.log("[DELETE] Disabled Gist fetching during deletion");

    try {
      console.log("[DELETE] Sending DELETE request to GitHub for Gist:", gistId);
      const deleteResponse = await octokit.request("DELETE /gists/{gist_id}", {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });

      if (deleteResponse.status !== 204) {
        throw new Error(`GitHub API returned status ${deleteResponse.status}`);
      }
      console.log("[DELETE] Gist successfully deleted from GitHub");

      const affectedGroups = gistGroups.filter((group) =>
        group.gistIds?.some((gist) => gist.id === gistId)
      );
      if (affectedGroups.length > 0) {
        console.log("[DELETE] Updating affected groups:", affectedGroups);
        await Promise.all(
          affectedGroups.map(async (group) => {
            console.log("[DELETE] Patching group:", group.id);
            const response = await fetch(`/api/gist-groups/${group.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gistIdToRemove: gistId }),
              credentials: "include",
            });

            if (!response.ok) {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                if (response.status === 404) {
                  console.log(`[DELETE] Group ${group.id} not found, removing from local state`);
                  if (isMounted.current) {
                    setGistGroups((prevGroups) => prevGroups.filter((g) => g.id !== group.id));
                  }
                  return;
                }
                throw new Error(`Failed to update group ${group.id}: ${errorData.error || response.statusText}`);
              } else {
                const text = await response.text();
                console.log("[DELETE] Non-JSON response from server (likely 404 page):", text.slice(0, 200));
                if (response.status === 404) {
                  console.log(`[DELETE] Group ${group.id} endpoint returned 404, treating as not found`);
                  if (isMounted.current) {
                    setGistGroups((prevGroups) => prevGroups.filter((g) => g.id !== group.id));
                  }
                  return;
                }
                throw new Error(`Failed to update group ${group.id}: Received non-JSON response (status ${response.status})`);
              }
            }
            const data = await response.json();
            console.log("[DELETE] Group updated successfully:", group.id, data.group);
            if (isMounted.current) {
              setGistGroups((prevGroups) =>
                prevGroups.map((g) =>
                  g.id === group.id ? { ...g, gistIds: data.group.gistIds } : g
                )
              );
            }
          })
        );
      }

      if (isMounted.current) {
        setGists((prevGists) => prevGists.filter((gist) => gist.id !== gistId));
        setPublicGists((prevPublic) => prevPublic.filter((gist) => gist.id !== gistId)); // Update public list too
        console.log("[DELETE] Local Gist state updated");
      }

      console.log("[DELETE] Refetching Gists after deletion");
      const response = await fetch("/api/gist-groups", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refetch Gists: ${errorText}`);
      }
      const data = await response.json();
      if (isMounted.current) {
        setGists(data.gists || []);
        setGistGroups(data.groups || []);
        console.log("[DELETE] Gists refetched and updated:", data.gists.length);
      }

      console.log("[DELETE] Gist deletion completed");
      alert("Gist deleted successfully!");
    } catch (error) {
      console.error("[DELETE] Error deleting Gist:", error);
      let errorMessage = "Failed to delete gist.";
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
      }
      console.log("[DELETE] Displaying error to user:", errorMessage);
      alert(errorMessage);
    } finally {
      setShouldFetchGists(true);
      console.log("[DELETE] Re-enabled Gist fetching");
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
          Please <a href="/auth/login" className="text-blue-600 hover:underline font-medium">sign in</a> to view your profile.
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