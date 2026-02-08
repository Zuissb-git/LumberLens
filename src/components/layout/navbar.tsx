"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, TreePine, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/search", label: "Search" },
  { href: "/build-orders", label: "Build Orders" },
  { href: "/favorites", label: "Favorites" },
  { href: "/templates", label: "Templates" },
  { href: "/submit-price", label: "Submit Price" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-800">
            <TreePine className="h-6 w-6" />
            LumberLens
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth + mobile toggle */}
          <div className="flex items-center gap-2">
            {session?.user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <User className="h-4 w-4" />
                  {session.user.name || session.user.email}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-stone-200 pt-3 mt-3">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/signin" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full" size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
