import { ReactNode } from "react";

export default function Body({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
      {children}
    </div>
  );
}