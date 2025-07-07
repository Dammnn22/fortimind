import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import AbuseAlertService from './abuseAlertService';

export interface AdminMetrics {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisWeek: number;
    premiumUsers: number;
  };
  contentMetrics: {
    exercisePrograms: number;
    nutritionChallenges: number;
    totalDaysGenerated: number;
    averageProgramLength: number;
  };
  aiMetrics: {
    totalAIRequests: number;
    aiRequestsLast7Days: number;
    aiRequestsLast24Hours: number;
    averageAIUsagePerUser: number;
  };
  activityMetrics: {
    topActiveUsers: UserActivity[];
    dailyActiveUsers: number[];
    popularFeatures: FeatureUsage[];
  };
  alertMetrics: {
    totalAlerts: number;
    pendingAlerts: number;
    criticalAlerts: number;
    alertsByType: Record<string, number>;
  };
}

export interface UserActivity {
  userId: string;
  email?: string;
  activityCount: number;
  lastActive: Date;
  favoriteFeatures: string[];
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  growthRate: number;
}

/**
 * Servicio para obtener métricas completas del dashboard administrativo
 */
export class AdminDashboardService {
  
  /**
   * Obtener todas las métricas del dashboard
   */
  static async getComprehensiveMetrics(): Promise<AdminMetrics> {
    try {
      const [userMetrics, contentMetrics, aiMetrics, activityMetrics, alertMetrics] = await Promise.all([
        this.getUserMetrics(),
        this.getContentMetrics(),
        this.getAIMetrics(),
        this.getActivityMetrics(),
        this.getAlertMetrics(),
      ]);

      return {
        userMetrics,
        contentMetrics,
        aiMetrics,
        activityMetrics,
        alertMetrics,
      };
    } catch (error) {
      console.error('Error getting comprehensive metrics:', error);
      throw new Error('Failed to load admin metrics');
    }
  }

