import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import '../styles/globals.css';

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Liqify - PvP Perps Trading App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="icon" href="/images/Logo.svg" type="image/svg+xml" />
      </Head>
      <NotificationProvider>
        <WalletProvider>
          <TooltipProvider>
            <SplashScreenProvider>
              <div className="dark min-h-screen bg-dark-bg text-white">
                <Component {...pageProps} />
              </div>
            </SplashScreenProvider>
          </TooltipProvider>
        </WalletProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
