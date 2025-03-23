import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/core";

export function useAuth() {
  const { data: session, status } = useSession();
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [githubUsername, setGithubUsername] = useState<string>("");

  useEffect(() => {
    const initializeAuth = async () => {
      if (status !== "authenticated" || !session) return;

      try {
        const tokenResponse = await fetch("/api/github-token", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!tokenResponse.ok) throw new Error("Failed to fetch GitHub token");
        const { githubToken } = await tokenResponse.json();

        if (!githubToken) throw new Error("GitHub token not found");

        const octo = new Octokit({ auth: githubToken });
        setOctokit(octo);

        const userResponse = await octo.request("GET /user", {
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        });
        setGithubUsername(userResponse.data.login);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setOctokit(null);
        setGithubUsername("");
      }
    };

    initializeAuth();
  }, [status, session]);

  return { status, session, octokit, githubUsername };
}