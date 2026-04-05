'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingReservation from '@/components/FloatingReservation';
import CartDrawer from '@/components/CartDrawer';
import ThemeTransitionOverlay from '@/components/ThemeTransitionOverlay';
import InstallPWA from '@/components/InstallPWA';
import BottomBar from '@/components/BottomBar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingReservation />
      <ThemeTransitionOverlay />
      <InstallPWA />
      <BottomBar />
    </>
  );
}
