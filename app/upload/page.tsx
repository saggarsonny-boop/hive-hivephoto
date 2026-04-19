"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Shell from "@/components/layout/Shell";
import UploadZone from "@/components/upload/UploadZone";

export default function UploadPage() {
  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-white mb-6">Upload Photos</h1>
            <UploadZone />
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
