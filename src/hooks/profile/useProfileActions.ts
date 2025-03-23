import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function useProfileActions() { // No need for setShowLocationPrompt here
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This will also delete all your gist groups and cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  return { handleDeleteAccount };
}