import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HivePhoto — AI Photo Library',
  description: 'Your private AI-powered photo library. Smart search, automatic tagging, face recognition, duplicate detection. No ads. No investors. No agenda.',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <html lang="en">
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    )
  }

  const { ClerkProvider } = await import('@clerk/nextjs')

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
