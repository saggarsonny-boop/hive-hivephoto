import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "HivePhoto — AI Photo Library",
  description:
    "Your private AI-powered photo library. Smart search, automatic tagging, face recognition, duplicate detection. No ads. No investors. No agenda.",
  openGraph: {
    title: "HivePhoto",
    description: "AI-powered private photo library",
    url: "https://hivephoto.hive.baby",
    siteName: "HivePhoto",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen bg-hive-dark text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
