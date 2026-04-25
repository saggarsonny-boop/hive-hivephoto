import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'HivePhoto — AI Photo Library',
  description: 'Your private AI-powered photo library. Smart search, automatic tagging, face recognition, duplicate detection. No ads. No investors. No agenda.',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const body = (
    <body className="min-h-screen antialiased">
      {children}
    </body>
  )
  return (
    <html lang="en">
      {clerkKey ? <ClerkProvider>{body}</ClerkProvider> : body}
    </html>
  )
}
