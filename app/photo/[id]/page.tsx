"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Shell from "@/components/layout/Shell";
import PhotoDetail from "@/components/photo/PhotoDetail";

export default function PhotoPage() {
  const params = useParams<{ id: string }>();

  return (
    <>
      <SignedIn>
        <Shell>
          <PhotoDetail photoId={params.id} />
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
