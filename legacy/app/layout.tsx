import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lunar Travel | The road, reconsidered',
  description: 'Private travel, considered properly. Lunar Travel moves you through South Africa with discretion, comfort and precision.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" aria-label="Lunar Travel home"><img className="logo" src="/media/logo.png" alt="Lunar Travel" /></Link>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/#services">Services</Link><Link href="/#standard">The Lunar Standard</Link><Link href="/fleet">Fleet</Link><Link href="/enquire">Request a trip</Link>
          </nav>
          <button className="menu-button" type="button" aria-label="Open navigation">Menu</button>
        </header>
        {children}
      </body>
    </html>
  );
}
