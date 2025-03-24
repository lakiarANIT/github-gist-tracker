import { signIn } from "next-auth/react";

export async function signInWithGitHub(callbackUrl: string) {
  return signIn("github", { redirect: false, callbackUrl });
}

export async function signInWithCredentials(email: string, password: string) {
  return signIn("credentials", { redirect: false, email, password });
}