import Link from "next/link";
import { useSession } from "next-auth/react";

interface ProfileViewProps {
  showLocationPrompt: boolean;
  setShowLocationPrompt: (show: boolean) => void;
  requestLocation: () => Promise<void>;
}

export default function ProfileView({ showLocationPrompt, setShowLocationPrompt, requestLocation }: ProfileViewProps) {
  const { data: session } = useSession();

  return (
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
          <h1 className="text-lg font-semibold text-gray-900">{session?.user?.name || "Unnamed User"}</h1>
          <p className="text-sm text-gray-600">{session?.user?.email}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">{session?.user?.bio || "No bio set yet."}</p>
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
          <p className="text-sm text-amber-800 mb-3">Share your location to enhance your experience</p>
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
  );
}