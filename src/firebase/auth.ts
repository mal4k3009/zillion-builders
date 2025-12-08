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
  private SESSION_KEY = 'sentiment_user_session';

  // Initialize auth state from localStorage
  async init(): Promise<User | null> {
    console.log('🔐 Initializing authentication system...');
    
    try {
      // Check for existing session in localStorage
      const savedSession = localStorage.getItem(this.SESSION_KEY);
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        const { userId, email } = sessionData;
        
        console.log('📱 Found saved session for:', email);
        
        // Verify the user still exists and is active
        const user = await usersService.getById(userId);
        if (user && user.status === 'active' && user.email === email) {
          console.log('✅ Session restored for user:', user.email);
          this.setCurrentUser(user);
          return user;
        } else {
          console.log('⚠️ Saved session is invalid, clearing...');
          localStorage.removeItem(this.SESSION_KEY);
        }
      }
      
      console.log('👤 No valid session found, user needs to login');
      this.setCurrentUser(null);
      return null;
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      localStorage.removeItem(this.SESSION_KEY);
      this.setCurrentUser(null);
      return null;
    }
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

  // Sign in with email/password using Firestore
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Attempting to sign in user with email:', email);
      
      // Clear any existing session first to avoid conflicts
      this.clearCurrentState();
      
      // Get all users and find the one with matching email
      const users = await usersService.getAll();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'active');
      
      if (!user) {
        console.log('❌ User not found or inactive:', email);
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Check password
      if (user.password !== password) {
        console.log('❌ Invalid password for user:', email);
        return { success: false, error: 'Invalid email or password' };
      }
      
      console.log('✅ Authentication successful for:', email);
      
      // Update last login
      await usersService.update(user.id, {
        lastLogin: new Date().toISOString()
      });
      
      // Create session data
      const sessionData = {
        userId: user.id,
        email: user.email,
        loginTime: new Date().toISOString()
      };
      
      // Save session to localStorage
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      
      // Update current user
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      this.setCurrentUser(updatedUser);
      
      return { success: true, user: updatedUser };
      
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      console.log('👋 User signing out...');
      
      // Clear all state
      this.clearCurrentState();
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  // Private method to clear current state
  private clearCurrentState(): void {
    // Clear session from localStorage
    localStorage.removeItem(this.SESSION_KEY);
    
    // Clear current user
    this.setCurrentUser(null);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Private method to set current user and notify listeners
  private setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Validate current session
  async validateSession(): Promise<boolean> {
    try {
      const savedSession = localStorage.getItem(this.SESSION_KEY);
      if (!savedSession || !this.currentUser) {
        return false;
      }
      
      // Verify user still exists and is active
      const user = await usersService.getById(this.currentUser.id);
      if (!user || user.status !== 'active') {
        await this.signOut();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      await this.signOut();
      return false;
    }
  }
}

export const authService = new AuthService();