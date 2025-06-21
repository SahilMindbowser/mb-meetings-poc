"use client";

import { useEffect } from "react";

export default function CallbackPage() {
  useEffect(() => {
    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage("success", "http://localhost:3000");
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Completing login...</p>
    </div>
  );
}
