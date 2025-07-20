import { Metadata } from 'next';
import "../styles/globals.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Clash Market - PvP Perps Trading App',
  description: 'Decentralized PvP trading application',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
  icons: {
    icon: '/images/Logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="dark min-h-screen bg-dark-bg text-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
