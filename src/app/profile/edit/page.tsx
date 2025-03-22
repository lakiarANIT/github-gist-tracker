"use client";

import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { defaultAvatars } from "@lib/avatars";
import Navbar from "src/components/ui/Navbar"; // Updated Navbar

// Schema for form validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(160, "Bio must not exceed 160 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.user?.avatar || null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState({
    avatar: false,
    name: false,
    email: false,
    bio: false,
    password: false,
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(""); // Added for Navbar

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      bio: session?.user?.bio || "",
    },
  });

  const bioValue = watch("bio") || "";
  const bioLength = bioValue.length;
  const maxBioLength = 160;

  const handleUpdate = async (field: keyof typeof isSubmitting, data: any) => {
    setIsSubmitting((prev) => ({ ...prev, [field]: true }));
    setError(null);

    const formData = new FormData();
    formData.append(field, data);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        await update({ ...session, user: { ...session?.user, ...result.user } });
        if (field === "avatar") setAvatarPreview(result.user.avatar);
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Failed to update ${field}`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [field]: false }));
    }
  };

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

  const onSubmitPassword = (data: ProfileForm) => handleUpdate("password", data.password);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">


      <div className="pt-12 sm:pt-14 px-2 sm:px-4 py-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Edit Profile</h1>

            {error && (
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Avatar Section */}
            <div className="mb-4 sm:mb-6 p-2 sm:p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={avatarPreview || session?.user?.avatar || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                    />
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                      disabled={isSubmitting.avatar}
                    >
                      <FaPencilAlt className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  {isSubmitting.avatar && (
                    <span className="ml-4 text-sm text-gray-500">Updating...</span>
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-400"
                  disabled={isSubmitting.avatar}
                >
                  Change
                </button>
              </div>

              {/* Avatar Picker */}
              {showAvatarPicker && (
                <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <h3 className="text-md font-medium text-gray-800">Choose Avatar</h3>
                    <button
                      onClick={() => setShowAvatarPicker(false)}
                      className="text-gray-500 hover:text-gray-700"
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
                          avatarPreview === avatarUrl ? "border-blue-500" : "border-gray-200"
                        } hover:border-blue-300`}
                        onClick={() => handleAvatarSelect(avatarUrl)}
                      />
                    ))}
                  </div>
                  <label className="block mt-2 sm:mt-4 text-center text-sm text-blue-600 cursor-pointer hover:underline">
                    Upload Custom Avatar
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isSubmitting.avatar}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4 sm:space-y-6">
              {/* Name Section */}
              <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Name</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    {...register("name")}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    disabled={isSubmitting.name}
                  />
                  <button
                    onClick={() => handleUpdate("name", getValues("name"))}
                    disabled={isSubmitting.name}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-400"
                  >
                    {isSubmitting.name ? "Saving..." : "Save"}
                  </button>
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email Section */}
              <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    {...register("email")}
                    type="email"
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    disabled={isSubmitting.email}
                  />
                  <button
                    onClick={() => handleUpdate("email", getValues("email"))}
                    disabled={isSubmitting.email}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-400"
                  >
                    {isSubmitting.email ? "Saving..." : "Save"}
                  </button>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Bio Section */}
              <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bio</label>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1">
                    <textarea
                      {...register("bio")}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none text-base leading-relaxed"
                      disabled={isSubmitting.bio}
                      placeholder="Write a short bio..."
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {bioLength}/{maxBioLength}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdate("bio", getValues("bio") || "")}
                    disabled={isSubmitting.bio}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-400"
                  >
                    {isSubmitting.bio ? "Saving..." : "Save"}
                  </button>
                </div>
                {errors.bio && (
                  <p className="mt-2 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Password Section */}
              <div className="p-2 sm:p-4 border border-gray-200 rounded-lg">
                <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-2 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      New Password
                    </label>
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      disabled={isSubmitting.password}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Confirm Password
                    </label>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      disabled={isSubmitting.password}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting.password}
                    className="w-full sm:w-auto px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-400"
                  >
                    {isSubmitting.password ? "Saving..." : "Save Password"}
                  </button>
                </form>
              </div>
            </div>

            {/* Back to Profile */}
            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                onClick={() => router.push("/profile")}
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 hover:text-gray-800"
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