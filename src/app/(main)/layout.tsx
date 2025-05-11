
// Ensure this is a client component if it uses hooks like usePathname or any client-side state/effects
"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, DollarSign, MessageCircle, Wallet, UserCircle, Trophy, QrCode } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SmartCycleLogo from '@/components/icons/SmartCycleLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

const navItems = [
  { href: '/challenges', icon: <Trophy />, label: 'Challenges' },
  { href: '/scan-qr', icon: <QrCode />, label: 'Scan QR' },
  { href: '/wallet', icon: <Wallet />, label: 'Wallet' },
  { href: '/locator', icon: <MapPin />, label: 'Locator' },
  { href: '/pricing', icon: <DollarSign />, label: 'Pricing' },
  { href: '/chatbot', icon: <MessageCircle />, label: 'Chatbot' },
  { href: '/profile', icon: <UserCircle />, label: 'Profile' },
];

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 flex flex-col items-start gap-2 group-data-[collapsible=icon]:items-center">
          <Link href="/" className="flex items-center gap-2 w-full no-underline">
            <SmartCycleLogo className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
            <span className="font-semibold text-lg text-sidebar-primary group-data-[collapsible=icon]:hidden">SmartCycle</span>
          </Link>
          <div className="flex-grow group-data-[collapsible=icon]:hidden" />
          <SidebarTrigger className="md:hidden group-data-[collapsible=icon]:hidden ml-auto" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => {
              const specificExactMatchPaths = ['/', '/locator', '/scan-qr', '/challenges'];
              const currentIsActive = specificExactMatchPaths.includes(item.href)
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} asChild>
                    <SidebarMenuButton
                      // Removed asChild from SidebarMenuButton here
                      isActive={currentIsActive}
                      tooltip={item.label}
                      className="justify-start"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <Link href="/profile" passHref legacyBehavior>
            <a className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent/50 p-2 rounded-md transition-colors duration-150 ease-out no-underline text-sidebar-foreground hover:text-sidebar-accent-foreground">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://picsum.photos/id/237/40/40" alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden flex flex-col">
                    <span className="text-sm font-medium">Demo User</span>
                    <span className="text-xs text-muted-foreground">user@example.com</span>
                </div>
            </a>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col h-screen"> {/* Ensure SidebarInset can take full screen height */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 md:hidden">
            <SidebarTrigger />
            <Link href="/" className="flex items-center gap-2 no-underline">
              <SmartCycleLogo className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">SmartCycle</h1>
            </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex flex-col"> {/* Added flex flex-col to allow children to grow */}
            {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
