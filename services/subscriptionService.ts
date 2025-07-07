import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const FIREBASE_FUNCTIONS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://us-central1-fortimind.cloudfunctions.net'
  : 'http://localhost:5001/fortimind/us-central1';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  trialDays: number;
  originalPrice: number;
  savings?: number;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionId?: string;
  planType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export class SubscriptionService {
  private static async getAuthToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    return await user.getIdToken();
  }

  /**
   * Crear una nueva suscripción PayPal
   */
  static async createSubscription(planType: 'monthly' | 'yearly'): Promise<{
    subscriptionId: string;
    approvalUrl: string;
    status: string;
  }> {
    const token = await this.getAuthToken();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/createPayPalSubscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user.uid,
        planType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear la suscripción');
    }

    return await response.json();
  }

  /**
   * Verificar el estado premium del usuario
   */
  static async checkPremiumStatus(): Promise<SubscriptionStatus> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return { isPremium: false };
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          isPremium: userData.isPremium || false,
          subscriptionId: userData.subscriptionId,
          planType: userData.planType,
          status: userData.subscriptionStatus,
          startDate: userData.premiumSince?.toDate(),
          endDate: userData.premiumExpiresAt?.toDate()
        };
      }
      
      return { isPremium: false };
    } catch (error) {
      console.error('Error checking premium status:', error);
      return { isPremium: false };
    }
  }

  /**
   * Cancelar suscripción (marcar como cancelada en Firestore)
   */
  static async cancelSubscription(): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const subscriptionId = userData.subscriptionId;
        
        if (subscriptionId) {
          // Marcar suscripción como cancelada en Firestore
          await updateDoc(doc(db, 'subscriptions', subscriptionId), {
            status: 'CANCELLED',
            cancelledAt: new Date()
          });
        }
        
        // Actualizar estado del usuario
        await updateDoc(doc(db, 'users', user.uid), {
          isPremium: false,
          premiumCancelledAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Error al cancelar la suscripción');
    }
  }

  /**
   * Obtener planes de suscripción disponibles
   */
  static getAvailablePlans(): SubscriptionPlan[] {
    return [
      {
        id: 'premium_monthly',
        name: 'Premium Mensual',
        price: 4.99,
        currency: 'USD',
        interval: 'month',
        description: 'Acceso completo a todas las funciones premium',
        trialDays: 7,
        originalPrice: 4.99
      },
      {
        id: 'premium_yearly',
        name: 'Premium Anual',
        price: 39.99,
        currency: 'USD',
        interval: 'year',
        description: 'Acceso completo a todas las funciones premium (33% descuento)',
        trialDays: 7,
        originalPrice: 59.88, // 4.99 * 12
        savings: 19.89
      }
    ];
  }

  /**
   * Verificar si el usuario tiene acceso a una función premium
   */
  static async hasPremiumAccess(): Promise<boolean> {
    const status = await this.checkPremiumStatus();
    return status.isPremium;
  }

  /**
   * Obtener información detallada de la suscripción
   */
  static async getSubscriptionDetails(): Promise<SubscriptionStatus | null> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.subscriptionId) {
          const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userData.subscriptionId));
          
          if (subscriptionDoc.exists()) {
            const subscriptionData = subscriptionDoc.data();
            return {
              isPremium: userData.isPremium || false,
              subscriptionId: userData.subscriptionId,
              planType: subscriptionData.planType,
              status: subscriptionData.status,
              startDate: subscriptionData.startTime?.toDate(),
              endDate: subscriptionData.expiresAt?.toDate()
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting subscription details:', error);
      return null;
    }
  }
}

export default SubscriptionService; 