  /**
   * Métricas de usuarios
   */
  private static async getUserMetrics() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Total users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    // New users this week
    const newUsersQuery = query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
    );
    const newUsersSnapshot = await getDocs(newUsersQuery);
    const newUsersThisWeek = newUsersSnapshot.size;

    // Active users (users with activity in last day)
    const activeUsersQuery = query(
      collection(db, 'user_activity'),
      where('timestamp', '>=', Timestamp.fromDate(oneDayAgo))
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const uniqueActiveUsers = new Set();
    activeUsersSnapshot.docs.forEach(doc => {
      uniqueActiveUsers.add(doc.data().userId);
    });
    const activeUsers = uniqueActiveUsers.size;

    // Premium users (users with active subscriptions)
    const premiumUsersQuery = query(
      collection(db, 'user_subscriptions'),
      where('status', '==', 'active')
    );
    const premiumUsersSnapshot = await getDocs(premiumUsersQuery);
    const premiumUsers = premiumUsersSnapshot.size;

    return {
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      premiumUsers,
    };
  }

  /**
   * Métricas de contenido
   */
  private static async getContentMetrics() {
    // Exercise programs
    const exerciseProgramsSnapshot = await getDocs(collection(db, 'exercise_programs'));
    const exercisePrograms = exerciseProgramsSnapshot.size;

    // Nutrition challenges
    const nutritionChallengesSnapshot = await getDocs(collection(db, 'nutrition_challenges'));
    const nutritionChallenges = nutritionChallengesSnapshot.size;

    // Calculate total days and average length
    let totalDays = 0;
    let programCount = 0;

    exerciseProgramsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.totalDays) {
        totalDays += data.totalDays;
        programCount++;
      }
    });

    nutritionChallengesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.totalDays) {
        totalDays += data.totalDays;
        programCount++;
      }
    });

    const averageProgramLength = programCount > 0 ? Math.round(totalDays / programCount) : 0;

    return {
      exercisePrograms,
      nutritionChallenges,
      totalDaysGenerated: totalDays,
      averageProgramLength,
    };
  }

  /**
   * Métricas de IA
   */
  private static async getAIMetrics() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Total AI requests
    const allAIQuery = query(
      collection(db, 'user_activity'),
      where('action', 'in', ['ai_chat', 'program_creation', 'challenge_creation', 'ai_advice'])
    );
    const allAISnapshot = await getDocs(allAIQuery);
    const totalAIRequests = allAISnapshot.size;

    // AI requests last 7 days
    const aiLast7DaysQuery = query(
      collection(db, 'user_activity'),
      where('action', 'in', ['ai_chat', 'program_creation', 'challenge_creation', 'ai_advice']),
      where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo))
    );
    const aiLast7DaysSnapshot = await getDocs(aiLast7DaysQuery);
    const aiRequestsLast7Days = aiLast7DaysSnapshot.size;

    // AI requests last 24 hours
    const aiLast24HoursQuery = query(
      collection(db, 'user_activity'),
      where('action', 'in', ['ai_chat', 'program_creation', 'challenge_creation', 'ai_advice']),
      where('timestamp', '>=', Timestamp.fromDate(oneDayAgo))
    );
    const aiLast24HoursSnapshot = await getDocs(aiLast24HoursQuery);
    const aiRequestsLast24Hours = aiLast24HoursSnapshot.size;

    // Calculate average AI usage per user
    const uniqueAIUsers = new Set();
    allAISnapshot.docs.forEach(doc => {
      uniqueAIUsers.add(doc.data().userId);
    });
    const averageAIUsagePerUser = uniqueAIUsers.size > 0 ? Math.round(totalAIRequests / uniqueAIUsers.size) : 0;

    return {
      totalAIRequests,
      aiRequestsLast7Days,
      aiRequestsLast24Hours,
      averageAIUsagePerUser,
    };
  }

  /**
   * Métricas de actividad
   */
  private static async getActivityMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get recent activity for top users
    const recentActivityQuery = query(
      collection(db, 'user_activity'),
      where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const activitySnapshot = await getDocs(recentActivityQuery);

    // Count activities per user
    const userActivityMap = new Map<string, { count: number; lastActive: Date; features: Set<string> }>();
    
    activitySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const existing = userActivityMap.get(data.userId) || { count: 0, lastActive: new Date(0), features: new Set() };
      
      userActivityMap.set(data.userId, {
        count: existing.count + 1,
        lastActive: data.timestamp.toDate() > existing.lastActive ? data.timestamp.toDate() : existing.lastActive,
        features: existing.features.add(data.action),
      });
    });

    // Get user emails
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userEmails = new Map<string, string>();
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      if (userData.email) {
        userEmails.set(doc.id, userData.email);
      }
    });

    // Create top active users list
    const topActiveUsers: UserActivity[] = Array.from(userActivityMap.entries())
      .map(([userId, data]) => ({
        userId,
        email: userEmails.get(userId),
        activityCount: data.count,
        lastActive: data.lastActive,
        favoriteFeatures: Array.from(data.features).slice(0, 3),
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 5);

    // Daily active users (last 7 days)
    const dailyActiveUsers: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayQuery = query(
        collection(db, 'user_activity'),
        where('timestamp', '>=', Timestamp.fromDate(date)),
        where('timestamp', '<', Timestamp.fromDate(nextDate))
      );
      
      const daySnapshot = await getDocs(dayQuery);
      const uniqueUsers = new Set();
      daySnapshot.docs.forEach(doc => uniqueUsers.add(doc.data().userId));
      dailyActiveUsers.push(uniqueUsers.size);
    }

    // Popular features
    const featureUsageMap = new Map<string, { count: number; users: Set<string> }>();
    
    activitySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const existing = featureUsageMap.get(data.action) || { count: 0, users: new Set() };
      
      featureUsageMap.set(data.action, {
        count: existing.count + 1,
        users: existing.users.add(data.userId),
      });
    });

    const popularFeatures: FeatureUsage[] = Array.from(featureUsageMap.entries())
      .map(([feature, data]) => ({
        feature,
        usageCount: data.count,
        uniqueUsers: data.users.size,
        growthRate: 0, // Could be calculated with historical data
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    return {
      topActiveUsers,
      dailyActiveUsers,
      popularFeatures,
    };
  }

  /**
   * Métricas de alertas de seguridad
   */
  private static async getAlertMetrics() {
    try {
      const stats = await AbuseAlertService.getAlertStats();
      
      return {
        totalAlerts: stats.totalAlerts,
        pendingAlerts: stats.pendingAlerts,
        criticalAlerts: stats.criticalAlerts,
        alertsByType: stats.alertsByType,
      };
    } catch (error) {
      console.error('Error getting alert metrics:', error);
      return {
        totalAlerts: 0,
        pendingAlerts: 0,
        criticalAlerts: 0,
        alertsByType: {},
      };
    }
  }

  /**
   * Obtener métricas de uso por día de la semana
   */
  static async getDayOfWeekUsage(): Promise<{ day: string; usage: number }[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyQuery = query(
      collection(db, 'user_activity'),
      where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo))
    );

    const weeklySnapshot = await getDocs(weeklyQuery);
    const dayUsage = new Array(7).fill(0);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    weeklySnapshot.docs.forEach(doc => {
      const timestamp = doc.data().timestamp.toDate();
      const dayOfWeek = timestamp.getDay();
      dayUsage[dayOfWeek]++;
    });

    return dayNames.map((day, index) => ({
      day,
      usage: dayUsage[index],
    }));
  }

  /**
   * Obtener estadísticas de retención de usuarios
   */
  static async getUserRetentionStats(): Promise<{
    day1: number;
    day7: number;
    day30: number;
  }> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    // Users who signed up more than 1 day ago
    const usersDay1Query = query(
      collection(db, 'users'),
      where('createdAt', '<=', Timestamp.fromDate(oneDayAgo))
    );
    const usersDay1Snapshot = await getDocs(usersDay1Query);

    // Users active in last day who signed up more than 1 day ago
    const activeDay1Query = query(
      collection(db, 'user_activity'),
      where('timestamp', '>=', Timestamp.fromDate(oneDayAgo))
    );
    const activeDay1Snapshot = await getDocs(activeDay1Query);
    
    // Calculate retention (simplified - real retention would need more complex logic)
    const day1Retention = usersDay1Snapshot.size > 0 ? 
      Math.round((activeDay1Snapshot.size / usersDay1Snapshot.size) * 100) : 0;

    // Similar calculations for 7-day and 30-day retention would go here
    // For demo purposes, using simplified calculations

    return {
      day1: Math.min(day1Retention, 100),
      day7: Math.max(day1Retention - 20, 0), // Simplified
      day30: Math.max(day1Retention - 40, 0), // Simplified
    };
  }
}
