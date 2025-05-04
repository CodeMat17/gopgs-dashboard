import { AppSidebar } from "@/components/app-sidebar";
import { Nav } from "@/components/Nav";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";
import { SignOutButton } from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GOUNI SPgS",
  description: "Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata.role === "admin";
  // console.log("Clerk User: ", user?.publicMetadata.role);

  return (
    <Providers>
      <html lang='en' suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange>
            {isAdmin ? (
              <>
                <Nav />
                <SidebarProvider>
                  <AppSidebar />
                  <main className='border w-full'>
                    <SidebarTrigger />
                    <ConvexClientProvider>{children}</ConvexClientProvider>
                  </main>
                </SidebarProvider>
              </>
            ) : (
              <div className='h-screen w-full flex flex-col items-center justify-center gap-4'>
                <h1 className='text-2xl font-bold'>⚠️ Access Denied</h1>
                <p className='text-muted-foreground'>
                  You don&apos;t have permission to view this page
                </p>
                  <SignOutButton />
              </div>
            )}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </Providers>
  );
}
