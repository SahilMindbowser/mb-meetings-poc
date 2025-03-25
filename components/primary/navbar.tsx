"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Left: Logo */}
      <div className="text-xl font-bold tracking-wide text-gray-900">
        <Image
          src="/Meetings-Logo-Light.svg"
          alt="Logo"
          width={32}
          height={32}
          className="h-10 w-auto"
        />
      </div>

      {/* Center: Navigation Links (Hidden on Small Screens) */}
      <div className="hidden md:flex space-x-6">
        <NavLink href="/schedule" active={pathname === "/schedule"}>
          Schedule
        </NavLink>
        <NavLink href="/reservations" active={pathname === "/reservations"}>
          My Reservations
        </NavLink>
      </div>

      {/* Right: Profile Dropdown */}
      <div className="hidden md:flex">
        <ProfileDropdown />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col space-y-4 mt-4">
              <NavLink
                href="/schedule"
                active={pathname === "/schedule"}
                onClick={() => setIsOpen(false)}
              >
                Schedule
              </NavLink>
              <NavLink
                href="/reservations"
                active={pathname === "/reservations"}
                onClick={() => setIsOpen(false)}
              >
                My Reservations
              </NavLink>
              <ProfileDropdown />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

// Navigation Link Component
function NavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium ${
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
  );
}

// Profile Dropdown Component
function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/profile.jpg" alt="User" />
            <AvatarFallback>SP</AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 mt-2 shadow-lg rounded-lg"
      >
        <DropdownMenuItem
          onClick={() => console.log("Profile")}
          className="cursor-pointer"
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("Settings")}
          className="cursor-pointer"
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => console.log("Sign Out")}
          className="text-red-500 cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
