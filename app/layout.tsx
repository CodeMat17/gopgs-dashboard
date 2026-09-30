import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

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
  title: "GOUNI SPGS · CMS",
  description: "Content management dashboard for the GOUNI Postgraduate School website",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata.role === "admin";

  return (
    <Providers>
      <html lang='en' suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased`}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange>
            {isAdmin ? (
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='min-w-0'>
                  <AppHeader />
                  <main className='flex-1'>
                    <ConvexClientProvider>{children}</ConvexClientProvider>
                  </main>
                </SidebarInset>
              </SidebarProvider>
            ) : (
              <div className='hero-brand flex min-h-screen w-full items-center justify-center px-4'>
                <div className='w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur'>
                  <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gold/15'>
                    <ShieldAlert className='size-6 text-gold' />
                  </div>
                  <h1 className='text-xl font-bold'>Access denied</h1>
                  <p className='mt-2 text-sm text-white/70'>
                    Your account doesn&apos;t have admin access to this
                    dashboard. Contact the site administrator if you think this
                    is a mistake.
                  </p>
                  <div className='mt-6 inline-flex rounded-full bg-gold px-5 py-2 text-sm font-semibold text-gold-foreground transition-opacity hover:opacity-90'>
                    <SignOutButton />
                  </div>
                </div>
              </div>
            )}
            <Toaster richColors position='top-right' />
          </ThemeProvider>
        </body>
      </html>
    </Providers>
  );
}
