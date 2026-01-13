'use server';
import { auth } from '@/lib/firebase';
import { cookies } from 'next/headers';

export async function setCookieOnLogin(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to create session cookie:", error);
    return { success: false };
  }
}
