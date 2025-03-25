"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Gist, GistGroup } from "src/types/types";
import { useNavbarState } from "@hooks/navbar/useNavbarState";
import { sortAndGroupGists } from "@utils/gistUtils";
import { GistDropdown } from "@components/ui/navbar/GistDropdown";
import { SearchBar } from "@components/ui/navbar/SearchBar";
import { AuthControls } from "@components/ui/navbar/AuthControls";

interface NavbarProps {
  variant?: "full" | "basic";
  gistGroups?: GistGroup[];
  gists?: Gist[];
  selectedGroupId?: string;
  setSelectedGroupId?: (id: string) => void;
  isGistList?: boolean;
  onGistSelect?: (gistId: string) => void;
  onSearchSubmit?: (query: string) => void;
  isSearchVisible?: boolean;
}

export default function Navbar({
  variant = "full",
  gistGroups = [],
  gists = [],
  selectedGroupId = "",
  setSelectedGroupId = () => {},
  isGistList = false,
  onGistSelect = () => {},
  onSearchSubmit = () => {},
  isSearchVisible = false,
}: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const {
    isSearchOpen,
    setIsSearchOpen,
    isGistsOpen,
    setIsGistsOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
  } = useNavbarState(gists);

  // const [theme, setTheme] = useState<string>("system");

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme") || "system";
  //   setTheme(savedTheme);
  //   if (savedTheme === "dark") {
  //     document.documentElement.classList.add("dark");
  //   } else if (savedTheme === "light") {
  //     document.documentElement.classList.remove("dark");
  //   } else {
  //     // System: Match prefers-color-scheme
  //     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //     document.documentElement.classList.toggle("dark", prefersDark);
  //   }
  // }, []);

  // const toggleTheme = () => {
  //   const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  //   setTheme(newTheme);
  //   localStorage.setItem("theme", newTheme);
  //   if (newTheme === "dark") {
  //     document.documentElement.classList.add("dark");
  //   } else if (newTheme === "light") {
  //     document.documentElement.classList.remove("dark");
  //   } else {
  //     // System: Match prefers-color-scheme
  //     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //     document.documentElement.classList.toggle("dark", prefersDark);
  //   }
  // };

  const sortedGroups = React.useMemo(() => {
    if (variant === "basic") return {};
    return sortAndGroupGists(gistGroups);
  }, [variant, gistGroups]);

  const letters = variant === "full" ? Object.keys(sortedGroups).sort() : [];

  return (
    <nav className="fixed top-0 left-0 w-full bg-purple-900 dark:bg-purple-950 text-white shadow-lg z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-grow min-w-0">
          <Link href="/" className="text-lg sm:text-xl font-bold hover:text-purple-300 dark:hover:text-purple-200 transition-colors whitespace-nowrap">
            GGT
          </Link>
          {variant === "full" && isGistList && isHomePage && (
            <GistDropdown
              isGistsOpen={isGistsOpen}
              setIsGistsOpen={setIsGistsOpen}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              sortedGroups={sortedGroups}
              letters={letters}
              totalGists={gists.length}
            />
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
          {isSearchVisible && (
            <SearchBar
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              onSearchSubmit={onSearchSubmit}
              onGistSelect={onGistSelect}
            />
          )}
          {/* <button
            onClick={toggleTheme}
            className="text-white hover:text-purple-300 dark:hover:text-purple-200 focus:outline-none flex-shrink-0"
          >
            {theme === "light" ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-9-7a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm17 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-2.657-6.343a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-12 12a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM6.343 4.929a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm12 12a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM12 6a6 6 0 100 12 6 6 0 000-12z" />
              </svg>
            ) : theme === "dark" ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-8a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM3 12a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm16.707-7.293a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM5.293 17.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM5.293 6.707a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm12 12a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button> */}
          <AuthControls session={session} />
        </div>
      </div>
    </nav>
  );
}