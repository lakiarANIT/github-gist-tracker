"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { dummyGists, Gist, GistGroup, NewGist } from "./types";
import Sidebar from "./components/Sidebar";
import ProfileView from "./components/ProfileView";
import CreateGistForm from "./components/CreateGistForm";
import GistList from "./components/GistList";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [gists, setGists] = useState<Gist[]>(dummyGists);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // "" means all gists
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
          Please <a href="/auth/login" className="text-blue-600 hover:underline font-medium">sign in</a> to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
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
                />
              )}
            </div>
          </div>
          <GistList
            gists={gists}
            selectedGroupId={selectedGroupId}
            gistGroups={gistGroups}
            linkedGist={linkedGist}
          />
        </div>
      </div>
    </div>
  );
}