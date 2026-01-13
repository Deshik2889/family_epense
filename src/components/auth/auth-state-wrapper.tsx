'use client';

import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { ReactNode, useEffect, useState } from 'react';
import { setCookieOnLogin } from './actions';
import { Loader2 } from 'lucide-react';

export default function AuthStateWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isCookieSet, setIsCookieSet] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      // If not loading and no user, sign in anonymously.
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

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
        // When user logs out, we can clear the state
        setIsCookieSet(false);
      }
    }
    handleUserChange();
  }, [user]);

  // While checking auth state or setting the cookie, show a loader.
  if (isUserLoading || (user && !isCookieSet)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's a user and the cookie is set, show the app.
  if (user && isCookieSet) {
    return <>{children}</>;
  }
  
  // This state is hit if the user logs out or if the cookie fails to set
  // We show a loader as it will attempt to sign-in again
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
    );
}
