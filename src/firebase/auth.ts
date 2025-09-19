import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';
import { usersService } from './services';
import { User } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  // Initialize auth state listener
  init(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('🔥 Firebase auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
        
        if (firebaseUser) {
          // User is signed in, get their custom user data
          try {
            const customUser = await this.getCustomUserByEmail(firebaseUser.email!);
            if (customUser) {
              this.setCurrentUser(customUser);
              resolve(customUser);
            } else {
              console.warn('No custom user data found for:', firebaseUser.email);
              await this.signOut();
              resolve(null);
            }
          } catch (error) {
            console.error('Error fetching custom user data:', error);
            await this.signOut();
            resolve(null);
          }
        } else {
          // User is signed out
          this.setCurrentUser(null);
          resolve(null);
        }
      });

      // Clean up listener after first call for initialization
      setTimeout(() => {
        if (typeof unsubscribe === 'function') {
          // Keep the listener active for ongoing auth state changes
        }
      }, 100);
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Sign in with email/password directly
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Attempting to sign in user with email:', email);
      
      try {
        // Try to sign in with Firebase Auth
        await signInWithEmailAndPassword(auth, email, password);
        
        console.log('✅ Firebase sign in successful for:', email);
        
        // Get custom user data based on email
        const customUser = await this.getCustomUserByEmail(email);
        if (customUser) {
          return { success: true, user: customUser };
        } else {
          console.warn('No custom user data found for:', email);
          await this.signOut();
          return { success: false, error: 'User data not found' };
        }
      } catch (firebaseError: unknown) {
        const error = firebaseError as { code?: string; message?: string };
        console.error('❌ Firebase auth error:', error);
        
        if (error.code === 'auth/user-not-found') {
          return { success: false, error: 'User not found' };
        } else if (error.code === 'auth/wrong-password') {
          return { success: false, error: 'Invalid password' };
        } else if (error.code === 'auth/invalid-email') {
          return { success: false, error: 'Invalid email format' };
        } else if (error.code === 'auth/user-disabled') {
          return { success: false, error: 'User account is disabled' };
        } else {
          return { success: false, error: 'Authentication failed' };
        }
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('👋 User signed out from Firebase');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Private method to set current user and notify listeners
  private setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Get custom user data by email
  private async getCustomUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await usersService.getAll();
      // Find user by email directly
      return users.find(u => u.email === email && u.status === 'active') || null;
    } catch (error) {
      console.error('Error fetching custom user data:', error);
      return null;
    }
  }
}

export const authService = new AuthService();