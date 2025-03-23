import { FaPencilAlt } from "react-icons/fa";
import { defaultAvatars } from "@lib/avatars";

interface AvatarPickerProps {
  avatarPreview: string | null;
  setAvatarPreview: (preview: string | null) => void;
  isSubmittingAvatar: boolean;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarSelect: (avatar: string) => void;
  showAvatarPicker: boolean;
  setShowAvatarPicker: (show: boolean) => void;
}

export default function AvatarPicker({
  avatarPreview,
  setAvatarPreview,
  isSubmittingAvatar,
  handleAvatarChange,
  handleAvatarSelect,
  showAvatarPicker,
  setShowAvatarPicker,
}: AvatarPickerProps) {
  return (
    <div className="mb-4 sm:mb-6 p-2 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
            />
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute bottom-0 right-0 bg-gray-200 dark:bg-gray-700 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              disabled={isSubmittingAvatar}
            >
              <FaPencilAlt className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          {isSubmittingAvatar && (
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">Updating...</span>
          )}
        </div>
        <button
          onClick={() => setShowAvatarPicker(true)}
          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-400 dark:disabled:border-gray-500"
          disabled={isSubmittingAvatar}
        >
          Change
        </button>
      </div>

      {showAvatarPicker && (
        <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Choose Avatar</h3>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {defaultAvatars.map((avatarUrl, index) => (
              <img
                key={index}
                src={avatarUrl}
                alt={`Avatar ${index + 1}`}
                className={`w-12 h-12 rounded-full cursor-pointer object-cover border ${
                  avatarPreview === avatarUrl ? "border-blue-500 dark:border-blue-400" : "border-gray-200 dark:border-gray-600"
                } hover:border-blue-300 dark:hover:border-blue-500`}
                onClick={() => handleAvatarSelect(avatarUrl)}
              />
            ))}
          </div>
          <label className="block mt-2 sm:mt-4 text-center text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
            Upload Custom Avatar
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isSubmittingAvatar}
            />
          </label>
        </div>
      )}
    </div>
  );
}