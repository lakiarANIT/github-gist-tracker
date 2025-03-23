import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

export function useProfileEdit() {
  const { data: session, status, update } = useSession();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.user?.avatar || null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState({
    avatar: false,
    name: false,
    email: false,
    bio: false,
    password: false,
  });

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

  return {
    status,
    avatarPreview,
    setAvatarPreview,
    error,
    isSubmitting,
    register,
    handleSubmit,
    watch,
    errors,
    getValues,
    bioLength,
    maxBioLength,
    handleUpdate,
  };
}