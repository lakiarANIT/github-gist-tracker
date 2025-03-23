// src/components/profile/ProfileView.tsx
import Link from "next/link";
import { useSession } from "next-auth/react";
import LocationPrompt from "./LocationPrompt";
import { useProfileActions } from "@hooks/profile/useProfileActions"; // Adjusted path

interface ProfileViewProps {
  showLocationPrompt: boolean;
  setShowLocationPrompt: (show: boolean) => void;
  requestLocation: () => Promise<void>; // Explicitly passed from ProfilePage
}

export default function ProfileView({
  showLocationPrompt,
  setShowLocationPrompt,
  requestLocation,
}: ProfileViewProps) {
  const { data: session } = useSession();
  const { handleDeleteAccount } = useProfileActions(); // Only need delete action here

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={session?.user?.avatar || "/default-avatar.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover"
            onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{session?.user?.name || "Unnamed User"}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{session?.user?.bio || "No bio set yet."}</p>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {session?.user?.location
            ? `${session?.user?.location.lat}, ${session?.user?.location.lng}`
            : "Location not set"}
        </p>
        <Link
          href="/profile/edit"
          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          Edit Profile
        </Link>
      </div>
      <LocationPrompt
        showLocationPrompt={showLocationPrompt}
        setShowLocationPrompt={setShowLocationPrompt}
        requestLocation={requestLocation} // Use the prop passed from ProfilePage
      />
      <div className="mt-6">
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
        >
          Delete My Account
        </button>
      </div>
    </>
  );
}