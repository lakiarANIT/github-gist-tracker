import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

interface AuthControlsProps {
    session: Session | null;
    isOpen: boolean;
}

export function AuthControls({ session, isOpen }: AuthControlsProps) {
    return (
        <div className={`${isOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-center gap-2 sm:gap-4 absolute sm:static top-12 xs:top-14 left-0 w-full sm:w-auto bg-purple-900 dark:bg-purple-950 sm:bg-transparent p-2 sm:p-0 shadow-lg sm:shadow-none`}>
            {session ? (
                <>
                    <Link href="/profile" className="text-sm sm:text-base hover:text-purple-300 dark:hover:text-purple-200 transition-colors">
                        Profile
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="bg-purple-700 dark:bg-purple-800 text-xs sm:text-sm text-white hover:bg-purple-600 dark:hover:bg-purple-700 hover:shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
                    >
                        Sign Out
                    </button>
                </>
            ) : (
                <button
                    onClick={() => signIn()}
                    className="bg-purple-700 dark:bg-purple-800 text-xs sm:text-sm text-white hover:bg-purple-600 dark:hover:bg-purple-700 hover:shadow-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full active:scale-95 transition-all duration-300 whitespace-nowrap"
                >
                    Sign In with GitHub
                </button>
            )}
        </div>
    );
}