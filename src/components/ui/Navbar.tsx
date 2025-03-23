"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { FaFolder, FaChevronDown } from "react-icons/fa";
import { Gist, GistGroup } from "src/types/types";
import React from "react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  variant?: "full" | "basic";
  gistGroups?: GistGroup[];
  gists?: Gist[];
  selectedGroupId?: string;
  setSelectedGroupId?: (id: string) => void;
  isGistList?: boolean;
  onGistSelect?: (gistId: string) => void;
  onSearchSubmit?: (query: string) => void;
  isSearchVisible?: boolean; // New prop to control search visibility
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
  isSearchVisible = false, // Default to false (hidden)
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGistsOpen, setIsGistsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Gist[]>([]);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const sortedGroups = React.useMemo(() => {
    if (variant === "basic") return {};
    const sorted = [...gistGroups].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.reduce((acc, group) => {
      const firstLetter = group.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(group);
      return acc;
    }, {} as Record<string, GistGroup[]>);
  }, [variant, gistGroups]);

  const letters = variant === "full" ? Object.keys(sortedGroups).sort() : [];

  useEffect(() => {
    if (!isSearchOpen || searchQuery.length < 2) {
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }

    const filtered = gists
      .filter((gist) =>
        gist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);

    setSearchResults((prev) => {
      const prevIds = prev.map((g) => g.id).join(",");
      const newIds = filtered.map((g) => g.id).join(",");
      return prevIds === newIds ? prev : filtered;
    });
  }, [searchQuery, gists, isSearchOpen]);

  const handleSearchSelect = (gistId: string) => {
    onGistSelect(gistId);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.length >= 2) {
      onSearchSubmit(searchQuery);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-purple-900 text-white shadow-lg z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-grow min-w-0">
          <Link href="/" className="text-lg sm:text-xl font-bold hover:text-purple-300 transition-colors whitespace-nowrap">
            GGT
          </Link>

          {variant === "full" && isGistList && isHomePage && (
            <div className="relative">
              <button
                onClick={() => setIsGistsOpen(!isGistsOpen)}
                className="text-sm sm:text-base hover:text-purple-300 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                Gists
                <FaChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isGistsOpen ? "rotate-180" : ""}`} />
              </button>

              {isGistsOpen && (
                <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white text-gray-900 rounded-md shadow-lg z-10 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedGroupId("");
                      setIsGistsOpen(false);
                    }}
                    className={`w-full px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium flex items-center ${
                      selectedGroupId === "" ? "bg-purple-100 text-purple-900" : "hover:bg-gray-100"
                    }`}
                  >
                    <FaFolder className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span>All Gists</span>
                    <span className="ml-1 sm:ml-2 text-xs text-gray-500">({gists.length})</span>
                  </button>

                  {letters.map((letter) => (
                    <div key={letter}>
                      <h3 className="px-2 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold text-gray-500 bg-gray-50 border-t border-gray-200">
                        {letter}
                      </h3>
                      {sortedGroups[letter].map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            setSelectedGroupId(group.id);
                            setIsGistsOpen(false);
                          }}
                          className={`w-full px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm flex items-center ${
                            selectedGroupId === group.id ? "bg-purple-100 text-purple-900" : "hover:bg-gray-100"
                          }`}
                        >
                          <FaFolder className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <div className="truncate flex-1">
                            <span className="font-medium">{group.name}</span>
                            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-500">
                              ({group.gistIds?.length ?? 0})
                            </span>
                            <span className="block text-[10px] sm:text-xs text-gray-600 truncate">
                              @{group.owner?.login || "unknown"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0 relative">
          {isSearchVisible && ( // Only render search if isSearchVisible is true
            isSearchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search gists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-40 xs:w-48 sm:w-64 md:w-80 bg-purple-800 text-white placeholder-purple-400 border border-purple-700 rounded-md py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-900 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((gist) => (
                      <button
                        key={gist.id}
                        onClick={() => handleSearchSelect(gist.id)}
                        className="w-full px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 flex flex-col"
                      >
                        <span className="font-medium truncate">{gist.description || "No description"}</span>
                        <span className="text-[10px] text-gray-600 truncate">@{gist.owner.login}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="text-white hover:text-purple-300 focus:outline-none">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )
          )}

          <button
            className="sm:hidden text-white hover:text-purple-300 focus:outline-none flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div className={`${isOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-center gap-2 sm:gap-4 absolute sm:static top-12 xs:top-14 left-0 w-full sm:w-auto bg-purple-900 sm:bg-transparent p-2 sm:p-0 shadow-lg sm:shadow-none`}>
            {session ? (
              <>
                <Link href="/profile" className="text-sm sm:text-base hover:text-purple-300 transition-colors">
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-purple-700 text-xs sm:text-sm text-white hover:bg-purple-600 hover:shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                
                <button
                  onClick={() => signIn()}
                  className="bg-purple-700 text-xs sm:text-sm text-white hover:bg-purple-600 hover:shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
                >
                  Sign In with GitHub
                </button>
              </>
            )}
          </div>
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