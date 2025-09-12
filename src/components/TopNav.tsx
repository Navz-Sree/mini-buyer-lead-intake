"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

function getInitials(email?: string | null) {
  if (!email) return "?";
  const [name] = email.split("@");
  return name
    .split(/[._-]/)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
}

export default function TopNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <nav className="w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-white/80 dark:bg-gray-900/80 shadow-sm fixed top-0 left-0 z-50 gap-2 sm:gap-0">
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
        <div className="flex items-center gap-2">
          <Image src="/next.svg" alt="Logo" width={32} height={32} className="dark:invert" />
          <Link href="/buyers" className="font-bold text-lg tracking-tight text-blue-700 dark:text-blue-300">Buyer Lead Intake</Link>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-center w-full sm:w-auto">
        <Link href="/buyers" className="hover:underline">Buyers</Link>
        <Link href="/buyers/new" className="hover:underline">Add Buyer</Link>
        {session?.user && (
          <div className="relative" ref={menuRef}>
            <button
              aria-label="User menu"
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setOpen((v) => !v)}
              tabIndex={0}
            >
              {getInitials(session.user.email)}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                  {session.user.email}
                  {session.user.role && (
                    <span className="block mt-1 text-blue-700 dark:text-blue-300 font-semibold">{session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}</span>
                  )}
                </div>
                <button
                  onClick={() => setProfileOpen(true)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-200"
                >
                  Profile
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300"
                >
                  Logout
                </button>
              </div>
            )}
            {/* Profile Modal */}
            {profileOpen && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
              >
                <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg max-w-xs w-full">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-2">
                      {getInitials(session.user.email)}
                    </div>
                    <div className="text-lg font-semibold">{session.user.email}</div>
                    {session.user.role && (
                      <div className="text-blue-700 dark:text-blue-300 font-medium mt-1">{session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}</div>
                    )}
                  </div>
                  <div className="mb-4 text-center text-gray-500">Profile editing coming soon.</div>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full px-4 py-2 rounded bg-blue-600 text-white mt-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
