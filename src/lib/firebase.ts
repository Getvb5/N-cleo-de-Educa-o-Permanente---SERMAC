import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('openid');
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGooglePopup = async (): Promise<{
  email: string;
  name: string;
  photoUrl?: string;
  uid: string;
}> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user: FirebaseUser = result.user;
  
  if (!user.email) {
    throw new Error('Não foi possível obter o e-mail da sua conta Google.');
  }

  return {
    email: user.email.toLowerCase().trim(),
    name: user.displayName || user.email.split('@')[0],
    photoUrl: user.photoURL || undefined,
    uid: user.uid
  };
};

export const signOutGoogle = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Error signing out from Google Firebase:', err);
  }
};
