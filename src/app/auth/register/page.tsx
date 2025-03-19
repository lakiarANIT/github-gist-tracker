// /app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Register the user
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error || "Registration failed");
      setIsLoading(false);
      return;
    }

    // Auto-login after successful registration
    const signInResult = await signIn("credentials", {
      redirect: false, // Handle redirect manually
      email,
      password,
    });

    setIsLoading(false);

    if (signInResult?.error) {
      setError("Auto-login failed: " + signInResult.error);
    } else {
      // Redirect to profile (location prompt can be handled there)
      router.push("/profile");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-purple-700 text-white p-2 rounded disabled:bg-purple-400"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{" "}
        <a href="/auth/login" className="text-purple-700">Sign In</a>
      </p>
    </div>
  );
}