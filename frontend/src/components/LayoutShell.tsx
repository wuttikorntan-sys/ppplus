'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// These widgets aren't part of the LCP and shouldn't block hydration.
// Loading them with next/dynamic keeps the initial JS bundle small,
// which directly cuts TBT on mobile.
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false });
const FloatingReservation = dynamic(() => import('@/components/FloatingReservation'), { ssr: false });
const ThemeTransitionOverlay = dynamic(() => import('@/components/ThemeTransitionOverlay'), { ssr: false });
const InstallPWA = dynamic(() => import('@/components/InstallPWA'), { ssr: false });
const BottomBar = dynamic(() => import('@/components/BottomBar'), { ssr: false });

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
