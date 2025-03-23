// src/components/profile/EditProfilePage.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProfileEdit } from "@hooks/profile/useProfileEdit"; // Adjusted path
import AvatarPicker from "@components/profile/AvatarPicker";

export default function EditProfilePage() {
  const router = useRouter();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const {
    status,
    avatarPreview,
    setAvatarPreview,
    error,
    isSubmitting,
    register,
    handleSubmit,
    errors,
    getValues,
    bioLength,
    maxBioLength,
    handleUpdate,
  } = useProfileEdit();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      handleUpdate("avatar", file);
      setShowAvatarPicker(false);
    }
  };

  const handleAvatarSelect = (selectedAvatar: string) => {
    setAvatarPreview(selectedAvatar);
    handleUpdate("avatar", selectedAvatar);
    setShowAvatarPicker(false);
  };

  // Updated to match ProfileForm type
  const onSubmitPassword = (data: {
    name: string;
    email: string;
    bio?: string | undefined;
    password?: string | undefined;
    confirmPassword?: string | undefined;
  }) => {
    if (data.password) { // Check if password exists since it's optional
      handleUpdate("password", data.password);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-t-blue-500 dark:border-t-blue-400 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="pt-12 sm:pt-14 px-2 sm:px-4 py-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Edit Profile</h1>

            {error && (
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm border border-red-200 dark:border-red-700">
                {error}
              </div>
            )}

            <AvatarPicker
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
              isSubmittingAvatar={isSubmitting.avatar}
              handleAvatarChange={handleAvatarChange}
              handleAvatarSelect={handleAvatarSelect}
              showAvatarPicker={showAvatarPicker}
              setShowAvatarPicker={setShowAvatarPicker}
            />

            <div className="space-y-4 sm:space-y-6">
              {/* Name Section */}
              <div className="p-2 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Name</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    {...register("name")}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    disabled={isSubmitting.name}
                  />
                  <button
                    onClick={() => handleUpdate("name", getValues("name"))}
                    disabled={isSubmitting.name}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-400 dark:disabled:border-gray-500"
                  >
                    {isSubmitting.name ? "Saving..." : "Save"}
                  </button>
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email Section */}
              <div className="p-2 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Email</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    {...register("email")}
                    type="email"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    disabled={isSubmitting.email}
                  />
                  <button
                    onClick={() => handleUpdate("email", getValues("email"))}
                    disabled={isSubmitting.email}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-400 dark:disabled:border-gray-500"
                  >
                    {isSubmitting.email ? "Saving..." : "Save"}
                  </button>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Bio Section */}
              <div className="p-2 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Bio</label>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1">
                    <textarea
                      {...register("bio")}
                      rows={3}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none text-base leading-relaxed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      disabled={isSubmitting.bio}
                      placeholder="Write a short bio..."
                    />
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {bioLength}/{maxBioLength}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdate("bio", getValues("bio") || "")}
                    disabled={isSubmitting.bio}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-400 dark:disabled:border-gray-500"
                  >
                    {isSubmitting.bio ? "Saving..." : "Save"}
                  </button>
                </div>
                {errors.bio && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
                )}
              </div>

              {/* Password Section */}
              <div className="p-2 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-2 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      New Password
                    </label>
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      disabled={isSubmitting.password}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Confirm Password
                    </label>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      disabled={isSubmitting.password}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting.password}
                    className="w-full sm:w-auto px-3 py-1 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-400 dark:disabled:border-gray-500"
                  >
                    {isSubmitting.password ? "Saving..." : "Save Password"}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                onClick={() => router.push("/profile")}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}