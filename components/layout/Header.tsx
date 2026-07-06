"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/", label: "Gallery" },
  { href: "/upload", label: "Upload" },
  { href: "/search", label: "Search" },
  { href: "/people", label: "People" },
  { href: "/map", label: "Map" },
  { href: "/duplicates", label: "Duplicates" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-hive-dark/90 backdrop-blur border-b border-hive-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="text-hive-gold font-semibold text-lg tracking-tight">
          HivePhoto
        </Link>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "bg-hive-gold/20 text-hive-gold"
                  : "text-gray-400 hover:text-white hover:bg-hive-border"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/account"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Account
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
