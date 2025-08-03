"use client";

import dynamic from 'next/dynamic';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationLoader } from "@/components/navigation-loader";
import { SolanaProvider } from '@/components/SolanaProvider';

// Import components with SSR disabled to prevent hydration errors
const WalletProvider = dynamic(
  () => import("@/components/wallet-provider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

const NotificationProvider = dynamic(
  () => import("@/components/notification-modal").then((mod) => mod.NotificationProvider),
  { ssr: false }
);

const SplashScreenProvider = dynamic(
  () => import("@/components/splash-screen").then((mod) => mod.SplashScreenProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SolanaProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <WalletProvider>
            <TooltipProvider>
              <SplashScreenProvider>
                <NavigationLoader />
                {children}
              </SplashScreenProvider>
            </TooltipProvider>
          </WalletProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </SolanaProvider>
  );
}
