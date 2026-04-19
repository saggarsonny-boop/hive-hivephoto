"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Shell from "@/components/layout/Shell";
import PhotoGrid from "@/components/gallery/PhotoGrid";

export default function HomePage() {
  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-white">Your Photos</h1>
            </div>
            <PhotoGrid />
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
