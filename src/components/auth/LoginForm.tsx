
"use client";
interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  isLoading: boolean;
  handleCredentialsSignIn: (e: React.FormEvent) => Promise<void>;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  handleCredentialsSignIn,
}: LoginFormProps) {
  return (
    <form onSubmit={handleCredentialsSignIn} className="space-y-4">
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-800 disabled:bg-purple-400 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}