"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const isScrolled = useScroll();
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-800/20 shadow-lg shadow-black/5"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center px-6 py-4">
        {/* Logo Section */}
        <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-105">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Image 
                src="/logo.svg" 
                alt="Vero" 
                width={20} 
                height={20} 
                className="filter brightness-0 invert"
              />
            </div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Vero
          </span>
        </Link>
        
        {/* Auth Section */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="flex items-center gap-3">
              <SignUpButton>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                >
                  Sign Up
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                >
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="flex items-center gap-4">
              {/* Optional: Add a theme toggle or other controls here */}
              <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <UserControl showName />
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
