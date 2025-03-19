"use client"; 

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); // Mobile menu state
    const [isLoggedIn, setIsLoggedIn] = useState(false); // User authentication state
    const [isVisible, setIsVisible] = useState(true); // Navbar visibility state
    const [lastScrollY, setLastScrollY] = useState(0); // Last scroll position
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Search input state

    // Scroll handler to hide/show navbar
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 50);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed top-0 left-0 w-full bg-purple-900 text-white shadow-lg transition-transform duration-300 z-50 ${isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                {/* Left Side: Expanding Logo & Gists */}
                <div className="flex items-center gap-3 sm:gap-6 flex-grow">
                    <Link
                        href="/"
                        className="text-lg sm:text-xl font-bold hover:text-purple-300 transition-colors whitespace-nowrap"
                    >
                        GGT
                    </Link>
                    <Link
                        href="/gists"
                        className="text-sm sm:text-base hover:text-purple-300 transition-colors whitespace-nowrap"
                    >
                        Gists
                    </Link>
                </div>

                {/* Right Side: Search, Hamburger, Sign In, Sign Up */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Search (Inline in Navbar) */}
                    <div className="flex-shrink-0">
                        {isSearchOpen ? (
                            <input
                                type="text"
                                placeholder="Search gists..."
                                className="w-80 sm:w-90 md:w-80 lg:w-142 bg-purple-800 text-white placeholder-purple-400 border border-purple-700 rounded-md py-2 sm:py-3 md:py-4 px-2 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 h-8 sm:h-10 md:h-10 lg:h-10"
                                onBlur={() => setIsSearchOpen(false)} // Close on blur
                                autoFocus
                            />

                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="text-white hover:text-purple-300 focus:outline-none"
                            >
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Hamburger Button (Mobile) */}
                    <button
                        className="sm:hidden text-white hover:text-purple-300 focus:outline-none flex-shrink-0"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>

                    {/* Navigation Links (Hidden on Mobile unless Hamburger is Open) */}
                    <div
                        className={`${isOpen ? "flex" : "hidden"
                            } sm:flex flex-col sm:flex-row items-center gap-3 sm:gap-4 absolute sm:static top-12 left-0 w-full sm:w-auto bg-purple-900 sm:bg-transparent p-4 sm:p-0 shadow-lg sm:shadow-none`}
                    >
                        {isLoggedIn ? (
                            <Link
                                href="/profile"
                                className="text-sm sm:text-base hover:text-purple-300 transition-colors"
                            >
                                Profile
                            </Link>
                        ) : (
                            <Link
                                href="/auth/signup"
                                className="text-xs sm:text-sm md:text-base bg-transparent border-2 border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-purple-900 px-4 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md active:scale-95 transition-all duration-300 whitespace-nowrap w-auto sm:w-fit"
                            >
                                Sign Up
                            </Link>
                        )}
                        <button
                            onClick={() => setIsLoggedIn(!isLoggedIn)}
                            className="bg-purple-700 text-xs sm:text-sm md:text-base text-white hover:bg-purple-600 hover:shadow-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap w-auto sm:w-fit"
                        >
                            {isLoggedIn ? "Sign Out" : "Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
