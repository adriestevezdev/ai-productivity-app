// Centralized configuration for Pro features

export enum ProFeature {
  // AI Features
  AI_TASK_CREATION = 'ai_task_creation',
  AI_TASK_BREAKDOWN = 'ai_task_breakdown',
  AI_INSIGHTS = 'ai_insights',
  AI_GOAL_BREAKDOWN = 'ai_goal_breakdown',
  
  // Advanced Features
  UNLIMITED_TASKS = 'unlimited_tasks',
  UNLIMITED_GOALS = 'unlimited_goals',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  CUSTOM_CATEGORIES = 'custom_categories',
  
  // Integrations
  CALENDAR_SYNC = 'calendar_sync',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  WEBHOOK_INTEGRATIONS = 'webhook_integrations',
  
  // Export Features
  PDF_EXPORT = 'pdf_export',
  CSV_EXPORT = 'csv_export',
  
  // Gamification
  ACHIEVEMENTS = 'achievements',
  LEADERBOARDS = 'leaderboards',
}

// Feature limits for free users
export const FREE_TIER_LIMITS = {
  MAX_TASKS: 50,
  MAX_GOALS: 5,
  MAX_CATEGORIES: 3,
  MAX_AI_TASKS_PER_DAY: 3,
  MAX_AI_INSIGHTS_PER_WEEK: 1,
}

// Helper to check if a feature requires Pro
export function isProFeature(_feature: ProFeature): boolean {
  // All features in the enum require Pro
  return true
}

// Helper to get feature display info
export function getFeatureInfo(feature: ProFeature): {
  name: string
  description: string
  icon?: string
} {
  const featureInfo: Record<ProFeature, { name: string; description: string; icon?: string }> = {
    [ProFeature.AI_TASK_CREATION]: {
      name: 'AI Task Creation',
      description: 'Create tasks from natural language descriptions',
      icon: '🤖'
    },
    [ProFeature.AI_TASK_BREAKDOWN]: {
      name: 'AI Task Breakdown',
      description: 'Automatically break down complex tasks into subtasks',
      icon: '📋'
    },
    [ProFeature.AI_INSIGHTS]: {
      name: 'AI Productivity Insights',
      description: 'Get personalized productivity recommendations',
      icon: '📊'
    },
    [ProFeature.AI_GOAL_BREAKDOWN]: {
      name: 'AI Goal Planning',
      description: 'Create SMART action plans for your goals',
      icon: '🎯'
    },
    [ProFeature.UNLIMITED_TASKS]: {
      name: 'Unlimited Tasks',
      description: 'Create unlimited tasks (Free: 50 tasks)',
      icon: '♾️'
    },
    [ProFeature.UNLIMITED_GOALS]: {
      name: 'Unlimited Goals',
      description: 'Set unlimited goals (Free: 5 goals)',
      icon: '🎯'
    },
    [ProFeature.ADVANCED_ANALYTICS]: {
      name: 'Advanced Analytics',
      description: 'Detailed productivity metrics and trends',
      icon: '📈'
    },
    [ProFeature.CUSTOM_CATEGORIES]: {
      name: 'Custom Categories',
      description: 'Create unlimited custom categories',
      icon: '🏷️'
    },
    [ProFeature.CALENDAR_SYNC]: {
      name: 'Calendar Sync',
      description: 'Sync with Google Calendar and Outlook',
      icon: '📅'
    },
    [ProFeature.EMAIL_NOTIFICATIONS]: {
      name: 'Email Notifications',
      description: 'Get email reminders and daily digests',
      icon: '📧'
    },
    [ProFeature.WEBHOOK_INTEGRATIONS]: {
      name: 'Webhook Integrations',
      description: 'Connect with Zapier, Make, and more',
      icon: '🔗'
    },
    [ProFeature.PDF_EXPORT]: {
      name: 'PDF Export',
      description: 'Export tasks and reports as PDF',
      icon: '📄'
    },
    [ProFeature.CSV_EXPORT]: {
      name: 'CSV Export',
      description: 'Export data for external analysis',
      icon: '📊'
    },
    [ProFeature.ACHIEVEMENTS]: {
      name: 'Achievements',
      description: 'Unlock badges and track milestones',
      icon: '🏆'
    },
    [ProFeature.LEADERBOARDS]: {
      name: 'Leaderboards',
      description: 'Compete with friends and colleagues',
      icon: '🥇'
    }
  }
  
  return featureInfo[feature] || {
    name: 'Pro Feature',
    description: 'This feature requires a Pro subscription'
  }
}