// src/components/ui/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { FaFolder, FaChevronDown } from "react-icons/fa";
import { Gist, GistGroup } from "src/app/profile/types";
import React from "react";
import { usePathname } from "next/navigation"; // Add this import

interface NavbarProps {
  gistGroups: GistGroup[];
  gists: Gist[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
}

export default function Navbar({ gistGroups, gists, selectedGroupId, setSelectedGroupId }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGistsOpen, setIsGistsOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname(); // Get current route
  const isHomePage = pathname === "/"; // Check if on home page

  const sortedGroups = React.useMemo(() => {
    const sorted = [...gistGroups].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.reduce((acc, group) => {
      const firstLetter = group.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(group);
      return acc;
    }, {} as Record<string, GistGroup[]>);
  }, [gistGroups]);

  const letters = Object.keys(sortedGroups).sort();

  return (
    <nav className="fixed top-0 left-0 w-full bg-purple-900 text-white shadow-lg z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6 flex-grow">
          <Link href="/" className="text-xl font-bold hover:text-purple-300 transition-colors whitespace-nowrap">
            GGT
          </Link>
          
          {/* Only show Gists dropdown on home page */}
          {isHomePage && (
            <div className="relative">
              <button
                onClick={() => setIsGistsOpen(!isGistsOpen)}
                className="text-base hover:text-purple-300 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                Gists
                <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGistsOpen ? "rotate-180" : ""}`} />
              </button>

              {isGistsOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white text-gray-900 rounded-md shadow-lg z-10 max-h-[70vh] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedGroupId("");
                      setIsGistsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center ${
                      selectedGroupId === "" ? "bg-purple-100 text-purple-900" : "hover:bg-gray-100"
                    }`}
                  >
                    <FaFolder className="w-4 h-4 mr-2" />
                    <span>All Gists</span>
                    <span className="ml-2 text-xs text-gray-500">({gists.length})</span>
                  </button>

                  {letters.map((letter) => (
                    <div key={letter}>
                      <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-t border-gray-200">
                        {letter}
                      </h3>
                      {sortedGroups[letter].map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            setSelectedGroupId(group.id);
                            setIsGistsOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center ${
                            selectedGroupId === group.id ? "bg-purple-100 text-purple-900" : "hover:bg-gray-100"
                          }`}
                        >
                          <FaFolder className="w-4 h-4 mr-2" />
                          <div className="truncate flex-1">
                            <span className="font-medium">{group.name}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({group.gistIds?.length ?? 0})
                            </span>
                            <span className="block text-xs text-gray-600 truncate">@{group.owner.login}</span>
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

        <div className="flex items-center gap-6">
          {isSearchOpen ? (
            <input
              type="text"
              placeholder="Search gists..."
              className="w-80 bg-purple-800 text-white placeholder-purple-400 border border-purple-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              onBlur={() => setIsSearchOpen(false)}
              autoFocus
            />
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="text-white hover:text-purple-300 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          <button
            className="sm:hidden text-white hover:text-purple-300 focus:outline-none flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div className={`${isOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-center gap-4 absolute sm:static top-14 left-0 w-full sm:w-auto bg-purple-900 sm:bg-transparent p-4 sm:p-0 shadow-lg sm:shadow-none`}>
            {session ? (
              <Link href="/profile" className="text-base hover:text-purple-300 transition-colors">
                Profile
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="text-sm bg-transparent border-2 border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-purple-900 px-4 py-1.5 rounded-md active:scale-95 transition-all duration-300 whitespace-nowrap"
              >
                Sign Up
              </Link>
            )}
            <button
              onClick={() => (session ? signOut() : signIn())}
              className="bg-purple-700 text-sm text-white hover:bg-purple-600 hover:shadow-md px-4 py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
            >
              {session ? "Sign Out" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}