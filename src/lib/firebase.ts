import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { cookies } from 'next/headers';
import { credential } from "firebase-admin";

const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceKey) {
  throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env.local file.");
}

const serviceAccount = JSON.parse(serviceKey);

// Initialize Firebase Admin
const app = !getApps().length ? initializeApp({
    credential: credential.cert(serviceAccount)
}) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export async function getUserId() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

export { db, auth };
