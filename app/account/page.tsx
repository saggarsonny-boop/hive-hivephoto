"use client";

import { SignedIn, SignedOut, RedirectToSignIn, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Shell from "@/components/layout/Shell";

export default function AccountPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6 max-w-lg">
            <h1 className="text-2xl font-semibold text-white mb-6">Account</h1>

            <div className="bg-hive-surface border border-hive-border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                {user?.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName ?? "User"}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{user?.fullName ?? "—"}</p>
                  <p className="text-sm text-gray-400">
                    {user?.primaryEmailAddress?.emailAddress ?? ""}
                  </p>
                </div>
              </div>

              <hr className="border-hive-border" />

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Your library
                </p>
                <p className="text-sm text-gray-300">
                  Photos are stored privately and only accessible to you.
                </p>
              </div>

              <hr className="border-hive-border" />

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 rounded-lg text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-6 text-center">
              No ads. No investors. No agenda.
            </p>
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
