import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Header } from "@/components/Header";
import { SupportFooter } from "@/components/SupportFooter";
import { getSupportLinks } from "@/lib/config/support";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "k8s YAML Trainer",
  description: "Learn Kubernetes manifests by writing YAML live with instant feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supportLinks = getSupportLinks();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-screen flex-col bg-slate-950 text-slate-200">
        <Header links={supportLinks} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <SupportFooter links={supportLinks} />
      </body>
    </html>
  );
}
