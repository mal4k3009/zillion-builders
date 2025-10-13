import { doc, setDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { requestNotificationPermission } from '../firebase/messaging';

export interface FCMToken {
  token: string;
  userId: number;
  deviceType: 'desktop' | 'mobile';
  userAgent: string;
  timestamp: string;
  isActive: boolean;
}

class FCMService {
  private static instance: FCMService;
  private currentToken: string | null = null;

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  async initializeForUser(userId: number): Promise<string | null> {
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        this.currentToken = token;
        await this.storeToken(userId, token);
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('FCM initialization failed:', error);
      return null;
    }
  }

  async storeToken(userId: number, token: string): Promise<void> {
    try {
      const deviceType = this.getDeviceType();
      const tokenData: FCMToken = {
        token,
        userId,
        deviceType,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        isActive: true
      };

      // Store in fcmTokens collection with composite key
      const tokenId = `${userId}_${this.generateTokenHash(token)}`;
      await setDoc(doc(db, 'fcmTokens', tokenId), tokenData);

      // Clean up old tokens for this user
      await this.cleanupOldTokens(userId);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  async getUserTokens(userId: number): Promise<FCMToken[]> {
    try {
      const tokensQuery = query(
        collection(db, 'fcmTokens'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(tokensQuery);
      return snapshot.docs.map(doc => doc.data() as FCMToken);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return [];
    }
  }

  async getAllActiveTokensExceptSender(receiverUserId: number, senderUserId: number): Promise<string[]> {
    try {
      const receiverTokens = await this.getUserTokens(receiverUserId);
      const senderTokens = await this.getUserTokens(senderUserId);
      
      // Get sender's current token to exclude it
      const senderTokenStrings = senderTokens.map(t => t.token);
      
      // Return only receiver's tokens that are not sender's tokens
      return receiverTokens
        .filter(tokenData => !senderTokenStrings.includes(tokenData.token))
        .map(tokenData => tokenData.token);
    } catch (error) {
      console.error('Error getting filtered tokens:', error);
      return [];
    }
  }

  async deactivateToken(userId: number, token: string): Promise<void> {
    try {
      const tokenId = `${userId}_${this.generateTokenHash(token)}`;
      await deleteDoc(doc(db, 'fcmTokens', tokenId));
    } catch (error) {
      console.error('Error deactivating token:', error);
    }
  }

  async cleanupOldTokens(userId: number): Promise<void> {
    try {
      const userTokens = await this.getUserTokens(userId);
      const maxTokensPerUser = 5; // Limit tokens per user

      if (userTokens.length > maxTokensPerUser) {
        // Sort by timestamp and remove oldest
        const sortedTokens = userTokens.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        const tokensToRemove = sortedTokens.slice(0, userTokens.length - maxTokensPerUser);
        
        for (const token of tokensToRemove) {
          await this.deactivateToken(userId, token.token);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old tokens:', error);
    }
  }

  private getDeviceType(): 'desktop' | 'mobile' {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    return isMobile ? 'mobile' : 'desktop';
  }

  private generateTokenHash(token: string): string {
    // Simple hash for token identification (first 16 chars + last 8 chars)
    return token.length > 24 ? token.substring(0, 16) + token.slice(-8) : token;
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }

  async refreshTokenForUser(userId: number): Promise<string | null> {
    return await this.initializeForUser(userId);
  }
}

export const fcmService = FCMService.getInstance();