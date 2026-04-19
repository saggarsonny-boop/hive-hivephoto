"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Shell from "@/components/layout/Shell";
import PhotoMap from "@/components/map/PhotoMap";

export default function MapPage() {
  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6">
            <h1 className="text-2xl font-semibold text-white mb-2">Map</h1>
            <p className="text-sm text-gray-400 mb-6">
              Photos with GPS location data
            </p>
            <PhotoMap />
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
