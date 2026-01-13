'use client';

import { useUser } from '@/firebase';
import { ReactNode, useEffect, useState } from 'react';
import { setCookieOnLogin } from './actions';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthStateWrapper({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const [isCookieSet, setIsCookieSet] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // User is logged in. If they are on the login page, redirect them to the dashboard.
        if (pathname === '/login') {
          router.replace('/');
        }
      } else {
        // User is not logged in. Redirect them to the login page.
        // Don't redirect if they are already on the login page.
        if (pathname !== '/login') {
          router.replace('/login');
        }
      }
    }
  }, [isUserLoading, user, router, pathname]);

  useEffect(() => {
    async function handleUserChange() {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await setCookieOnLogin(idToken);
          setIsCookieSet(true);
        } catch (error) {
          console.error('Error setting session cookie:', error);
          setIsCookieSet(false); // Indicate failure
        }
      } else {
        // When user logs out, clear the cookie state
        setIsCookieSet(false);
      }
    }
    handleUserChange();
  }, [user]);

  // If we are on the login page, and the user is not logged in yet, show the login page.
  if (pathname === '/login' && !user) {
    return <>{children}</>;
  }

  // While checking auth state or if the user is not yet available, show a loader.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's a user and the cookie has been set, show the app.
  if (user && isCookieSet) {
    return <>{children}</>;
  }

  // This is a fallback loader state, e.g., while the cookie is being set.
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
