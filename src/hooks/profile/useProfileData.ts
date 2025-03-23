import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";
import { Gist, GistGroup } from "src/types/types";

export function useProfileData() {
  const { data: session, status } = useSession();
  const [gists, setGists] = useState<Gist[]>([]);
  const [publicGists, setPublicGists] = useState<Gist[]>([]);
  const [gistGroups, setGistGroups] = useState<GistGroup[]>([]);
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const initializeData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const tokenResponse = await fetch("/api/github-token", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");
        const { githubToken } = await tokenResponse.json();

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

        if (!session.user.location) setShowLocationPrompt(true);
      } catch (error) {
        console.error("Error initializing profile data:", error);
        if (isMounted.current) alert("Failed to initialize. Please try again.");
      }
    };

    initializeData();

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
            const response = await fetch("/api/profile/updatelocation", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ location: { lat: latitude, lng: longitude } }),
              credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to update location");
            setShowLocationPrompt(false);
            window.location.reload(); // Refresh to update session data
          } catch (error) {
            console.error("Error updating location:", error);
            alert("Failed to update location. Please try again.");
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

  return {
    status,
    session,
    gists,
    setGists,
    publicGists,
    setPublicGists,
    gistGroups,
    setGistGroups,
    octokit,
    githubUsername,
    showLocationPrompt,
    setShowLocationPrompt,
    requestLocation,
  };
}