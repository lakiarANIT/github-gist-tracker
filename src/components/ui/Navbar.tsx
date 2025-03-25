"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
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
    isOpen,
    setIsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isGistsOpen,
    setIsGistsOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
  } = useNavbarState(gists);

  const sortedGroups = React.useMemo(() => {
    if (variant === "basic") return {};
    return sortAndGroupGists(gistGroups);
  }, [variant, gistGroups]);

  const letters = variant === "full" ? Object.keys(sortedGroups).sort() : [];

  return (
    <nav className="fixed top-0 left-0 w-full bg-purple-900 dark:bg-purple-950 text-white shadow-lg z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center flex-wrap">
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

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0 relative">
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

          <button
            className="sm:hidden text-white hover:text-purple-300 dark:hover:text-purple-200 focus:outline-none flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <AuthControls session={session} isOpen={isOpen} />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 360px) {
          nav {
            font-size: 14px;
          }
          .container {
            padding-left: 8px;
            padding-right: 8px;
          }
        }
        @media (max-width: 315px) {
          nav {
            font-size: 12px;
          }
          .container {
            padding-left: 4px;
            padding-right: 4px;
          }
          .relative .w-56 {
            width: 90vw;
            left: 4px;
          }
        }
      `}</style>
    </nav>
  );
}