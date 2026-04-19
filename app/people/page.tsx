"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Shell from "@/components/layout/Shell";
import PeopleGrid from "@/components/people/PeopleGrid";

export default function PeoplePage() {
  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6">
            <h1 className="text-2xl font-semibold text-white mb-6">People</h1>
            <PeopleGrid />
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
