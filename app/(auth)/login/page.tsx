"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, useCallback } from "react";
import { GoogleLogo, MeetingsLogo } from "@/assets";

export default function LoginPage() {
  const { login } = useAuth();

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      if (
        !["http://localhost:8080", "http://localhost:3000"].includes(
          event.origin
        )
      ) {
        return;
      }

      if (event.data === "success") {
        try {
          const response = await fetch(
            "http://localhost:8080/auth/login/success",
            {
              credentials: "include",
            }
          );

          const data = await response.json();
          if (!data.error) {
            login(data.access_token, data.user);
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Login error:", error);
          alert("Login failed. Please try again.");
        }
      }
    },
    [login]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const handleGoogleLogin = () => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      "http://localhost:8080/auth/google",
      "googleLogin",
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1`
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      alert("Please allow popups for this website");
    }

    const pollTimer = window.setInterval(() => {
      if (popup?.closed) {
        window.clearInterval(pollTimer);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src={MeetingsLogo}
            alt="Logo"
            width={48}
            height={48}
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Room Booking
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in with your Mindbowser account
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            variant="outline"
          >
            <Image
              src={GoogleLogo}
              alt="Google Logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Sign in with Google
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Sign in with your Mindbowser email account
        </div>
      </div>
    </div>
  );
}
