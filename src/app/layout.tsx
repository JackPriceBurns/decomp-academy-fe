import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ProgressProvider } from "@/lib/auth/ProgressProvider";
import { ThemeProvider, themeInitScript } from "@/lib/theme-context";
import { themeStyles } from "@/lib/theme";
import { EngagementPrompts } from "@/components/EngagementPrompts";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, websiteLd, SITE_DESCRIPTION } from "@/lib/seo";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://decomp-academy.dev"),
  title: {
    default: "Decomp Academy — Learn Matching Decompilation of Retro Games",
    template: "%s · Decomp Academy",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Decomp Academy",
  keywords: [
    "decompilation",
    "matching decompilation",
    "learn to decompile",
    "retro games",
    "reverse engineering",
    "assembly to C",
    "GameCube",
    "PowerPC",
    "Game Boy Advance",
    "ARM",
    "Thumb",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/brand/svg/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/brand/favicon/favicon.ico",
    apple: "/brand/favicon/apple-touch-icon.png",
  },
  manifest: "/brand/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Decomp Academy",
    url: "https://decomp-academy.dev",
    title: "Decomp Academy — Learn Matching Decompilation of Retro Games",
    description: SITE_DESCRIPTION,
    images: [{ url: "/brand/png/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Decomp Academy — Matching Decompilation of Retro Games",
    description: SITE_DESCRIPTION,
    images: ["/brand/png/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0c16" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme defaults to dark for SSR; the pre-paint script (below) corrects
    // it from storage / OS preference before first paint. suppressHydrationWarning
    // because that script mutates the attribute before React hydrates.
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* Per-theme CSS variables, then the no-flash theme resolver. */}
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <ThemeProvider>
          <AuthProvider>
            <ProgressProvider>
              {children}
              <EngagementPrompts />
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* Cloudflare Web Analytics */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon='{"token": "9a55c6b3b99e4827907294ce6ec5d4e6"}'
        />
      </body>
    </html>
  );
}
