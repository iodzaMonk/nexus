import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus",
  description: "Make friends",
};

import { MobileBottomBar } from "@/components/MobileBottomBar";
import { getCurrentUser } from "@/lib/user";
import SessionManager from "@/components/Auth/SessionManager";
import { cookies } from "next/headers";
import SocketProvider from "@/components/SocketProvider";
import Providers from "@/components/QueryProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <SocketProvider currentUser={user || undefined}>
          <SidebarProvider>
            <SessionManager
              hasUser={!!user}
              hasSessionCookie={!!(await cookies()).get("session")}
            />
            <AppSidebar />
            <main className="flex justify-center w-full pb-16 md:pb-0">
              <Providers>{children}</Providers>
            </main>
            <MobileBottomBar username={user?.username} />
          </SidebarProvider>
          <Toaster />
        </SocketProvider>
      </body>
    </html>
  );
}
