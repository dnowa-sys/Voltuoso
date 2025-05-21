// firebase-auth-react-native.d.ts
declare module 'firebase/auth/react-native' {
  import type { FirebaseApp } from 'firebase/app';
    import type { Persistence } from 'firebase/auth';

  /**
   * Initialize Auth with React Native persistence.
   */
  export function initializeAuth(
    app: FirebaseApp,
    options?: { persistence: Persistence }
  ): any;

  /**
   * Get the AsyncStorage‐backed persistence layer.
   */
  export function getReactNativePersistence(
    storage: any
  ): Persistence;
}
