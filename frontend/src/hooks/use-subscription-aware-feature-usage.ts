import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ProFeature, FREE_TIER_LIMITS } from '@/lib/features';

interface FeatureUsage {
  feature: ProFeature;
  count: number;
  date: string;
}

export function useSubscriptionAwareFeatureUsage(feature: ProFeature) {
  const { has } = useAuth();
  const [usage, setUsage] = useState<number>(0);
  const [canUse, setCanUse] = useState<boolean>(true);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check user's subscription status
  useEffect(() => {
    async function checkSubscription() {
      if (!has) {
        setIsPro(false);
        setIsLoading(false);
        return;
      }
      
      try {
        const hasProPlan = await has({ plan: 'pro' });
        setIsPro(hasProPlan);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsPro(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSubscription();
  }, [has]);
  
  // Load usage from localStorage
  useEffect(() => {
    const loadUsage = () => {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `feature_usage_${feature}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data: FeatureUsage = JSON.parse(stored);
        
        // Reset if it's a new day
        if (data.date !== today) {
          localStorage.setItem(storageKey, JSON.stringify({
            feature,
            count: 0,
            date: today
          }));
          setUsage(0);
        } else {
          setUsage(data.count);
        }
      } else {
        // Initialize
        localStorage.setItem(storageKey, JSON.stringify({
          feature,
          count: 0,
          date: today
        }));
        setUsage(0);
      }
    };
    
    loadUsage();
  }, [feature]);
  
  // Check if user can use feature based on subscription and limits
  useEffect(() => {
    const checkUsageLimit = () => {
      // Pro users have unlimited access to all features
      if (isPro) {
        setCanUse(true);
        return;
      }
      
      // Free users have limits based on feature type
      switch (feature) {
        case ProFeature.AI_TASK_CREATION:
          setCanUse(usage < FREE_TIER_LIMITS.MAX_AI_TASKS_PER_DAY);
          break;
        case ProFeature.AI_INSIGHTS:
          // For AI insights, only pro users can access
          setCanUse(false);
          break;
        default:
          setCanUse(true);
      }
    };
    
    if (!isLoading) {
      checkUsageLimit();
    }
  }, [usage, feature, isPro, isLoading]);
  
  const incrementUsage = () => {
    // Pro users don't need usage tracking for unlimited features
    if (isPro) {
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `feature_usage_${feature}`;
    const newCount = usage + 1;
    
    localStorage.setItem(storageKey, JSON.stringify({
      feature,
      count: newCount,
      date: today
    }));
    
    setUsage(newCount);
  };
  
  const getRemainingUses = () => {
    // Pro users have unlimited usage
    if (isPro) {
      return -1; // -1 indicates unlimited
    }
    
    switch (feature) {
      case ProFeature.AI_TASK_CREATION:
        return Math.max(0, FREE_TIER_LIMITS.MAX_AI_TASKS_PER_DAY - usage);
      case ProFeature.AI_INSIGHTS:
        return 0; // Free users can't access AI insights
      default:
        return 0;
    }
  };
  
  const getUsageMessage = () => {
    if (isLoading) {
      return "Checking subscription status...";
    }
    
    if (isPro) {
      return "Unlimited (Pro plan)";
    }
    
    const remaining = getRemainingUses();
    const limit = getFeatureLimit();
    
    if (remaining === 0) {
      return `${limit} AI tasks remaining today (Free plan)`;
    }
    
    return `${remaining} AI tasks remaining today (Free plan)`;
  };
  
  const getFeatureLimit = () => {
    switch (feature) {
      case ProFeature.AI_TASK_CREATION:
        return FREE_TIER_LIMITS.MAX_AI_TASKS_PER_DAY;
      default:
        return 0;
    }
  };
  
  return {
    usage,
    canUse,
    incrementUsage,
    remainingUses: getRemainingUses(),
    isPro,
    isLoading,
    usageMessage: getUsageMessage()
  };
}